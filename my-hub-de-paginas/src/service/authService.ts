import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const SECRET_KEY = "sua_chave_secreta"; // chave secreta em desenvolvimento.

function gerarRespostaLogin(
  tipo: "adm" | "usuario",
  id: number,
  nome: string,
  email: string,
) {
  const token = jwt.sign({ id, email, nome, tipo }, SECRET_KEY, {
    expiresIn: "1d",
  });

  return {
    mensagem: "Login realizado com sucesso",
    token,
    tipo,
    usuario: { id, nome, email },
  };
}

export async function autenticarUsuario(email: string, senha: string) {
  const adm = await prisma.gestao.findUnique({ where: { email } });
  if (adm && (await bcrypt.compare(senha, adm.senha))) {
    return gerarRespostaLogin("adm", adm.id, adm.nome, adm.email);
  }

  const perfil = await prisma.perfil.findUnique({ where: { email } });
  if (perfil && (await bcrypt.compare(senha, perfil.senha))) {
    return gerarRespostaLogin("usuario", perfil.id, perfil.nome, perfil.email);
  }

  throw new Error("e-mail ou senha incorretos");
}

// função para cadastrar um novo usuário :)
export async function cadastrarUsuario(
  nome: string,
  email: string,
  senha: string,
) {
  const existente = await prisma.perfil.findUnique({ where: { email } });
  if (existente) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const perfil = await prisma.perfil.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      usuario: { create: {} },
    },
    select: { id: true, nome: true, email: true },
  });

  return { mensagem: "Usuário cadastrado com sucesso!", usuario: perfil };
}
