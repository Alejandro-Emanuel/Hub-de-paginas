import { NextResponse } from "next/server";
import { buscarRelatoriosUnificados } from "@/service/relatorioService";

export async function GET() {
  try {
    const registros = await buscarRelatoriosUnificados();
    return NextResponse.json(registros, { status: 200 });
  } catch (erro) {
    console.error("Erro ao consultar relatórios:", erro);
    return NextResponse.json(
      { mensagem: "Erro ao consultar relatórios do banco de dados." },
      { status: 500 }
    );
  }
}
