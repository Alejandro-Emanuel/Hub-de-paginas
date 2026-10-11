import {prisma} from "@/lib/prisma"

export interface LivrosInput {
    titulo: string;
    autor: string;
    editora: string;
    ano: string;
    genero: string;
}

export async function cadastrarLivro(dados: LivrosInput) {
  const livro = await prisma.cadastro_livro.create({
    data: {
      nome:dados.titulo.trim(),
      nome_do_autor: dados.autor.trim(),
      editora: dados.editora.trim(),
      ano: Number(dados.ano),
      genero: dados.genero.trim(),
    },
  });

  return {mensagem: "livro cadastrado com sucesso", livro};
}
  