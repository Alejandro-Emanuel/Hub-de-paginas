import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { buscarMultasPorPerfil } from "@/service/multaService";

interface TokenPayload {
  id: number | string;
  email?: string;
  nome?: string;
  tipo?: string;
}

export async function GET(request: Request) {
  try {
    const segredo = process.env.JWT_SECRET;
    if (!segredo) {
      console.error("JWT_SECRET não configurado no ambiente.");
      return NextResponse.json(
        { mensagem: "Erro de configuração de autenticação no servidor." },
        { status: 500 },
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { mensagem: "Token de autenticação não fornecido." },
        { status: 401 },
      );
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return NextResponse.json(
        { mensagem: "Token de autenticação vazio." },
        { status: 401 },
      );
    }

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, segredo) as TokenPayload;
    } catch (jwtError) {
      const expirado = jwtError instanceof jwt.TokenExpiredError;
      return NextResponse.json(
        {
          mensagem: expirado
            ? "Sua sessão expirou. Entre novamente."
            : "Token inválido. Entre novamente.",
        },
        { status: 401 },
      );
    }

    const tipoUsuario =
      typeof payload.tipo === "string" ? payload.tipo.trim().toLowerCase() : "";

    if (tipoUsuario === "adm" || tipoUsuario === "admin") {
      return NextResponse.json(
        { mensagem: "Esta área é exclusiva para contas de usuário." },
        { status: 403 },
      );
    }

    const perfilId = Number(payload.id);
    if (!Number.isInteger(perfilId) || perfilId <= 0) {
      return NextResponse.json(
        { mensagem: "Identificador de usuário inválido no token." },
        { status: 401 },
      );
    }

    const multas = await buscarMultasPorPerfil(perfilId);
    return NextResponse.json(multas, { status: 200 });
  } catch (error) {
    console.error("Erro inesperado ao buscar multas do usuário:", error);
    return NextResponse.json(
      { mensagem: "Erro interno ao buscar suas multas." },
      { status: 500 },
    );
  }
}
