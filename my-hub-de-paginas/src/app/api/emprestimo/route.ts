import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { SECRET_KEY } from "@/service/authService";
import {
  listarEmprestimos,
  registrarEmprestimo,
  renovarEmprestimo,
} from "@/service/emprestimoService";

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

const criarEmprestimoSchema = z.object({
  usuarioId: z.coerce.number().int().positive("Usuário inválido."),
  livroId: z.coerce.number().int().positive("Livro inválido."),
  dias: z.coerce
    .number()
    .int()
    .min(1, "O prazo mínimo é de 1 dia.")
    .max(60, "O prazo máximo é de 60 dias.")
    .default(14),
});

const renovarEmprestimoSchema = z.object({
  emprestimoId: z.coerce.number().int().positive("ID do empréstimo inválido."),
});

// GET: Lista empréstimos (todos para admin, ou filtrados por ?usuarioId=)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioIdParam = searchParams.get("usuarioId");

    let usuarioId: number | undefined;
    if (usuarioIdParam !== null && usuarioIdParam.trim() !== "") {
      const parsed = Number(usuarioIdParam);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return NextResponse.json(
          { mensagem: "ID do usuário inválido." },
          { status: 400 },
        );
      }
      usuarioId = parsed;
    }

    const emprestimos = await listarEmprestimos(usuarioId);
    return NextResponse.json(emprestimos, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar empréstimos:", error);
    return NextResponse.json(
      { mensagem: "Erro interno ao buscar empréstimos." },
      { status: 500 },
    );
  }
}

// POST: Registra um novo empréstimo (somente administrador autenticado)
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
        { mensagem: "Acesso negado. Apenas administradores podem registrar empréstimos." },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => null);
    const validacao = criarEmprestimoSchema.safeParse(body);

    if (!validacao.success) {
      const primeiroErro =
        validacao.error.issues[0]?.message ?? "Dados inválidos para empréstimo.";
      return NextResponse.json({ mensagem: primeiroErro }, { status: 400 });
    }

    const resultado = await registrarEmprestimo({
      ...validacao.data,
      gestaoId: usuarioToken.id,
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (error: unknown) {
    console.error("Erro ao registrar empréstimo:", error);
    const mensagem =
      error instanceof Error
        ? error.message
        : "Erro ao registrar empréstimo.";
    return NextResponse.json({ mensagem }, { status: 400 });
  }
}

// PATCH: Renova um empréstimo existente
export async function PATCH(request: Request) {
  try {
    const usuarioToken = lerTokenDaRequisicao(request);
    if (!usuarioToken) {
      return NextResponse.json(
        { mensagem: "Não autorizado. Faça login novamente." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const validacao = renovarEmprestimoSchema.safeParse(body);

    if (!validacao.success) {
      const primeiroErro =
        validacao.error.issues[0]?.message ?? "ID do empréstimo inválido.";
      return NextResponse.json({ mensagem: primeiroErro }, { status: 400 });
    }

    const resultado = await renovarEmprestimo({
      emprestimoId: validacao.data.emprestimoId,
      perfilIdSolicitante:
        usuarioToken.tipo === "usuario" ? usuarioToken.id : undefined,
    });

    return NextResponse.json(resultado, { status: 200 });
  } catch (error: unknown) {
    console.error("Erro ao renovar empréstimo:", error);
    const mensagem =
      error instanceof Error ? error.message : "Erro ao renovar empréstimo!";
    return NextResponse.json({ mensagem }, { status: 400 });
  }
}
