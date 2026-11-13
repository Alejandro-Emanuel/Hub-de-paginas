import { prisma } from "@/lib/prisma";

export async function buscarRelatoriosUnificados() {
  // Buscar dados das tabelas reais do banco em paralelo
  const [emprestimosDB, reservasDB, multasDB] = await Promise.all([
    prisma.emprestimo.findMany({
      include: {
        cadastro_livro: true,
        usuario: { include: { perfil: true } },
        devolucao: true,
      },
    }),
    prisma.reserva.findMany({
      include: {
        cadastro_livro: true,
        usuario: { include: { perfil: true } },
      },
    }),
    prisma.multa.findMany({
      include: {
        devolucao: {
          include: {
            emprestimo: {
              include: {
                cadastro_livro: true,
                usuario: { include: { perfil: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  // Mapear empréstimos para o formato unificado
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
      descricao: e.cadastro_livro.nome,
      responsavel: e.usuario.perfil.nome,
      data: new Date(e.data_emprestimo).toISOString().split("T")[0],
      status,
    };
  });

  // Mapear reservas para o formato unificado
  const reservasFormatadas = reservasDB.map((r) => ({
    id: r.id,
    tipo: "reservas" as const,
    descricao: r.cadastro_livro.nome,
    responsavel: r.usuario.perfil.nome,
    data: new Date(r.data_reserva).toISOString().split("T")[0],
    status: r.disponivel ? "Confirmada" : "Pendente",
  }));

  // Mapear multas para o formato unificado
  const multasFormatadas = multasDB.map((m) => ({
    id: m.id,
    tipo: "multas" as const,
    descricao: m.devolucao.emprestimo.cadastro_livro.nome,
    responsavel: m.devolucao.emprestimo.usuario.perfil.nome,
    data: m.devolucao.data_devolucao
      ? new Date(m.devolucao.data_devolucao).toISOString().split("T")[0]
      : "",
    status: m.status,
  }));

  // Retorna tudo unificado
  return [
    ...emprestimosFormatados,
    ...reservasFormatadas,
    ...multasFormatadas,
  ];
}
