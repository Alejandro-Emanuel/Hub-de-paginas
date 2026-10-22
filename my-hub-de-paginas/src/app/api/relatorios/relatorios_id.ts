
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Contexto = {
  params: Promise<{ id: string }>;
};

async function obterId(contexto: Contexto) {
  const { id } = await contexto.params;

  if (!/^[1-9]\d*$/.test(id)) return null;

  const numero = Number(id);

  return Number.isSafeInteger(numero) ? numero : null;
}

export async function PATCH(
  request: Request,
  contexto: Contexto
) {
  const id = await obterId(contexto);

  if (id === null) {
    return NextResponse.json(
      { mensagem: "ID inválido." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const dados: {
      titulo?: string;
      descricao?: string | null;
      observacoes?: string | null;
      periodo_inicio?: Date | null;
      periodo_fim?: Date | null;
    } = {};

    if (typeof body.titulo === "string") {
      const titulo = body.titulo.trim();

      if (!titulo || titulo.length > 150) {
        return NextResponse.json(
          { mensagem: "Título inválido." },
          { status: 400 }
        );
      }

      dados.titulo = titulo;
    }

    for (const campo of ["descricao", "observacoes"] as const) {
      if (campo in body) {
        if (
          body[campo] !== null &&
          typeof body[campo] !== "string"
        ) {
          return NextResponse.json(
            { mensagem: `Campo ${campo} inválido.` },
            { status: 400 }
          );
        }

        const limite = campo === "descricao" ? 5000 : 10000;

        if ((body[campo]?.length ?? 0) > limite) {
          return NextResponse.json(
            { mensagem: `Campo ${campo} muito longo.` },
            { status: 400 }
          );
        }

        dados[campo] = body[campo];
      }
    }

    for (const campo of [
      "periodo_inicio",
      "periodo_fim",
    ] as const) {
      if (campo in body) {
        const valor = body[campo];

        if (valor === null || valor === "") {
          dados[campo] = null;
        } else if (
          typeof valor === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(valor)
        ) {
          const data = new Date(`${valor}T12:00:00.000Z`);

          if (
            Number.isNaN(data.getTime()) ||
            data.toISOString().slice(0, 10) !== valor
          ) {
            return NextResponse.json(
              { mensagem: "Data inválida." },
              { status: 400 }
            );
          }

          dados[campo] = data;
        } else {
          return NextResponse.json(
            { mensagem: "Data inválida." },
            { status: 400 }
          );
        }
      }
    }

    if (Object.keys(dados).length === 0) {
      return NextResponse.json(
        { mensagem: "Nenhuma alteração informada." },
        { status: 400 }
      );
    }

    const atual = await prisma.relatorio.findUnique({
      where: { id },
    });

    if (!atual) {
      return NextResponse.json(
        { mensagem: "Relatório não encontrado." },
        { status: 404 }
      );
    }

    const inicio =
      dados.periodo_inicio !== undefined
        ? dados.periodo_inicio
        : atual.periodo_inicio;

    const fim =
      dados.periodo_fim !== undefined
        ? dados.periodo_fim
        : atual.periodo_fim;

    if (inicio && fim && inicio > fim) {
      return NextResponse.json(
        { mensagem: "Período de datas inválido." },
        { status: 400 }
      );
    }

    const atualizado = await prisma.relatorio.update({
      where: { id },
      data: dados,
    });

    return NextResponse.json(atualizado);
  } catch {
    return NextResponse.json(
      { mensagem: "Erro ao atualizar relatório." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  contexto: Contexto
) {
  const id = await obterId(contexto);

  if (id === null) {
    return NextResponse.json(
      { mensagem: "ID inválido." },
      { status: 400 }
    );
  }

  try {
    await prisma.relatorio.delete({ where: { id } });

    return NextResponse.json({
      mensagem: "Relatório excluído com sucesso.",
    });
  } catch {
    return NextResponse.json(
      { mensagem: "Relatório não encontrado ou não foi possível excluir." },
      { status: 404 }
    );
  }
}
