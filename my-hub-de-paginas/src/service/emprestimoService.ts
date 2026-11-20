import { prisma } from "@/lib/prisma";

const MAX_RENOVACOES = 3;
const DIAS_RENOVACAO = 7;

export interface RenovarEmprestimoInput {
  emprestimoId: number;
}

export async function listarEmprestimosAtivos(usuarioId: number) {
  try {
    const emprestimos = await prisma.emprestimo.findMany({
      where: {
        usuario_id: usuarioId,
      },
    });

    return emprestimos;
  } catch (error) {
    console.error("Erro ao buscar empréstimos ativos:", error);
    throw new Error("Não foi possível carregar os empréstimos.");
  }
}

export async function renovarEmprestimo(
  perfilId: number,
  emprestimoId: number,
) {
  const usuario = await prisma.usuario.findUnique({
    where: { perfil_id: perfilId },
  });
  if (!usuario) throw new Error("Usuário não encontrado.");

  const emprestimo = await prisma.emprestimo.findUnique({
    where: { id: emprestimoId },
    include: { devolucao: true, renovacao: true },
  });

  if (!emprestimo || emprestimo.usuario_id !== usuario.id) {
    throw new Error("Empréstimo não encontrado.");
  }
  if (emprestimo.devolucao) {
    throw new Error("Este livro já foi devolvido.");
  }
  if (emprestimo.renovacao.length >= MAX_RENOVACOES) {
    throw new Error(`Limite de ${MAX_RENOVACOES} renovações atingido.`);
  }

  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);
  if (emprestimo.data_prevista_devolucao < hoje) {
    throw new Error("Empréstimo em atraso não pode ser renovado.");
  }

  const novaData = new Date(emprestimo.data_prevista_devolucao);
  novaData.setUTCDate(novaData.getUTCDate() + DIAS_RENOVACAO);

  await prisma.$transaction([
    prisma.renovacao.create({
      data: { emprestimo_id: emprestimoId, nova_data_devolucao: novaData },
    }),
    prisma.emprestimo.update({
      where: { id: emprestimoId },
      data: { data_prevista_devolucao: novaData },
    }),
  ]);

  return { mensagem: "Empréstimo renovado com sucesso!" };
}
