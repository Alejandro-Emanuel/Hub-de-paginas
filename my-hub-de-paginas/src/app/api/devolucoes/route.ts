import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { SECRET_KEY } from "@/service/authService";
import { registrarDevolucao } from "@/service/emprestimoService";

interface TokenPayload {
  id: number;
  tipo: "adm" | "usuario" | string;
}

function lerTokenDaRequisicao(request: Request): TokenPayload | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ") || !SECRET_KEY) {
    return null;
  }

  try {
    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
    if (typeof decoded?.id === "number" && typeof decoded?.tipo === "string") {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

const devolucaoSchema = z.object({
  emprestimoId: z.coerce.number().int().positive("ID do empréstimo inválido."),
});

export async function POST(request: Request) {
  try {
    const usuarioToken = lerTokenDaRequisicao(request);
    if (!usuarioToken) {
      return NextResponse.json(
        { mensagem: "Não autorizado. Faça login novamente." },
        { status: 401 },
      );
    }

    if (usuarioToken.tipo !== "adm") {
      return NextResponse.json(
        { mensagem: "Acesso negado. Apenas administradores podem registrar devoluções." },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => null);
    const validacao = devolucaoSchema.safeParse(body);
    if (!validacao.success) {
      return NextResponse.json(
        {
          mensagem:
            validacao.error.issues[0]?.message ?? "Dados inválidos para devolução.",
        },
        { status: 400 },
      );
    }

    const resultado = await registrarDevolucao({
      emprestimoId: validacao.data.emprestimoId,
      gestaoId: usuarioToken.id,
    });

    return NextResponse.json(resultado, { status: 200 });
  } catch (error: unknown) {
    console.error("Erro ao registrar devolução:", error);
    const mensagem =
      error instanceof Error ? error.message : "Não foi possível registrar a devolução.";
    return NextResponse.json({ mensagem }, { status: 400 });
  }
}
