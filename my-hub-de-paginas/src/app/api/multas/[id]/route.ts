import { NextResponse } from "next/server";
import { atualizarStatusMulta } from "@/service/multaService";

interface ContextoProps {
  params: Promise<{ id: string }>;
}

const MAPA_STATUS: Record<string, "Pendente" | "Paga" | "Cancelada"> = {
  pendente: "Pendente",
  paga: "Paga",
  cancelada: "Cancelada",
};

export async function PUT(request: Request, context: ContextoProps) {
  try {
    const { id } = await context.params;
    const multaId = Number(id);

    if (!Number.isInteger(multaId) || multaId <= 0) {
      return NextResponse.json(
        { mensagem: "ID da multa inválido." },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { mensagem: "Corpo da requisição inválido (JSON esperado)." },
        { status: 400 },
      );
    }

    const rawStatus =
      typeof body.status === "string" ? body.status.trim().toLowerCase() : "";
    const statusNormalizado = MAPA_STATUS[rawStatus];

    if (!statusNormalizado) {
      return NextResponse.json(
        {
          mensagem:
            "Status inválido. Informe 'Pendente', 'Paga' ou 'Cancelada'.",
        },
        { status: 400 },
      );
    }

    const resultado = await atualizarStatusMulta(multaId, statusNormalizado);

    if (!resultado.ok) {
      return NextResponse.json(
        { mensagem: resultado.mensagem },
        { status: resultado.httpStatus },
      );
    }

    return NextResponse.json(
      {
        mensagem: "Status da multa atualizado com sucesso!",
        multa: resultado.multa,
        resultado: resultado.multa,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Erro ao atualizar multa:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { mensagem: "Multa não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { mensagem: "Erro interno ao atualizar multa." },
      { status: 500 },
    );
  }
}
