export interface LivrosInput {
    titulo: string;
    autor: string;
    editora: string;
    ano: string;
    genero: string;
}

// Lista temporária em memória para simular o banco de dados
const livrosMock: (LivrosInput & { id: string })[] = [];

export async function cadastrarLivro(dados: LivrosInput) {
  // Validação simples
  if (!dados.titulo || !dados.autor) {
    throw new Error("Título e Autor são obrigatórios.");
  }

  const novoLivro = {
    id: String(Date.now()),
    ...dados,
  };

  livrosMock.push(novoLivro);

  return {
    mensagem: "Livro cadastrado com sucesso!",
    livro: novoLivro,
  };
}
