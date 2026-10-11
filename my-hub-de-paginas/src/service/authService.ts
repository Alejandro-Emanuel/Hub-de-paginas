import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";


const SECRET_KEY = "sua_chave_secreta"; // chave secreta em desenvolvimento.

export async function autenticarUsuario(email: string, senha: string){
  const perfil = await prisma.perfil.findUnique({where: {email}});
  const senhaCorreta = perfil ? await bcrypt.compare(senha, perfil.senha): false;

  if (!perfil || !senhaCorreta){
    throw new Error("e-mail ou senha incorretos");
  }

  const token = jwt.sign(
    {id: perfil.id, email: perfil.email, nome: perfil.nome},
    SECRET_KEY,
    {expiresIn: "1d"}
  );

  return {
    mensagem: "Login realizado com sucesso",
    token,
    usuario: {id:perfil.id, nome: perfil.nome, email: perfil.email},
  };
}

// função para cadastrar um novo usuário :)
export async function cadastrarUsuario(nome: string, email: string, senha: string) {
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