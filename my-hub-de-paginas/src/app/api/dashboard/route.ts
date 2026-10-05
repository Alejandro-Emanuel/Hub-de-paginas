import { NextResponse } from "next/server";
import { obterMétricasDashboard } from "@/service/dashboard_Service";

export async function GET() {
  try {
    const metricas = await obterMétricasDashboard();
    return NextResponse.json(metricas, { status: 200 });
  } catch (erro: any) {
    return NextResponse.json(
      { mensagem: "Erro ao carregar dados do dashboard" },
      { status: 500 }
    );
  }
}
