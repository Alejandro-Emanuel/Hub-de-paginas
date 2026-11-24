import { prisma } from "@/lib/prisma";
const VALOR_MULTA_POR_DIA = 10; 
const UM_DIA = 86_400_000;

export async function registrarDevolucao(
  emprestimoId: number,
  gestaoId: number,
) {
  const emprestimo = await prisma.emprestimo.findUnique({
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
  const hoje = new Date(
    Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()),
  );
  const diasAtraso = Math.max(
    0,
    Math.floor((hoje.getTime() - emprestimo.data_prevista_devolucao.getTime()) / UM_DIA),
  );

  const resultado = await prisma.$transaction(async (tx) => {
    const devolucao = await tx.devolucao.create({
      data: {
        emprestimo_id: emprestimoId,
        gestao_id: gestaoId,
        data_devolucao: hoje,
      },
    });

    if (diasAtraso === 0) return { multa: null };

    const multa = await tx.multa.create({
      data: {
        devolucao_id: devolucao.id,
        dias_atraso: diasAtraso,
        valor: diasAtraso * VALOR_MULTA_POR_DIA,
        status: "Pendente",
      },
    });

    return {
      multa: {
        valor: Number(multa.valor),
        diasAtraso: multa.dias_atraso,
        status: multa.status,
      },
    };
  });

  return { mensagem: "Devolução registrada com sucesso!", multa: resultado.multa };
}