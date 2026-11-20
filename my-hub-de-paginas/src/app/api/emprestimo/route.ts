import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/service/authService";
import { renovarEmprestimo } from "@/service/emprestimoService";

export async function PATCH(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ mensagem: "Não autorizado" }, { status: 401 });
    }

    const dados = jwt.verify(token, SECRET_KEY) as { id: number; tipo: string };
    if (dados.tipo !== "usuario") {
      return NextResponse.json({ mensagem: "Acesso negado" }, { status: 403 });
    }

    const { emprestimoId } = await request.json();
    if (!emprestimoId) {
      return NextResponse.json(
        { mensagem: "ID do empréstimo não informado" },
        { status: 400 },
      );
    }

    const resultado = await renovarEmprestimo(dados.id, Number(emprestimoId));
    return NextResponse.json(resultado, { status: 200 });
  } catch (error: unknown) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao renovar empréstimo";
    return NextResponse.json({ mensagem }, { status: 400 });
  }
}
