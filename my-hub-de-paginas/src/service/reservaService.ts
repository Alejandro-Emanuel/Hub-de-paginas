import { prisma } from "@/lib/prisma";

export interface CriarReservaInput {
  livroId: number;
  perfilId: number;
}

export interface ListarReservasInput {
  perfilId: number;
  tipo: string;
}

export interface CancelarReservaInput {
  reservaId: number;
  perfilId: number;
  tipo: string;
}

async function obterUsuarioPorPerfilId(perfilId: number) {
  const usuario = await prisma.usuario.findUnique({
    where: { perfil_id: perfilId },
    include: { perfil: true },
  });

  if (!usuario) {
    throw new Error("Perfil de usuário não encontrado.");
  }

  return usuario;
}

export async function listarReservas({ perfilId, tipo }: ListarReservasInput) {
  const ehAdmin = tipo.toLowerCase() === "adm" || tipo.toLowerCase() === "admin";

  let usuarioIdFiltro: number | undefined;
  if (!ehAdmin) {
    const usuario = await obterUsuarioPorPerfilId(perfilId);
    usuarioIdFiltro = usuario.id;
  }

  const reservas = await prisma.reserva.findMany({
    where: usuarioIdFiltro ? { usuario_id: usuarioIdFiltro } : undefined,
    include: {
      cadastro_livro: {
        include: {
          emprestimo: {
            where: { devolucao: { is: null } },
            select: { id: true },
          },
        },
      },
      usuario: {
        include: {
          perfil: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  return reservas.map((r) => {
    const temEmprestimoAtivo = r.cadastro_livro.emprestimo.length > 0;

    return {
      id: r.id,
      livro: r.cadastro_livro.nome,
      autor: r.cadastro_livro.nome_do_autor,
      dataReserva: r.data_reserva.toISOString().slice(0, 10),
      // Só está disponível para retirada se marcado na reserva e sem empréstimo em aberto
      disponivel: Boolean(r.disponivel && !temEmprestimoAtivo),
      ...(ehAdmin ? { usuario: r.usuario.perfil.nome } : {}),
    };
  });
}

export async function criarReserva({ livroId, perfilId }: CriarReservaInput) {
  if (!Number.isInteger(livroId) || livroId <= 0) {
    throw new Error("ID do livro inválido.");
  }

  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.findUnique({
      where: { perfil_id: perfilId },
      include: { perfil: true },
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado para este perfil.");
    }

    const livro = await tx.cadastro_livro.findUnique({
      where: { id: livroId },
      include: {
        emprestimo: {
          where: { devolucao: { is: null } },
          select: { id: true, usuario_id: true },
        },
        reserva: {
          select: { id: true, usuario_id: true },
        },
      },
    });

    if (!livro) {
      throw new Error("Livro não encontrado.");
    }

    // Impede reserva se o usuário tiver multa pendente
    const multaPendente = await tx.multa.findFirst({
      where: {
        status: "Pendente",
        devolucao: {
          emprestimo: {
            usuario_id: usuario.id,
          },
        },
      },
      select: { id: true },
    });

    if (multaPendente) {
      throw new Error(
        "Não é possível realizar reserva enquanto houver multa pendente.",
      );
    }

    // Impede reservar um livro que o próprio usuário já está com ele emprestado
    const jaEstaComUsuario = livro.emprestimo.some(
      (emp) => emp.usuario_id === usuario.id,
    );
    if (jaEstaComUsuario) {
      throw new Error("Você já possui um empréstimo ativo deste livro.");
    }

    // Impede reserva duplicada do mesmo usuário para o mesmo livro
    const jaReservou = livro.reserva.some(
      (res) => res.usuario_id === usuario.id,
    );
    if (jaReservou) {
      throw new Error("Você já possui uma reserva para este livro.");
    }

    const emprestadoParaOutro = livro.emprestimo.length > 0;

    const criada = await tx.reserva.create({
      data: {
        usuario_id: usuario.id,
        livro_id: livro.id,
        // Se não há empréstimo ativo e ninguém já pegou a vaga, pode nascer false ou true conforme sua regra
        disponivel: !emprestadoParaOutro && livro.reserva.length === 0 ? false : false,
      },
      include: {
        cadastro_livro: true,
        usuario: {
          include: { perfil: true },
        },
      },
    });

    return {
      mensagem: "Reserva registrada com sucesso!",
      reserva: {
        id: criada.id,
        livro: criada.cadastro_livro.nome,
        autor: criada.cadastro_livro.nome_do_autor,
        dataReserva: criada.data_reserva.toISOString().slice(0, 10),
        disponivel: criada.disponivel,
        usuario: criada.usuario.perfil.nome,
      },
    };
  });
}

export async function cancelarReserva({
  reservaId,
  perfilId,
  tipo,
}: CancelarReservaInput) {
  if (!Number.isInteger(reservaId) || reservaId <= 0) {
    throw new Error("ID da reserva inválido.");
  }

  const ehAdmin = tipo.toLowerCase() === "adm" || tipo.toLowerCase() === "admin";

  return prisma.$transaction(async (tx) => {
    const reserva = await tx.reserva.findUnique({
      where: { id: reservaId },
      select: { id: true, usuario_id: true },
    });

    if (!reserva) {
      throw new Error("Reserva não encontrada.");
    }

    if (!ehAdmin) {
      const usuario = await tx.usuario.findUnique({
        where: { perfil_id: perfilId },
        select: { id: true },
      });

      if (!usuario || reserva.usuario_id !== usuario.id) {
        throw new Error("Você não tem permissão para cancelar esta reserva.");
      }
    }

    await tx.reserva.delete({
      where: { id: reservaId },
    });

    return {
      mensagem: "Reserva cancelada com sucesso!",
    };
  });
}
