import { NextResponse } from "next/server";
import { atualizarStatusMulta } from "@/service/multaService";

interface ContextoProps {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: ContextoProps) {
  try {
    const { id } = await context.params;
    const multaId = Number(id);

    if (isNaN(multaId)) {
      return NextResponse.json({ mensagem: "ID inválido." }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ mensagem: "Status não informado." }, { status: 400 });
    }

    const resultado = await atualizarStatusMulta(multaId, status);

    return NextResponse.json(
      { mensagem: "Status da multa atualizado com sucesso!", resultado },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar multa:", error);
    return NextResponse.json(
      { mensagem: "Erro ao atualizar multa." },
      { status: 500 }
    );
  }
}
