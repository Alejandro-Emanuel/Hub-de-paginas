import { NextResponse } from "next/server";
import { buscarMultas } from "@/service/multaService";

export async function GET() {
  try {
    const multas = await buscarMultas();
    return NextResponse.json(multas, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar multas:", error);
    return NextResponse.json(
      { mensagem: "Erro ao buscar multas no banco de dados." },
      { status: 500 }
    );
  }
}
