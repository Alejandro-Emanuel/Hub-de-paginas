import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface OpcoesHistorico {
  perfilId: number;
  status?: string; // Ex: 'Devolvido', 'Ativo', 'Atrasado'
  pagina?: number;
  limite?: number;
}

export async function obterHistoricoUsuario({
  perfilId,
  status,
  pagina = 1,
  limite = 10,
}: OpcoesHistorico) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { perfil_id: perfilId },
      select: { id: true },
    });

    if (!usuario) return null;

    const skip = (pagina - 1) * limite;
    const hoje = new Date();

    const whereClause: Prisma.emprestimoWhereInput = {
      usuario_id: usuario.id,
    };

    // Aplica o filtro de status diretamente no Prisma para manter a paginação correta
    if (status) {
      const statusNorm = status.toLowerCase();
      if (statusNorm === "devolvido") {
        whereClause.devolucao = { isNot: null };
      } else if (statusNorm === "atrasado") {
        whereClause.devolucao = null;
        whereClause.data_prevista_devolucao = { lt: hoje };
      } else if (statusNorm === "ativo") {
        whereClause.devolucao = null;
        whereClause.OR = [
          { data_prevista_devolucao: { gte: hoje } },
        ];
      }
    }

    // Executa a busca paginada e a contagem total em paralelo já filtradas
    const [emprestimos, total] = await Promise.all([
      prisma.emprestimo.findMany({
        where: whereClause,
        include: {
          cadastro_livro: true,
          devolucao: true,
        },
        orderBy: {
          data_emprestimo: "desc",
        },
        skip,
        take: limite,
      }),
      prisma.emprestimo.count({ where: whereClause }),
    ]);

    // Mapeia os dados e calcula o status dinâmico
    const historicoMapeado = emprestimos.map((e) => {
      const titulo = e.cadastro_livro.nome || "Livro desconhecido";
      const autor = e.cadastro_livro.nome_do_autor || "Autor desconhecido";
      const categoria = e.cadastro_livro.genero || "Geral";

      const dataEmprestimo = e.data_emprestimo
        ? new Date(e.data_emprestimo).toLocaleDateString("pt-BR")
        : "";

      // Exibe a data real de devolução se o livro já foi devolvido; senão, exibe a prevista
      const dataDevolucaoReal = e.devolucao?.data_devolucao;
      const dataDevolucao = dataDevolucaoReal
        ? new Date(dataDevolucaoReal).toLocaleDateString("pt-BR")
        : e.data_prevista_devolucao
          ? new Date(e.data_prevista_devolucao).toLocaleDateString("pt-BR")
          : "Não definida";

      let statusCalculado = "Ativo";
      if (e.devolucao) {
        statusCalculado = "Devolvido";
      } else {
        if (e.data_prevista_devolucao && new Date(e.data_prevista_devolucao) < hoje) {
          statusCalculado = "Atrasado";
        }
      }

      return {
        id: e.id,
        titulo,
        autor,
        categoria,
        dataEmprestimo,
        dataDevolucao,
        status: statusCalculado,
      };
    });

    return {
      historico: historicoMapeado,
      meta: {
        total,
        paginaAtual: pagina,
        itensPorPagina: limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  } catch (error) {
    console.error("Erro ao buscar histórico do usuário:", error);
    throw new Error("Não foi possível carregar o histórico.");
  }
}
