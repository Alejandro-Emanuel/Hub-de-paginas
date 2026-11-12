import { NextResponse } from "next/server";
import { buscarInformacoesAjuda, atualizarInformacoesAjuda } from "@/service/ajudaService";

export async function GET() {
  try {
    const ajuda = await buscarInformacoesAjuda();
    return NextResponse.json(ajuda, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar dados de ajuda:", error);
    return NextResponse.json(
      { mensagem: "Erro ao carregar informações de ajuda do banco de dados." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { telefone, email } = body;

    if (!telefone || !email) {
      return NextResponse.json(
        { mensagem: "Telefone e e-mail são obrigatórios." },
        { status: 400 }
      );
    }

    const atualizado = await atualizarInformacoesAjuda({ telefone, email });
    return NextResponse.json(
      { mensagem: "Informações de ajuda atualizadas com sucesso!", atualizado },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar ajuda:", error);
    return NextResponse.json(
      { mensagem: "Erro ao atualizar informações de ajuda." },
      { status: 500 }
    );
  }
}
