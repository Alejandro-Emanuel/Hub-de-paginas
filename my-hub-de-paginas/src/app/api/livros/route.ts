import { cadastrarLivro } from "@/service/Livros_Service";
import { NextResponse } from "next/server";

export async function POST(request: Request){
  try {
    const body = await request.json();
    const {titulo, autor, editora, ano, genero} = body;

    if (!titulo || !editora || !ano || !genero) {
      return NextResponse.json(
        {mensagem: "Preencha todos os campos"},
        {status: 400}
      );
    }
    
    if (!Number.isInteger(Number(ano))){
      return NextResponse.json(
        {mensagem: "o ano precisa ser um numero"},
        {status: 400}
      );
    }

    const livro = await cadastrarLivro({titulo, autor, editora, ano, genero});

    return NextResponse.json(
      {mensagem: "Livro cadastrado com sucesso", livro},
      {status: 201}
    );

  } catch(error){
    console.error(error);
    return NextResponse.json(
      {mensagem: "Erro ao cadastrar"},
      {status: 500}
    );
  }
}