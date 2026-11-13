import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/service/authService";
import { obterHistoricoUsuario } from "@/service/historicoService";

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

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const paginaStr = searchParams.get("pagina") || "1";
    const limiteStr = searchParams.get("limite") || "10";

    const pagina = Number(paginaStr);
    const limite = Number(limiteStr);

    if (
      !Number.isInteger(pagina) ||
      pagina < 1 ||
      !Number.isInteger(limite) ||
      limite < 1 ||
      limite > 100
    ) {
      return NextResponse.json(
        { mensagem: "Parâmetros inválidos na requisição." },
        { status: 400 }
      );
    }

    const resultado = await obterHistoricoUsuario({
      perfilId: payload.id,
      status,
      pagina,
      limite,
    });

    if (!resultado) {
      return NextResponse.json(
        { mensagem: "Acesso restrito a contas de usuário." },
        { status: 403 },
      );
    }

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error("Erro na API de histórico:", error);
    return NextResponse.json(
      { mensagem: "Erro interno ao buscar histórico." },
      { status: 500 }
    );
  }
}
