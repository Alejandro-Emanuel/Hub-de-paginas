import { prisma } from "@/lib/prisma";

export async function obterMétricasDashboard() {
  try {
    // Executa todas as contagens em paralelo no banco
    const [
      totalLivros,
      totalEmprestimosAtivos,
      totalReservas,
      totalMultasPendentes,
    ] = await Promise.all([
      prisma.cadastro_livro.count(),
      prisma.emprestimo.count(),
      prisma.reserva.count(),
      prisma.multa.count({
        where: { status: "Pendente" },
      }),
    ]);

    return {
      totalLivros,
      totalEmprestimosAtivos,
      totalReservas,
      totalMultasPendentes,
    };
  } catch (error) {
    console.error("Erro ao buscar métricas reais do dashboard:", error);
    throw new Error("Erro ao carregar dados do dashboard.");
  }
}
