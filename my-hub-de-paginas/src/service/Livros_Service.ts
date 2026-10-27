import { prisma } from "@/lib/prisma";

export interface LivrosInput {
  titulo: string;
  autor: string;
  editora: string;
  ano: string | number;
  genero: string;
}

// Cadastrar livro
export async function cadastrarLivro(dados: LivrosInput) {
  const livro = await prisma.cadastro_livro.create({
    data: {
      nome: dados.titulo.trim(),
      nome_do_autor: dados.autor.trim(),
      editora: dados.editora.trim(),
      ano: Number(dados.ano),
      genero: dados.genero.trim(),
    },
  });

  return { mensagem: "Livro cadastrado com sucesso", livro };
}

// Buscar/filtrar livros
export async function buscarLivros(termoBusca: string) {
  const livros = await prisma.cadastro_livro.findMany({
    where: termoBusca
      ? {
          OR: [
            { nome: { contains: termoBusca, mode: "insensitive" as const } },
            { nome_do_autor: { contains: termoBusca, mode: "insensitive" as const } },
            { genero: { contains: termoBusca, mode: "insensitive" as const } },
          ],
        }
      : undefined,
    orderBy: {
      nome: "asc",
    },
  });

  return livros;
}

// Buscar um único livro por ID
export async function buscarLivroPorId(id: number) {
  return await prisma.cadastro_livro.findUnique({
    where: { id },
  });
}

// Atualizar um livro existente
export async function atualizarLivro(id: number, dados: Partial<LivrosInput>) {
  const livroAtualizado = await prisma.cadastro_livro.update({
    where: { id },
    data: {
      ...(dados.titulo && { nome: dados.titulo.trim() }),
      ...(dados.autor && { nome_do_autor: dados.autor.trim() }),
      ...(dados.editora && { editora: dados.editora.trim() }),
      ...(dados.ano && { ano: Number(dados.ano) }),
      ...(dados.genero && { genero: dados.genero.trim() }),
    },
  });

  return { mensagem: "Livro atualizado com sucesso", livro: livroAtualizado };
}

// Deletar um livro
export async function deletarLivro(id: number) {
  await prisma.cadastro_livro.delete({
    where: { id },
  });

  return { mensagem: "Livro deletado com sucesso" };
}
