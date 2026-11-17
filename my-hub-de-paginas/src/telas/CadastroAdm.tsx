"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import BackCadastro from "../assets/BackCadastro.png";
import iconePerfil from "../assets/iconePerfil.jpeg";

interface CadastroAdmProps {
  IrParaLogin: () => void;
  SucessoLogin: (tipo: string) => void;
}

// Troque para false se a proteção for só por sessão (admin já logado)
// e você não quiser pedir o código de acesso no formulário.
const EXIGIR_CHAVE_ACESSO = true;

const estiloInput =
  "w-full p-3.5 rounded-full bg-[#FAF9EE] outline-none text-base placeholder:text-gray-400";

export function CadastroAdm({ IrParaLogin, SucessoLogin }: CadastroAdmProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [chaveAcesso, setChaveAcesso] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (
      !nome ||
      !email ||
      !senha ||
      !confirmSenha ||
      (EXIGIR_CHAVE_ACESSO && !chaveAcesso)
    ) {
      setErro("Preencha todos os campos");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres");
      return;
    }

    if (senha !== confirmSenha) {
      setErro("As senhas não estão iguais");
      return;
    }

    setCarregando(true);

    try {
      // Se já existir um administrador logado, o token vai junto
      // (útil caso a API também aceite a proteção por sessão).
      const tokenAtual = localStorage.getItem("token");

      const resposta = await fetch("/api/auth/cadastro-adm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tokenAtual ? { Authorization: `Bearer ${tokenAtual}` } : {}),
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          ...(EXIGIR_CHAVE_ACESSO ? { chaveAcesso } : {}),
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setErro(dados.mensagem || "Erro ao cadastrar administrador.");
        return;
      }

      // Um admin que já estava logado cadastrando um colega
      // continua na própria sessão, sem trocar de conta.
      if (tokenAtual) {
        setSucesso("Administrador cadastrado com sucesso!");
        setNome("");
        setEmail("");
        setSenha("");
        setConfirmSenha("");
        setChaveAcesso("");
        return;
      }

      // Cadastro bem-sucedido: entra automaticamente com a conta nova
      const respostaLogin = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const dadosLogin = await respostaLogin.json().catch(() => ({}));

      if (respostaLogin.ok && dadosLogin.token) {
        localStorage.setItem("token", dadosLogin.token);
        SucessoLogin(dadosLogin.tipo);
        return;
      }

      setSucesso(
        "Administrador cadastrado! Não foi possível entrar automaticamente, faça login.",
      );
    } catch {
      setErro("Erro ao se conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-end px-6 py-8 md:pr-24"
      style={{ backgroundImage: `url(${BackCadastro.src})` }}
    >
      <div className="bg-[#E2E4CF] w-full max-w-md p-8 rounded-[40px] flex flex-col items-center text-[#4A5546] shadow-lg">
        <div className="w-16 h-16 rounded-full border-2 border-[#4A5546] flex items-center justify-center mb-2">
          <Image
            className="w-14 h-14 rounded-full"
            src={iconePerfil}
            alt="Ícone de perfil"
            width={56}
            height={56}
          />
        </div>

        <h1 className="text-xl font-bold">Cadastro de administrador</h1>
        <p className="text-xs text-[#5A6455] mb-4 text-center">
          Área restrita à gestão da biblioteca
        </p>

        <form
          className="w-full flex flex-col gap-5 text-sm font-semibold"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="nomeAdm" className="block mb-1 pl-1">
              Nome do administrador
            </label>
            <input
              type="text"
              id="nomeAdm"
              placeholder="Nome completo"
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={estiloInput}
            />
          </div>

          <div>
            <label htmlFor="emailAdm" className="block mb-1 pl-1">
              E-mail
            </label>
            <input
              type="email"
              id="emailAdm"
              placeholder="E-mail"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={estiloInput}
            />
          </div>

          <div>
            <label htmlFor="senhaAdm" className="block mb-1 pl-1">
              Senha
            </label>
            <input
              type="password"
              id="senhaAdm"
              placeholder="Senha"
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={estiloInput}
            />
          </div>

          <div>
            <label htmlFor="confirmarSenhaAdm" className="block mb-1 pl-1">
              Digite sua senha novamente
            </label>
            <input
              type="password"
              id="confirmarSenhaAdm"
              placeholder="Confirme sua senha"
              autoComplete="new-password"
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
              className={estiloInput}
            />
          </div>

          {EXIGIR_CHAVE_ACESSO && (
            <div>
              <label htmlFor="chaveAcesso" className="block mb-1 pl-1">
                Código de acesso
              </label>
              <input
                type="password"
                id="chaveAcesso"
                placeholder="Código fornecido pela gestão"
                autoComplete="off"
                value={chaveAcesso}
                onChange={(e) => setChaveAcesso(e.target.value)}
                className={estiloInput}
              />
            </div>
          )}

          {erro && (
            <p role="alert" className="text-xs text-red-600 text-center -mt-2">
              {erro}
            </p>
          )}

          {sucesso && (
            <p
              role="status"
              className="text-xs text-green-700 text-center -mt-2"
            >
              {sucesso}
            </p>
          )}

          <div className="w-full border-t border-[#BFC2AA] my-2" />

          <button
            type="submit"
            disabled={carregando}
            className="bg-[#4E5C4E] text-white py-2.5 px-10 rounded-2xl text-sm font-semibold shadow-md hover:bg-[#3D493D] transition-colors self-center disabled:opacity-50"
          >
            {carregando ? "Cadastrando..." : "Cadastrar administrador"}
          </button>

          <p className="text-xs text-[#5A6455] font-medium text-center">
            Já tem conta?{" "}
            <button
              type="button"
              onClick={IrParaLogin}
              className="text-[#E08328] font-bold hover:underline"
            >
              Faça login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}