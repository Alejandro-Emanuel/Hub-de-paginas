import { NextResponse } from "next/server";
import { cadastrarUsuario } from "@/service/authService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, senha } = body;

    // Validação no servidor
    if (!nome || !email || !senha) {
      return NextResponse.json(
        { mensagem: "Preencha todos os campos obrigatórios!" },
        { status: 400 },
      );
    }

    // Processa a criação do usuário no serviço
    const resultado = await cadastrarUsuario(nome, email, senha);

    return NextResponse.json(resultado, { status: 201 });
  } catch (erro: unknown) {
    const mensagem =
      erro instanceof Error ? erro.message : "Erro interno ao cadastrar usuário";

    return NextResponse.json(
      { mensagem },
      { status: 500 },
    );
  }
}
