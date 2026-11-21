import { prisma } from "@/lib/prisma";
import { estimarMulta } from "@/utils/multa";

export interface RegistrarEmprestimoInput {
  usuarioId: number;
  livroId: number;
  dias: number;
  gestaoId?: number;
}

export interface RenovarEmprestimoInput {
  emprestimoId: number;
  perfilIdSolicitante?: number;
}

export interface RegistrarDevolucaoInput {
  emprestimoId: number;
  gestaoId: number;
}

const LIMITE_RENOVACOES = 2;
const DIAS_RENOVACAO = 7;
const DIA_EM_MS = 86_400_000;

function formatarDataISO(data: Date | string | null | undefined): string | null {
  if (!data) return null;
  const parsed = new Date(data);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function inicioDiaUTC(data: Date): number {
  return Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate());
}

function diasDeAtraso(prevista: Date, referencia: Date = new Date()): number {
  const diffDias = Math.floor(
    (inicioDiaUTC(referencia) - inicioDiaUTC(prevista)) / DIA_EM_MS,
  );
  return Math.max(0, diffDias);
}

async function verificarMultaPendenteUsuario(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  usuarioId: number,
) {
  const multaPendente = await tx.multa.findFirst({
    where: {
      status: "Pendente",
      devolucao: {
        emprestimo: {
          usuario_id: usuarioId,
        },
      },
    },
    select: { id: true },
  });

  if (multaPendente) {
    throw new Error(
      "Não é possível concluir a operação: o usuário possui multa pendente.",
    );
  }
}

async function resolverGestaoId(gestaoIdInformado?: number): Promise<number> {
  if (gestaoIdInformado && Number.isInteger(gestaoIdInformado) && gestaoIdInformado > 0) {
    const gestaoPorId = await prisma.gestao.findUnique({
      where: { id: gestaoIdInformado },
      select: { id: true },
    });
    if (gestaoPorId) return gestaoPorId.id;
  }

  const primeiraGestao = await prisma.gestao.findFirst({
    orderBy: { id: "asc" },
    select: { id: true },
  });

  if (!primeiraGestao) {
    throw new Error(
      "Nenhum gestor encontrado no banco para vincular ao empréstimo.",
    );
  }

  return primeiraGestao.id;
}

export async function registrarEmprestimo({
  usuarioId,
  livroId,
  dias,
  gestaoId,
}: RegistrarEmprestimoInput) {
  if (!Number.isInteger(dias) || dias <= 0) {
    throw new Error("A quantidade de dias do empréstimo deve ser maior que zero.");
  }

  const gestaoFinalId = await resolverGestaoId(gestaoId);

  const criado = await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true },
    });
    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }

    const livro = await tx.cadastro_livro.findUnique({
      where: { id: livroId },
      select: { id: true, nome: true },
    });
    if (!livro) {
      throw new Error("Livro não encontrado.");
    }

    await verificarMultaPendenteUsuario(tx, usuarioId);

    const emprestimoEmAberto = await tx.emprestimo.findFirst({
      where: {
        livro_id: livroId,
        devolucao: { is: null },
      },
      select: { id: true },
    });
    if (emprestimoEmAberto) {
      throw new Error("Este livro já possui um empréstimo ativo no momento.");
    }

    const dataEmprestimo = new Date();
    const dataPrevistaDevolucao = new Date(
      inicioDiaUTC(dataEmprestimo) + dias * DIA_EM_MS,
    );

    return tx.emprestimo.create({
      data: {
        usuario_id: usuarioId,
        livro_id: livroId,
        gestao_id: gestaoFinalId,
        data_emprestimo: dataEmprestimo,
        data_prevista_devolucao: dataPrevistaDevolucao,
      },
      include: {
        cadastro_livro: true,
        usuario: {
          include: { perfil: true },
        },
      },
    });
  });

  return {
    mensagem: "Empréstimo registrado com sucesso!",
    emprestimo: {
      id: criado.id,
      usuario: criado.usuario.perfil.nome,
      livro: criado.cadastro_livro.nome,
      dataEmprestimo: formatarDataISO(criado.data_emprestimo) ?? "",
      dataPrevistaDevolucao:
        formatarDataISO(criado.data_prevista_devolucao) ?? "",
      dataDevolucao: null,
      multa: null,
    },
  };
}

