import { prisma } from "@/lib/prisma";

export async function buscarMultas() {
  const multas = await prisma.multa.findMany({
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

    return {
      id: m.id,
      usuario: perfil.nome,
      email: perfil.email,
      livro: emprestimo.cadastro_livro.nome,
      motivo:
        m.dias_atraso > 0
          ? `Atraso na devolução (${m.dias_atraso} dias)`
          : "multa administrativa",
      valor: Number(m.valor),
      vencimento: new Date(emprestimo.data_prevista_devolucao)
        .toISOString()
        .split("T")[0],
      status: m.status as "Pendente" | "Paga" | "Cancelada",
    };
  });
}

export async function atualizarStatusMulta(id: number, status: string) {
  const multaAtualizada = await prisma.multa.update({
    where: { id },
    data: { status },
  });

  return multaAtualizada;
}
