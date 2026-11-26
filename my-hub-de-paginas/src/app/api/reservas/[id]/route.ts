import { NextResponse } from "next/server";
import { lerTokenDaRequisicao } from "@/lib/token";
import { cancelarReserva } from "@/service/reservaService";

interface Contexto {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: Contexto) {
  try {
    const token = lerTokenDaRequisicao(request);
    if (!token) {
      return NextResponse.json(
        { mensagem: "Não autorizado. Faça login novamente." },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    const resultado = await cancelarReserva({
      reservaId: Number(id),
      perfilId: token.id,
      tipo: token.tipo,
    });

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    const mensagem =
      error instanceof Error
        ? error.message
        : "Não foi possível cancelar a reserva.";
    return NextResponse.json({ mensagem }, { status: 400 });
  }
}
