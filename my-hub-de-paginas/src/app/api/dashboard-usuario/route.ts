import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/service/authService";
import { obterDadosDashboardUsuario } from "@/service/dashboardUsuarioService";

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

  const searchParams = new URL(request.url).searchParams;
  const busca = searchParams.get("busca")?.trim() ?? "";
  const categoria = searchParams.get("categoria")?.trim() ?? "";

  if (busca.length > 100 || categoria.length > 100) {
    return NextResponse.json(
      { mensagem: "Os filtros devem ter no máximo 100 caracteres" },
      { status: 400 },
    );
  }

  try {
    const dados = await obterDadosDashboardUsuario(payload.id, {
      busca,
      categoria,
    });

    if (!dados) {
      return NextResponse.json(
        { mensagem: "Acesso restrito a contas de usuário" },
        { status: 403 },
      );
    }

    return NextResponse.json(dados, { status: 200 });
  } catch (error) {
    console.error("Erro ao carregar dashboard do usuário:", error);
    return NextResponse.json(
      { mensagem: "Erro ao carregar dados do dashboard" },
      { status: 500 },
    );
  }
}
