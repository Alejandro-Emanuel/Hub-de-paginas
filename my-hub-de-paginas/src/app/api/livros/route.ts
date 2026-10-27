import { NextResponse } from "next/server";
import { cadastrarLivro, buscarLivros } from "@/service/Livros_Service";

// Método GET com suporte a paginação e busca
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const busca = searchParams.get("busca") || "";
    const resultado = await buscarLivros(busca);

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    return NextResponse.json(
      { mensagem: "Erro ao buscar livros." },
      { status: 500 }
    );
  }
}

// Método POST (mantém igual)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, autor, editora, ano, genero } = body;

    if (!titulo || !editora || !ano || !genero) {
      return NextResponse.json(
        { mensagem: "Preencha todos os campos" },
        { status: 400 }
      );
    }
        
    if (!Number.isInteger(Number(ano))) {
      return NextResponse.json(
        { mensagem: "O ano precisa ser um número" },
        { status: 400 }
      );
    }

    const resultado = await cadastrarLivro({ titulo, autor, editora, ano, genero });

    return NextResponse.json(
      { mensagem: "Livro cadastrado com sucesso", livro: resultado.livro },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { mensagem: "Erro ao cadastrar" },
      { status: 500 }
    );
  }
}
