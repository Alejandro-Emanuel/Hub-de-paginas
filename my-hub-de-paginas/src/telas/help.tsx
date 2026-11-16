"use client";

import Image from "next/image";
import { BarraLateral } from "../components/BarraLateral";
import telaFundo from "../assets/iconeCards/telaDeFundo.png";
import perfil from "../assets/iconeCards/Perfil.png";
import interrogacao from "../assets/iconeCards/interrogaçãoIcon.png";
import marcador from "../assets/iconeCards/Marcador.png";
import retornar from "../assets/iconeCards/Log out.png";
import { useEffect, useState } from "react";

interface AjudaProps {
  Voltar: () => void;
}

export function Help({ Voltar }: AjudaProps) {
  const [telefone, setTelefone] = useState("Carregando...");
  const [email, setEmail] = useState("Carregando...");

  useEffect(() => {
    async function carregarAjuda() {
      try {
        const resposta = await fetch("/api/ajuda");
        if (resposta.ok) {
          const dados = await resposta.json();
          setTelefone(dados.telefone);
          setEmail(dados.email);
        } else {
          setTelefone("(84) 9833-8627");
          setEmail("teste@gmail.com.br");
        }
      } catch (erro) {
        console.error("Erro ao carregar contato:", erro);
        setTelefone("(84) 9833-8627");
        setEmail("teste@gmail.com.br");
      }
    }
    carregarAjuda();
  }, []);

  return (
    <div
      className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6"
      style={{ backgroundImage: `url(${telaFundo.src})` }}
    >
      <BarraLateral.Root>
        <Image
          src={perfil}
          alt="perfil"
          className="w-20 h-20 rounded-full mx-auto"
        />

        <hr />

        <BarraLateral.Item>
          <Image src={interrogacao} alt="ajuda" className="w-6 h-6" />
          Ajuda
        </BarraLateral.Item>

        <BarraLateral.Item>
          <Image src={marcador} alt="Historico" className="w-6 h-6" />
          Historico
        </BarraLateral.Item>

        <div className="mt-auto">
          <BarraLateral.Item onClick={Voltar}>
            <Image src={retornar} alt="voltar" className="w-6 h-6"/>
            Voltar
          </BarraLateral.Item>
        </div>
      </BarraLateral.Root>

      <main className="flex-1 flex flex-col gap-6">
        <div className="w-full bg-[#FFF8E1] text-[#4A5546] rounded-full px-5 py-3 shadow-md flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
 
          <input
            type="text"
            placeholder="Pesquisar livros"
            className="flex-1 bg-transparent outline-none font-serif italic text-sm"
          />
 
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
 
        {/* Cartão grande de Ajuda */}
        <section className="flex-1 bg-[#FFF8E1] text-[#4A5546] rounded-4xl shadow-lg p-8 flex flex-col items-center justify-between gap-8">
          <h1 className="font-serif italic font-bold tracking-[0.3em]">
            Ajuda
          </h1>
 
          {/* Cartão de contato */}
          <div className="w-full max-w-lg bg-[#FFFBEA] rounded-[40px] shadow-md px-8 py-10 text-center font-serif italic font-bold tracking-widest">
            <p>Número para contato: {telefone}</p>
 
            <hr className="my-5 border-[#4A5546]/60" />
 
            <p>E-mail para contato:</p>
            <a
              href={`mailto:${email}`}
              className="inline-block mt-2 hover:underline underline-offset-4"
            >
              {email}
            </a>
          </div>
 
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="font-serif italic text-xs tracking-widest opacity-80">
              Entre em contato conosco caso tenha dúvidas
              <br />
              ou caso haja algo incorreto com a sua conta.
            </p>
 
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 opacity-80"
              aria-hidden="true"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Help;
