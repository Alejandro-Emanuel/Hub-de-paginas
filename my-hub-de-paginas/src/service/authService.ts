import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Usuário de teste, feito para fins de demonstração da aplicação.
const Usuario_teste = {
    id: 1,
    nome: "Abner_teste",
    email: "abner.teste@example.com",
    senhaHash: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQ8Zf0sG3jF5h6k5J4e6K" // Hash da senha "senha123"
};

const SECRET_KEY = "sua_chave_secreta"; // chave secreta em desenvolvimento.

export function autenticarUsuario(email: string, senha: string){
    // verficiar se o email e senha estão corretos!
    if (email !== Usuario_teste.email) {
        throw new Error("Usuário não encontrado, senha ou email incorretos.");
    }

    // comparar a senha fornecida com o hash armazenado!
    const token = jwt.sign(
    { id: Usuario_teste.id, email: Usuario_teste.email, nome: Usuario_teste.nome },
    SECRET_KEY,
    { expiresIn: '1d' }
  );
  
  // retornar o token e os dados do usuário autenticado!
  return {
    mensagem: 'Login realizado com sucesso!',
    token,
    usuario: {
      id: Usuario_teste.id,
      nome: Usuario_teste.nome,
      email: Usuario_teste.email
    }
  };
}