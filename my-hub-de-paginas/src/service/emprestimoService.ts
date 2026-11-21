import { prisma } from "@/lib/prisma";

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

const LIMITE_RENOVACOES = 2;
const DIAS_RENOVACAO = 7;

function formatarDataISO(data: Date | string | null | undefined): string | null {
  if (!data) return null;
  const parsed = new Date(data);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

async function resolverGestaoId(gestaoIdInformado?: number): Promise<number> {
  if (gestaoIdInformado) {
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
    throw new Error("Nenhum gestor encontrado no banco para vincular ao empréstimo.");
  }

  return primeiraGestao.id;
}

export async function registrarEmprestimo({
  usuarioId,
  livroId,
  dias,
  gestaoId,
}: RegistrarEmprestimoInput) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true },
  });
  if (!usuario) {
    throw new Error("Usuário não encontrado.");
  }

  const livro = await prisma.cadastro_livro.findUnique({
    where: { id: livroId },
    select: { id: true, nome: true },
  });
  if (!livro) {
    throw new Error("Livro não encontrado.");
  }

  const emprestimoEmAberto = await prisma.emprestimo.findFirst({
    where: {
      livro_id: livroId,
      devolucao: { is: null },
    },
    select: { id: true },
  });
  if (emprestimoEmAberto) {
    throw new Error("Este livro já possui um empréstimo ativo no momento.");
  }

  const gestaoFinalId = await resolverGestaoId(gestaoId);

  const dataEmprestimo = new Date();
  const dataPrevistaDevolucao = new Date(dataEmprestimo);
  dataPrevistaDevolucao.setDate(dataPrevistaDevolucao.getDate() + dias);

  const criado = await prisma.emprestimo.create({
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

export async function listarEmprestimos(usuarioId?: number) {
  try {
    const emprestimos = await prisma.emprestimo.findMany({
      where: usuarioId ? { usuario_id: usuarioId } : undefined,
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
  return listarEmprestimos(usuarioId);
}

export async function renovarEmprestimo({
  emprestimoId,
  perfilIdSolicitante,
}: RenovarEmprestimoInput) {
  const emprestimoAtual = await prisma.emprestimo.findUnique({
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
    const usuarioSolicitante = await prisma.usuario.findUnique({
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

  if (emprestimoAtual.renovacao.length >= LIMITE_RENOVACOES) {
    throw new Error(
      `Limite de ${LIMITE_RENOVACOES} renovações atingido para este empréstimo.`,
    );
  }

  const baseAtual = new Date(
    emprestimoAtual.data_prevista_devolucao || new Date(),
  );
  const novaDataDevolucao = new Date(baseAtual);
  novaDataDevolucao.setDate(novaDataDevolucao.getDate() + DIAS_RENOVACAO);

  const resultado = await prisma.$transaction(async (tx) => {
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

    return { emprestimoAtualizado, registroRenovacao };
  });

  return {
    mensagem: "Empréstimo renovado com sucesso!",
    emprestimo: resultado.emprestimoAtualizado,
    renovacao: resultado.registroRenovacao,
  };
}
