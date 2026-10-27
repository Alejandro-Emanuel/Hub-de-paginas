import { NextResponse } from "next/server";
import {
  buscarLivroPorId,
  atualizarLivro,
  deletarLivro,
} from "@/service/Livros_Service";

interface ContextoProps {
  params: Promise<{ id: string }>;
}

// GET: Busca um livro específico pelo ID
export async function GET(request: Request, context: ContextoProps) {
  try {
    const { id } = await context.params;
    const livroId = Number(id);

    if (isNaN(livroId)) {
      return NextResponse.json({ mensagem: "ID inválido." }, { status: 400 });
    }

    const livro = await buscarLivroPorId(livroId);

    if (!livro) {
      return NextResponse.json({ mensagem: "Livro não encontrado." }, { status: 404 });
    }

    return NextResponse.json(livro, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar livro por ID:", error);
    return NextResponse.json({ mensagem: "Erro ao buscar livro." }, { status: 500 });
  }
}

// PUT: Atualiza um livro específico
export async function PUT(request: Request, context: ContextoProps) {
  try {
    const { id } = await context.params;
    const livroId = Number(id);

    if (isNaN(livroId)) {
      return NextResponse.json({ mensagem: "ID inválido." }, { status: 400 });
    }

    const body = await request.json();

    if (body.ano && !Number.isInteger(Number(body.ano))) {
      return NextResponse.json(
        { mensagem: "O ano precisa ser um número." },
        { status: 400 }
      );
    }

    const resultado = await atualizarLivro(livroId, body);

    return NextResponse.json(resultado, { status: 200 });
  } catch (error: unknown) {
    console.error("Erro ao atualizar livro:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ mensagem: "Livro não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ mensagem: "Erro ao atualizar livro." }, { status: 500 });
  }
}

// DELETE: Remove um livro específico
export async function DELETE(request: Request, context: ContextoProps) {
  try {
    const { id } = await context.params;
    const livroId = Number(id);

    if (isNaN(livroId)) {
      return NextResponse.json({ mensagem: "ID inválido." }, { status: 400 });
    }

    const resultado = await deletarLivro(livroId);

    return NextResponse.json(resultado, { status: 200 });
  } catch (error: unknown) {
    console.error("Erro ao deletar livro:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ mensagem: "Livro não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ mensagem: "Erro ao deletar livro." }, { status: 500 });
  }
}