export async function listarEmprestimos(
  usuarioId?: number,
  apenasAtivos = false,
) {
  try {
    const emprestimos = await prisma.emprestimo.findMany({
      where: {
        ...(usuarioId ? { usuario_id: usuarioId } : {}),
        ...(apenasAtivos ? { devolucao: { is: null } } : {}),
      },
      include: {
        cadastro_livro: true,
        usuario: {
          include: { perfil: true },
        },
        devolucao: {
          include: { multa: true },
        },
      },
      orderBy: {
        data_emprestimo: "desc",
      },
    });

    return emprestimos.map((item) => ({
      id: item.id,
      usuario: item.usuario?.perfil?.nome ?? "Usuário",
      livro: item.cadastro_livro?.nome ?? "Livro",
      dataEmprestimo: formatarDataISO(item.data_emprestimo) ?? "",
      dataPrevistaDevolucao:
        formatarDataISO(item.data_prevista_devolucao) ?? "",
      dataDevolucao: formatarDataISO(item.devolucao?.data_devolucao),
      multa: item.devolucao?.multa
        ? {
            valor: Number(item.devolucao.multa.valor),
            diasAtraso: item.devolucao.multa.dias_atraso,
            status: item.devolucao.multa.status,
          }
        : null,
    }));
  } catch (error) {
    console.error("Erro ao listar empréstimos:", error);
    throw new Error("Não foi possível carregar os empréstimos.");
  }
}

export async function listarEmprestimosAtivos(usuarioId: number) {
  return listarEmprestimos(usuarioId, true);
}

export async function registrarDevolucao({
  emprestimoId,
  gestaoId,
}: RegistrarDevolucaoInput) {
  const resultado = await prisma.$transaction(async (tx) => {
    const emprestimo = await tx.emprestimo.findUnique({
      where: { id: emprestimoId },
      select: {
        id: true,
        data_prevista_devolucao: true,
        devolucao: { select: { id: true } },
      },
    });

    if (!emprestimo) {
      throw new Error("Empréstimo não encontrado.");
    }
    if (emprestimo.devolucao) {
      throw new Error("Este empréstimo já foi devolvido.");
    }

    const agora = new Date();
    const atraso = diasDeAtraso(emprestimo.data_prevista_devolucao, agora);
    const valorMulta = Number(estimarMulta(atraso).toFixed(2));

    const devolucao = await tx.devolucao.create({
      data: {
        emprestimo_id: emprestimoId,
        gestao_id: gestaoId,
        data_devolucao: agora,
        ...(atraso > 0
          ? {
              multa: {
                create: {
                  valor: valorMulta,
                  dias_atraso: atraso,
                  status: "Pendente",
                },
              },
            }
          : {}),
      },
      include: { multa: true },
    });

    return devolucao.multa
      ? {
          valor: Number(devolucao.multa.valor),
          diasAtraso: devolucao.multa.dias_atraso,
          status: devolucao.multa.status,
        }
      : null;
  });

  return {
    mensagem: resultado
      ? `Devolução registrada com ${resultado.diasAtraso} dia(s) de atraso. Multa gerada.`
      : "Devolução registrada com sucesso!",
    multa: resultado,
  };
}

export async function renovarEmprestimo({
  emprestimoId,
  perfilIdSolicitante,
}: RenovarEmprestimoInput) {
  return prisma.$transaction(async (tx) => {
    const emprestimoAtual = await tx.emprestimo.findUnique({
      where: { id: emprestimoId },
      include: {
        devolucao: true,
        renovacao: true,
        usuario: true,
      },
    });

    if (!emprestimoAtual) {
      throw new Error("Empréstimo não encontrado.");
    }

    if (emprestimoAtual.devolucao) {
      throw new Error("Não é possível renovar um empréstimo já devolvido.");
    }

    if (perfilIdSolicitante !== undefined) {
      const usuarioSolicitante = await tx.usuario.findUnique({
        where: { perfil_id: perfilIdSolicitante },
        select: { id: true },
      });

      if (
        !usuarioSolicitante ||
        emprestimoAtual.usuario_id !== usuarioSolicitante.id
      ) {
        throw new Error("Você não tem permissão para renovar este empréstimo.");
      }
    }

    await verificarMultaPendenteUsuario(tx, emprestimoAtual.usuario_id);

    const atrasoAtual = diasDeAtraso(emprestimoAtual.data_prevista_devolucao);
    if (atrasoAtual > 0) {
      throw new Error(
        "Não é possível renovar um empréstimo que já está em atraso.",
      );
    }

    if (emprestimoAtual.renovacao.length >= LIMITE_RENOVACOES) {
      throw new Error(
        `Limite de ${LIMITE_RENOVACOES} renovações atingido para este empréstimo.`,
      );
    }

    const novaDataDevolucao = new Date(
      inicioDiaUTC(emprestimoAtual.data_prevista_devolucao) +
        DIAS_RENOVACAO * DIA_EM_MS,
    );

    const emprestimoAtualizado = await tx.emprestimo.update({
      where: { id: emprestimoId },
      data: {
        data_prevista_devolucao: novaDataDevolucao,
      },
    });

    const registroRenovacao = await tx.renovacao.create({
      data: {
        emprestimo_id: emprestimoId,
        data_renovacao: new Date(),
        nova_data_devolucao: novaDataDevolucao,
      },
    });

    return {
      mensagem: "Empréstimo renovado com sucesso!",
      emprestimo: emprestimoAtualizado,
      renovacao: registroRenovacao,
    };
  });
}
