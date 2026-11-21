import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { SECRET_KEY } from "@/service/authService";
import { criarReserva, listarReservas } from "@/service/reservaService";

interface TokenPayload {
  id: number;
  tipo: string;
}

function lerToken(request: Request): TokenPayload | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ") || !SECRET_KEY) {
    return null;
  }

  try {
    const token = authHeader.slice(7).trim();
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
    if (typeof decoded?.id === "number") {
      return {
        id: decoded.id,
        tipo: typeof decoded.tipo === "string" ? decoded.tipo : "usuario",
      };
    }
    return null;
  } catch {
    return null;
  }
}

const criarReservaSchema = z.object({
  livroId: z.coerce.number().int().positive("ID do livro inválido."),
});

export async function GET(request: Request) {
  try {
    const usuarioToken = lerToken(request);
    if (!usuarioToken) {
      return NextResponse.json(
        { mensagem: "Não autorizado. Faça login novamente." },
        { status: 401 },
      );
    }

    const reservas = await listarReservas({
      perfilId: usuarioToken.id,
      tipo: usuarioToken.tipo,
    });

    return NextResponse.json(reservas, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar reservas:", error);
    const mensagem =
      error instanceof Error ? error.message : "Erro ao carregar reservas.";
    return NextResponse.json({ mensagem }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const usuarioToken = lerToken(request);
    if (!usuarioToken) {
      return NextResponse.json(
        { mensagem: "Não autorizado. Faça login novamente." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const validacao = criarReservaSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        {
          mensagem:
            validacao.error.issues[0]?.message ?? "Dados inválidos para reserva.",
        },
        { status: 400 },
      );
    }

    const resultado = await criarReserva({
      livroId: validacao.data.livroId,
      perfilId: usuarioToken.id,
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    const mensagem =
      error instanceof Error ? error.message : "Não foi possível criar a reserva.";
    return NextResponse.json({ mensagem }, { status: 400 });
  }
}
