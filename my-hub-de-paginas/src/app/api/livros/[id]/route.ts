import { NextResponse } from "next/server";
import {
  buscarLivroPorId,
  atualizarLivro,
  deletarLivro,
} from "@/service/Livros_Service";

interface ContextoProps {
  params: Promise<{ id: string }>;
}

function obterCodigoErroPrisma(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String(error.code);
  }
  return undefined;
}

function parseLivroId(rawId: string): number | null {
  const livroId = Number(rawId);
  if (!Number.isInteger(livroId) || livroId <= 0) {
    return null;
  }
  return livroId;
}

// GET: Busca um livro específico pelo ID
export async function GET(_request: Request, context: ContextoProps) {
  try {
    const { id } = await context.params;
    const livroId = parseLivroId(id);

    if (!livroId) {
      return NextResponse.json(
        { mensagem: "ID do livro inválido." },
        { status: 400 },
      );
    }

    const livro = await buscarLivroPorId(livroId);

    if (!livro) {
      return NextResponse.json(
        { mensagem: "Livro não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(livro, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar livro por ID:", error);
    return NextResponse.json(
      { mensagem: "Erro interno ao buscar livro." },
      { status: 500 },
    );
  }
}

// PUT: Atualiza um livro específico
export async function PUT(request: Request, context: ContextoProps) {
  try {
    const { id } = await context.params;
    const livroId = parseLivroId(id);

    if (!livroId) {
      return NextResponse.json(
        { mensagem: "ID do livro inválido." },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { mensagem: "Corpo da requisição inválido (JSON esperado)." },
        { status: 400 },
      );
    }

    const dadosAtualizacao: {
      titulo?: string;
      autor?: string;
      editora?: string;
      ano?: number;
      genero?: string;
    } = {};

    if (body.titulo !== undefined) {
      if (typeof body.titulo !== "string" || !body.titulo.trim()) {
        return NextResponse.json(
          { mensagem: "O título deve ser um texto não vazio." },
          { status: 400 },
        );
      }
      dadosAtualizacao.titulo = body.titulo.trim();
    }

    if (body.autor !== undefined) {
      if (typeof body.autor !== "string" || !body.autor.trim()) {
        return NextResponse.json(
          { mensagem: "O autor deve ser um texto não vazio." },
          { status: 400 },
        );
      }
      dadosAtualizacao.autor = body.autor.trim();
    }

    if (body.editora !== undefined) {
      if (typeof body.editora !== "string" || !body.editora.trim()) {
        return NextResponse.json(
          { mensagem: "A editora deve ser um texto não vazio." },
          { status: 400 },
        );
      }
      dadosAtualizacao.editora = body.editora.trim();
    }

    if (body.genero !== undefined) {
      if (typeof body.genero !== "string" || !body.genero.trim()) {
        return NextResponse.json(
          { mensagem: "O gênero deve ser um texto não vazio." },
          { status: 400 },
        );
      }
      dadosAtualizacao.genero = body.genero.trim();
    }

    if (body.ano !== undefined) {
      const anoNumero = Number(body.ano);
      const anoMaximo = new Date().getFullYear() + 1;
      if (!Number.isInteger(anoNumero) || anoNumero < 1000 || anoNumero > anoMaximo) {
        return NextResponse.json(
          { mensagem: `Informe um ano válido entre 1000 e ${anoMaximo}.` },
          { status: 400 },
        );
      }
      dadosAtualizacao.ano = anoNumero;
    }

    if (Object.keys(dadosAtualizacao).length === 0) {
      return NextResponse.json(
        { mensagem: "Nenhum campo válido enviado para atualização." },
        { status: 400 },
      );
    }

    const resultado = await atualizarLivro(livroId, dadosAtualizacao);
    return NextResponse.json(resultado, { status: 200 });
  } catch (error: unknown) {
    console.error("Erro ao atualizar livro:", error);
    const codigo = obterCodigoErroPrisma(error);

    if (codigo === "P2025") {
      return NextResponse.json(
        { mensagem: "Livro não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { mensagem: "Erro interno ao atualizar livro." },
      { status: 500 },
    );
  }
}

// DELETE: Remove um livro específico
export async function DELETE(_request: Request, context: ContextoProps) {
  try {
    const { id } = await context.params;
    const livroId = parseLivroId(id);

    if (!livroId) {
      return NextResponse.json(
        { mensagem: "ID do livro inválido." },
        { status: 400 },
      );
    }

    const resultado = await deletarLivro(livroId);
    return NextResponse.json(resultado, { status: 200 });
  } catch (error: unknown) {
    console.error("Erro ao deletar livro:", error);
    const codigo = obterCodigoErroPrisma(error);

    if (codigo === "P2025") {
      return NextResponse.json(
        { mensagem: "Livro não encontrado." },
        { status: 404 },
      );
    }

    if (codigo === "P2003") {
      return NextResponse.json(
        {
          mensagem:
            "Não é possível excluir este livro pois ele possui registros vinculados (empréstimos ou reservas).",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { mensagem: "Erro interno ao deletar livro." },
      { status: 500 },
    );
  }
}
