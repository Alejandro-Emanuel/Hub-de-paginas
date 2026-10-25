import { NextResponse } from "next/server";
import { listarEmprestimosAtivos, renovarEmprestimo } from "@/service/emprestimoService";

// GET: Lista os empréstimos ativos de um usuário
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuarioId");

    if (!usuarioId) {
      return NextResponse.json({ mensagem: "ID do usuário não informado" }, { status: 400 });
    }

    const emprestimos = await listarEmprestimosAtivos(Number(usuarioId));
    return NextResponse.json(emprestimos, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ mensagem: "Erro ao buscar empréstimos" }, { status: 500 });
  }
}

// PATCH: Renova o empréstimo selecionado
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { emprestimoId } = body;

    if (!emprestimoId) {
      return NextResponse.json({ mensagem: "ID do empréstimo não informado" }, { status: 400 });
    }

    const resultado = await renovarEmprestimo({ emprestimoId });
    return NextResponse.json(resultado, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    const mensagem = error instanceof Error ? error.message : "Erro ao renovar empréstimo";
    return NextResponse.json({ mensagem }, { status: 500 });
  }
}
