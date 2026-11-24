import { prisma } from "@/lib/prisma";

export async function buscarUsuarios(busca: string) {
  const termo = busca.trim();

  const usuarios = await prisma.usuario.findMany({
    where: termo
      ? {
          perfil: {
            OR: [
              { nome: { contains: termo, mode: "insensitive" } },
              { email: { contains: termo, mode: "insensitive" } },
            ],
          },
        }
      : undefined,
    include: { perfil: true },
    orderBy: { perfil: { nome: "asc" } },
    take: 20,
  });

  return usuarios.map((u) => ({
    id: u.id,
    nome: u.perfil.nome,
    email: u.perfil.email,
  }));
}