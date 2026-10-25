import { prisma } from "@/lib/prisma";

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

export async function renovarEmprestimo({ emprestimoId }: RenovarEmprestimoInput) {
  const emprestimoAtual = await prisma.emprestimo.findUnique({
    where: { id: emprestimoId },
  });

  if (!emprestimoAtual) {
    throw new Error("Empréstimo não encontrado.");
  }

  const dataBase = new Date(emprestimoAtual.data_prevista_devolucao || new Date());
  dataBase.setDate(dataBase.getDate() + 7);

  // Atualiza no banco de dados
  const emprestimoAtualizado = await prisma.emprestimo.update({
    where: { id: emprestimoId },
    data: {
      data_prevista_devolucao: dataBase,
    },
  });

  return {
    mensagem: "Empréstimo renovado com sucesso!",
    emprestimo: emprestimoAtualizado,
  };
}
