import { prisma } from "@/lib/prisma";

export async function obterHistoricoUsuario(perfilId: number, busca = "") {
  const usuario = await prisma.usuario.findUnique({
    where: { perfil_id: perfilId },
    select: { id: true },
  });

  if (!usuario) return null;

  const termo = busca.trim();
  const emprestimos = await prisma.emprestimo.findMany({
    where: {
      usuario_id: usuario.id,
      ...(termo
        ? {
            cadastro_livro: {
              OR: [
                { nome: { contains: termo, mode: "insensitive" as const } },
                {
                  nome_do_autor: {
                    contains: termo,
                    mode: "insensitive" as const,
                  },
                },
                { genero: { contains: termo, mode: "insensitive" as const } },
              ],
            },
          }
        : {}),
    },
    include: {
      cadastro_livro: {
        select: {
          nome: true,
          nome_do_autor: true,
          genero: true,
        },
      },
      devolucao: {
        select: { data_devolucao: true },
      },
    },
    orderBy: [{ data_emprestimo: "desc" }, { id: "desc" }],
  });

  const agora = new Date();
  const inicioDoDiaUtc = Date.UTC(
    agora.getUTCFullYear(),
    agora.getUTCMonth(),
    agora.getUTCDate(),
  );

  return emprestimos.map((emprestimo) => {
    const dataDevolucaoReal = emprestimo.devolucao?.data_devolucao ?? null;
    const status = dataDevolucaoReal
      ? "Devolvido"
      : emprestimo.data_prevista_devolucao.getTime() < inicioDoDiaUtc
        ? "Atrasado"
        : "Em andamento";

    return {
      id: emprestimo.id,
      titulo: emprestimo.cadastro_livro.nome,
      autor: emprestimo.cadastro_livro.nome_do_autor,
      categoria: emprestimo.cadastro_livro.genero,
      dataEmprestimo: emprestimo.data_emprestimo.toISOString().slice(0, 10),
      dataPrevistaDevolucao: emprestimo.data_prevista_devolucao
        .toISOString()
        .slice(0, 10),
      dataDevolucao: dataDevolucaoReal
        ? dataDevolucaoReal.toISOString().slice(0, 10)
        : null,
      status,
    };
  });
}
