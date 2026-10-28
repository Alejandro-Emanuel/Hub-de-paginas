import { NextResponse } from "next/server";
import { obterMétricasDashboard } from "@/service/dashboard_Service";

export async function GET() {
  try {
    const metricas = await obterMétricasDashboard();
    return NextResponse.json(metricas, { status: 200 });
  } catch (error) {
    console.error("Erro na API do dashboard:", error);
    return NextResponse.json(
      { mensagem: "Erro ao carregar dados do dashboard." },
      { status: 500 }
    );
  }
}
