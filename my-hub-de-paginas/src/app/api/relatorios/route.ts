
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const relatorios = await prisma.relatorio.findMany({
      orderBy: { atualizado_em: "desc" },
    });

    return NextResponse.json(relatorios);
  } catch {
    return NextResponse.json(
      { mensagem: "Erro ao consultar relatórios." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const titulo = String(body.titulo ?? "").trim();

    if (!titulo || titulo.length > 150) {
      return NextResponse.json(
        { mensagem: "Informe um título de até 150 caracteres." },
        { status: 400 }
      );
    }

    const descricao =
      body.descricao == null ? null : String(body.descricao);

    const observacoes =
      body.observacoes == null
        ? null
        : String(body.observacoes);

    if (
      (descricao?.length ?? 0) > 5000 ||
      (observacoes?.length ?? 0) > 10000
    ) {
      return NextResponse.json(
        { mensagem: "Descrição ou observações muito longas." },
        { status: 400 }
      );
    }

    const dataValida = (valor: unknown) => {
      if (valor == null || valor === "") return null;

      if (typeof valor !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        throw new Error("Data inválida.");
      }

      const data = new Date(`${valor}T12:00:00.000Z`);

      if (
        Number.isNaN(data.getTime()) ||
        data.toISOString().slice(0, 10) !== valor
      ) {
        throw new Error("Data inválida.");
      }

      return data;
    };

    const inicio = dataValida(body.periodo_inicio);
    const fim = dataValida(body.periodo_fim);

    if (inicio && fim && inicio > fim) {
      return NextResponse.json(
        { mensagem: "A data inicial deve ser anterior à final." },
        { status: 400 }
      );
    }

    const relatorio = await prisma.relatorio.create({
      data: {
        titulo,
        descricao,
        observacoes,
        periodo_inicio: inicio,
        periodo_fim: fim,
      },
    });

    return NextResponse.json(relatorio, { status: 201 });
  } catch (erro) {
    if (
      erro instanceof Error &&
      erro.message === "Data inválida."
    ) {
      return NextResponse.json(
        { mensagem: erro.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { mensagem: "Erro ao salvar relatório." },
      { status: 500 }
    );
  }
}
