import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { SECRET_KEY } from "@/service/authService";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ mensagem: "Não autorizado" }, { status: 401 });
    }

    const dados = jwt.verify(token, SECRET_KEY) as { id: number };

    const usuario = await prisma.usuario.findUnique({
      where: { perfil_id: dados.id },
    });
    if (!usuario) return NextResponse.json([]);

    const emprestimos = await prisma.emprestimo.findMany({
      where: { usuario_id: usuario.id },
      include: { cadastro_livro: true, devolucao: true },
      orderBy: { data_emprestimo: "desc" },
    });

    return NextResponse.json(emprestimos);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { mensagem: "Erro ao buscar empréstimos" },
      { status: 500 },
    );
  }
}
