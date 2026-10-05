import { NextResponse } from "next/server";
import { cadastrarLivro } from "@/service/Livros_Service";

// função para lidar com a requisição POST do cadastro de livros :)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, autor, editora, ano, genero } = body;

    if (!titulo || !autor) {
      return NextResponse.json(
        { mensagem: "Preencha pelo menos o titulo e o autor do livro!" },
        { status: 400 }
      );
    }

    const livro = await cadastrarLivro({ titulo, autor, editora, ano, genero });

    return NextResponse.json(
      { mensagem: "Livro cadastrado com sucesso!", livro },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { mensagem: "Erro ao cadastrar livro." },
      { status: 500 }
    );
  }
}
