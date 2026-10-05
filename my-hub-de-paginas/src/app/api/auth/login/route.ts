import {NextResponse} from "next/server";
import { autenticarUsuario } from "@/service/authService";

// Função para lidar com a requisição POST do login!
export async function POST(request: Request) {
    try{
        const body = await request.json();
        const { email, senha } = body;

        if (!email || !senha) {
            return NextResponse.json(
                { mensagem: "Coloque seu email e senha para realizar o login!" },
                { status: 400 }
            );
        }

        const resultado = await autenticarUsuario(email, senha);

    return NextResponse.json(resultado, { status: 200 });
  } catch (erro: any) {
    return NextResponse.json(
      { mensagem: erro.message || 'Erro ao realizar login.' },
      { status: 401 }
    );
  }
}