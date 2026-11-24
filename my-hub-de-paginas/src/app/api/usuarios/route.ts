import { NextResponse } from "next/server";
import { lerTokenDaRequisicao } from "@/lib/token";
import { buscarUsuarios } from "@/service/usuarioService";

export async function GET(request: Request) {
  try {
    const token = lerTokenDaRequisicao(request);
    if (!token) {
      return NextResponse.json(
        { mensagem: "Não autorizado. Faça login novamente." },
        { status: 401 },
      );
    }
    if (token.tipo !== "adm") {
      return NextResponse.json({ mensagem: "Acesso negado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const usuarios = await buscarUsuarios(searchParams.get("busca") ?? "");
    return NextResponse.json(usuarios, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { mensagem: "Erro ao buscar usuários." },
      { status: 500 },
    );
  }
}