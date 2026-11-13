import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/service/authService";
import { obterHistoricoUsuario } from "@/service/historicoUsuarioService";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const tokenMatch = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!tokenMatch) {
    return NextResponse.json({ mensagem: "Não autorizado" }, { status: 401 });
  }

  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(tokenMatch[1], SECRET_KEY);
  } catch {
    return NextResponse.json(
      { mensagem: "Sessão inválida ou expirada" },
      { status: 401 },
    );
  }

  if (
    typeof payload === "string" ||
    typeof payload.id !== "number" ||
    !Number.isInteger(payload.id) ||
    payload.id <= 0
  ) {
    return NextResponse.json(
      { mensagem: "Sessão inválida ou expirada" },
      { status: 401 },
    );
  }

  const busca = new URL(request.url).searchParams.get("busca")?.trim() ?? "";
  if (busca.length > 100) {
    return NextResponse.json(
      { mensagem: "A busca deve ter no máximo 100 caracteres" },
      { status: 400 },
    );
  }

  try {
    const historico = await obterHistoricoUsuario(payload.id, busca);

    if (!historico) {
      return NextResponse.json(
        { mensagem: "Acesso restrito a contas de usuário" },
        { status: 403 },
      );
    }

    return NextResponse.json(historico, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar histórico do usuário:", error);
    return NextResponse.json(
      { mensagem: "Erro ao buscar histórico" },
      { status: 500 },
    );
  }
}
