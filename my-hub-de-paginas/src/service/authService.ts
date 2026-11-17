import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const SECRET_KEY = process.env.JWT_SECRET ?? ""; // chave secreta em desenvolvimento.

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
  // 1. Tenta autenticar como Administrador (tabela Gestao)
  const adm = await prisma.gestao.findUnique({ where: { email } });
  if (adm && (await bcrypt.compare(senha, adm.senha))) {
    return gerarRespostaLogin("adm", adm.id, adm.nome, adm.email);
  }

  // 2. Tenta autenticar como Usuário Comum (tabela Perfil)
  const perfil = await prisma.perfil.findUnique({ where: { email } });
  if (perfil && (await bcrypt.compare(senha, perfil.senha))) {
    return gerarRespostaLogin("usuario", perfil.id, perfil.nome, perfil.email);
  }

  throw new Error("e-mail ou senha incorretos");
}

// Função para cadastrar um novo usuário comum :)
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

// Função para cadastrar um Administrador
export async function cadastrarAdm(
  nome: string,
  email: string,
  senha: string,
) {
  const existente = await prisma.gestao.findUnique({ where: { email } });
  if (existente) {
    throw new Error("Este e-mail de gestor já está cadastrado.");
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const adm = await prisma.gestao.create({
    data: {
      nome,
      email,
      senha: senhaHash,
    },
    select: { id: true, nome: true, email: true },
  });

  return { mensagem: "Administrador cadastrado com sucesso!", adm };
}
