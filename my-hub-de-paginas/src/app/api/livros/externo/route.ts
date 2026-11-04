import { NextResponse } from "next/server";
import { buscarLivrosExternos } from "@/service/openLibreary_Service"

export async function GET(request: Request) {
  try {
    const busca = new URL(request.url).searchParams.get("busca")?.trim() ?? "";
    const livros = await buscarLivrosExternos(busca);
    return NextResponse.json(livros);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { mensagem: "Erro ao buscar livros externos." },
      { status: 500 }
    );
  }
}