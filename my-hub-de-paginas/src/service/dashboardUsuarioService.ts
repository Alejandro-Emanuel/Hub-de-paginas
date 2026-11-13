import { prisma } from "@/lib/prisma";

export interface FiltrosDashboardUsuario {
  busca?: string;
  categoria?: string;
}

export async function obterDadosDashboardUsuario(
  perfilId: number,
  filtros: FiltrosDashboardUsuario,
) {
  const usuario = await prisma.usuario.findUnique({
    where: { perfil_id: perfilId },
    select: { id: true },
  });

  if (!usuario) return null;

  const busca = filtros.busca?.trim();
  const categoria = filtros.categoria?.trim();
  const where = {
    ...(busca
      ? {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            {
              nome_do_autor: {
                contains: busca,
                mode: "insensitive" as const,
              },
            },
            { genero: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(categoria
      ? { genero: { equals: categoria, mode: "insensitive" as const } }
      : {}),
  };

  const [livros, categorias] = await Promise.all([
    prisma.cadastro_livro.findMany({
      where,
      select: {
        id: true,
        nome: true,
        nome_do_autor: true,
        genero: true,
        editora: true,
        ano: true,
      },
      orderBy: [{ nome: "asc" }, { id: "asc" }],
    }),
    prisma.cadastro_livro.findMany({
      distinct: ["genero"],
      select: { genero: true },
      orderBy: { genero: "asc" },
    }),
  ]);

  return {
    livros: livros.map((livro) => ({
      id: livro.id,
      titulo: livro.nome,
      autor: livro.nome_do_autor,
      categoria: livro.genero,
      editora: livro.editora,
      ano: livro.ano,
    })),
    categorias: categorias.map((item) => item.genero).filter(Boolean),
  };
}
