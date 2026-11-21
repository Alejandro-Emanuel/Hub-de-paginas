import { prisma } from "@/lib/prisma";

export type StatusMulta = "Pendente" | "Paga" | "Cancelada";

const STATUS_VALIDOS: StatusMulta[] = ["Pendente", "Paga", "Cancelada"];

function podeTransicionar(atual: StatusMulta, proximo: StatusMulta): boolean {
  if (atual === proximo) return true;
  if (atual === "Pendente") return proximo === "Paga" || proximo === "Cancelada";
  // Impede reabrir multa já paga ou cancelada
  return false;
}

export async function buscarMultas() {
  const multas = await prisma.multa.findMany({
    orderBy: { id: "desc" },
    include: {
      devolucao: {
        include: {
          emprestimo: {
            include: {
              cadastro_livro: true,
              usuario: {
                include: {
                  perfil: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return multas.map((m) => {
    const emprestimo = m.devolucao.emprestimo;
    const perfil = emprestimo.usuario.perfil;
    const livro = emprestimo.cadastro_livro as unknown as { nome: string };

    return {
      id: m.id,
      usuario: perfil.nome,
      email: perfil.email,
      livro: livro.nome,
      motivo:
        m.dias_atraso > 0
          ? `Atraso na devolução (${m.dias_atraso} ${m.dias_atraso === 1 ? "dia" : "dias"})`
          : "Multa administrativa",
      valor: Number(m.valor),
      vencimento: emprestimo.data_prevista_devolucao
        .toISOString()
        .split("T")[0],
      status: m.status as StatusMulta,
    };
  });
}

export async function buscarMultasPorPerfil(perfilId: number) {
  const usuario = await prisma.usuario.findFirst({
    where: { perfil_id: perfilId },
  });

  if (!usuario) return [];

  const multas = await prisma.multa.findMany({
    where: {
      status: { in: ["Pendente", "Paga"] },
      devolucao: {
        emprestimo: {
          usuario_id: usuario.id,
        },
      },
    },
    orderBy: { id: "desc" },
    include: {
      devolucao: {
        include: {
          emprestimo: {
            include: {
              cadastro_livro: true,
            },
          },
        },
      },
    },
  });

  return multas.map((m) => {
    const devolucao = m.devolucao;
    const emprestimo = devolucao.emprestimo;
    const livro = emprestimo.cadastro_livro as unknown as {
      nome: string;
      autor?: string;
    };

    return {
      id: m.id,
      livro: livro.nome,
      autor: livro.autor ?? "Autor não informado",
      motivo:
        m.dias_atraso > 0
          ? `Atraso na devolução (${m.dias_atraso} ${m.dias_atraso === 1 ? "dia" : "dias"})`
          : "Multa administrativa",
      valor: Number(m.valor),
      dataPrevistaDevolucao: emprestimo.data_prevista_devolucao
        .toISOString()
        .split("T")[0],
      dataDevolucao: devolucao.data_devolucao.toISOString().split("T")[0],
      status: m.status as "Pendente" | "Paga",
    };
  });
}

export async function atualizarStatusMulta(id: number, novoStatus: string) {
  if (!STATUS_VALIDOS.includes(novoStatus as StatusMulta)) {
    return {
      ok: false as const,
      httpStatus: 400,
      mensagem: "Status inválido. Use Pendente, Paga ou Cancelada.",
    };
  }

  const existente = await prisma.multa.findUnique({ where: { id } });
  if (!existente) {
    return {
      ok: false as const,
      httpStatus: 404,
      mensagem: "Multa não encontrada.",
    };
  }

  const statusAtual = existente.status as StatusMulta;
  const destino = novoStatus as StatusMulta;

  if (!podeTransicionar(statusAtual, destino)) {
    return {
      ok: false as const,
      httpStatus: 409,
      mensagem: `Não é possível alterar uma multa de "${statusAtual}" para "${destino}".`,
    };
  }

  const multaAtualizada = await prisma.multa.update({
    where: { id },
    data: { status: destino },
  });

  return {
    ok: true as const,
    httpStatus: 200,
    multa: multaAtualizada,
  };
}

export async function registrarDevolucaoComMulta(
  emprestimoId: number,
  gestaoId: number,
  valorPorDia = 2.0,
) {
  return prisma.$transaction(async (tx) => {
    const emprestimo = await tx.emprestimo.findUnique({
      where: { id: emprestimoId },
      include: { devolucao: true },
    });

    if (!emprestimo) {
      throw new Error("Empréstimo não encontrado.");
    }

    if (emprestimo.devolucao) {
      throw new Error("Este empréstimo já foi devolvido.");
    }

    const agora = new Date();
    const prevista = new Date(emprestimo.data_prevista_devolucao);

    const hojeUTC = Date.UTC(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
    );
    const previstaUTC = Date.UTC(
      prevista.getFullYear(),
      prevista.getMonth(),
      prevista.getDate(),
    );

    const diffDias = Math.floor((hojeUTC - previstaUTC) / (1000 * 60 * 60 * 24));
    const diasAtraso = diffDias > 0 ? diffDias : 0;

    const devolucao = await tx.devolucao.create({
      data: {
        emprestimo_id: emprestimo.id,
        gestao_id: gestaoId,
        data_devolucao: agora,
      },
    });

    let multa = null;
    if (diasAtraso > 0) {
      const jaTemMulta = await tx.multa.findFirst({
        where: { devolucao_id: devolucao.id },
      });

      if (!jaTemMulta) {
        multa = await tx.multa.create({
          data: {
            devolucao_id: devolucao.id,
            dias_atraso: diasAtraso,
            valor: Number((diasAtraso * valorPorDia).toFixed(2)),
            status: "Pendente",
          },
        });
      }
    }

    return { devolucao, multa, diasAtraso };
  });
}
