import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cadastrarLivro } from "@/service/Livros_Service";

// Método GET: Utilizado pela página de Reservas para buscar/filtrar os livros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const busca = searchParams.get("busca") || "";

    const livros = await prisma.cadastro_livro.findMany({
      where: busca
        ? {
            OR: [
              { nome: { contains: busca, mode: "insensitive" } },
              { nome_do_autor: { contains: busca, mode: "insensitive" } },
              { genero: { contains: busca, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(livros, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    return NextResponse.json(
      { mensagem: "Erro ao buscar livros." },
      { status: 500 }
    );
  }
}

// Método POST: Utilizado para cadastrar um novo livro
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, autor, editora, ano, genero } = body;

    // Validação dos campos obrigatórios
    if (!titulo || !autor || !editora || !ano || !genero) {
      return NextResponse.json(
        { mensagem: "Preencha todos os campos" },
        { status: 400 }
      );
    }
    
    // Validação se o ano é numérico
    if (!Number.isInteger(Number(ano))) {
      return NextResponse.json(
        { mensagem: "O ano obrigatoriamente precisa ser um número!" },
        { status: 400 }
      );
    }

    const resultado = await cadastrarLivro({ titulo, autor, editora, ano, genero });

    return NextResponse.json(
      { mensagem: "Livro cadastrado com sucesso", livro: resultado.livro },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erro ao cadastrar livro:", error);
    return NextResponse.json(
      { mensagem: "Erro ao cadastrar livro." },
      { status: 500 }
    );
  }
}
