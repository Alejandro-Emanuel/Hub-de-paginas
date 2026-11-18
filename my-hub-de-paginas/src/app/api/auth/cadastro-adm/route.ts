import { NextResponse } from "next/server";
import { cadastrarAdm } from "@/service/authService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, senha, chaveAcesso } = body;

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { mensagem: "Preencha todos os campos obrigatórios!" },
        { status: 400 }
      );
    }

    const resultado = await cadastrarAdm(nome, email, senha, chaveAcesso);

    return NextResponse.json(resultado, { status: 201 });
  } catch (erro: unknown) {
    const mensagem =
      erro instanceof Error
        ? erro.message
        : "Erro interno ao cadastrar administrador";

    return NextResponse.json(
      { mensagem },
      { status: 400 }
    );
  }
}
