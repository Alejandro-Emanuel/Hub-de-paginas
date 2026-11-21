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

// Buscar/filtrar livros já considerando empréstimos ativos e reservas
export async function buscarLivrosComDisponibilidade(termoBusca: string) {
  const termo = termoBusca.trim();

  const livros = await prisma.cadastro_livro.findMany({
    where: termo
      ? {
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
        }
      : undefined,
    include: {
      emprestimo: {
        where: { devolucao: { is: null } },
        select: { id: true },
      },
      reserva: {
        select: { id: true, disponivel: true },
      },
    },
    orderBy: { nome: "asc" },
  });

  return livros.map((livro) => {
    const estaEmprestado = livro.emprestimo.length > 0;
    const reservaLiberada = livro.reserva.some((r) => r.disponivel);
    const temReserva = livro.reserva.length > 0;
    const disponivel = !estaEmprestado && !reservaLiberada;

    const status = estaEmprestado
      ? ("Emprestado" as const)
      : reservaLiberada || temReserva
        ? ("Reservado" as const)
        : ("Disponível" as const);

    return {
      id: livro.id,
      nome: livro.nome,
      nome_do_autor: livro.nome_do_autor,
      editora: livro.editora,
      ano: livro.ano,
      genero: livro.genero,
      disponivel,
      status,
    };
  });
}

// Mantém compatibilidade com quem chama buscarLivros diretamente
export async function buscarLivros(termoBusca: string) {
  return buscarLivrosComDisponibilidade(termoBusca);
}

// Buscar um único livro por ID
export async function buscarLivroPorId(id: number) {
  return prisma.cadastro_livro.findUnique({
    where: { id },
  });
}

// Atualizar um livro existente
export async function atualizarLivro(id: number, dados: Partial<LivrosInput>) {
  const livroAtualizado = await prisma.cadastro_livro.update({
    where: { id },
    data: {
      ...(dados.titulo !== undefined &&
        dados.titulo.trim() !== "" && { nome: dados.titulo.trim() }),
      ...(dados.autor !== undefined &&
        dados.autor.trim() !== "" && { nome_do_autor: dados.autor.trim() }),
      ...(dados.editora !== undefined &&
        dados.editora.trim() !== "" && { editora: dados.editora.trim() }),
      ...(dados.ano !== undefined && { ano: Number(dados.ano) }),
      ...(dados.genero !== undefined &&
        dados.genero.trim() !== "" && { genero: dados.genero.trim() }),
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
