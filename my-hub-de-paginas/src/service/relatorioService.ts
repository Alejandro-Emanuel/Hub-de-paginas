import { prisma } from "@/lib/prisma";

export async function buscarRelatoriosUnificados() {
  // Buscar dados das tabelas reais do banco
  const [emprestimosDB, reservasDB, multasDB] = await Promise.all([
    prisma.emprestimo.findMany({
      include: {
        livro: true,
        usuario: { include: { perfil: true } },
        devolucao: true,
      },
    }),
    prisma.reserva.findMany({
      include: {
        livro: true,
        usuario: { include: { perfil: true } },
      },
    }),
    prisma.multa.findMany({
      include: {
        devolucao: {
          include: {
            emprestimo: {
              include: {
                livro: true,
                usuario: { include: { perfil: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  // Mapear para o formato que a interface relatorios.tsx espera
  const emprestimosFormatados = emprestimosDB.map((e) => {
    let status = "Ativo";
    if (e.devolucao) {
      status = "Devolvido";
    } else {
      const hoje = new Date();
      if (new Date(e.data_prevista_devolucao) < hoje) {
        status = "Atrasado";
      }
    }

    return {
      id: e.id,
      tipo: "emprestimos" as const,
      descricao: (e.livro as unknown as { nome: string }).nome,
      responsavel: e.usuario.perfil.nome,
      data: e.data_emprestimo.toISOString().split("T")[0],
      status,
    };
  });

  const reservasFormatadas = reservasDB.map((r) => ({
    id: r.id,
    tipo: "reservas" as const,
    descricao: (r.livro as unknown as { nome: string }).nome,
    responsavel: r.usuario.perfil.nome,
    data: r.data_reserva.toISOString().split("T")[0],
    status: r.disponivel ? "Confirmada" : "Pendente",
  }));

  const multasFormatadas = multasDB.map((m) => ({
    id: m.id,
    tipo: "multas" as const,
    descricao: (m.devolucao.emprestimo.livro as unknown as { nome: string }).nome,
    responsavel: m.devolucao.emprestimo.usuario.perfil.nome,
    data: m.devolucao.data_devolucao.toISOString().split("T")[0],
    status: m.status,
  }));

  // Retorna tudo unificado
  return [
    ...emprestimosFormatados,
    ...reservasFormatadas,
    ...multasFormatadas,
  ];
}
