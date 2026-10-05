'use client';

import { BarraLateral } from "../components/BarraLateral";
import { Titulo } from "../components/Titulo";
import Image from "next/image";
import perfil from "../assets/iconeCards/Perfil.png";
import { useState } from "react";

interface CadastrarLivrosProps {
  Voltar: () => void;
}

export function CadastrarLivros({ Voltar }: CadastrarLivrosProps) {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [editora, setEditora] = useState("");
  const [ano, setAno] = useState("");
  const [genero, setGenero] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!titulo || !autor) {
      setErro("Preencha pelo menos o título e o autor.");
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch("/api/livros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ titulo, autor, editora, ano, genero }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.mensagem || "Erro ao cadastrar o livro.");
        return;
      }

      setSucesso("Livro cadastrado com sucesso!");
      
      // Limpa os campos do formulário
      setTitulo("");
      setAutor("");
      setEditora("");
      setAno("");
      setGenero("");
    } catch (err) {
      setErro("Erro ao se conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  const estiloInput = "w-full p-3 rounded-full bg-[#FFF8E1] outline-none text-[#4A5546]";

  return (
    <div className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6">
      <BarraLateral.Root>
        <Image src={perfil} alt="Perfil" className="w-20 h-20 rounded-full mx-auto" />
        <hr />

        <BarraLateral.Item>
          <Image
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'/%3E"
            alt=""
            width={24}
            height={24}
          />
        </BarraLateral.Item>

        <BarraLateral.Item>
          <Image
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'/%3E"
            alt=""
            width={24}
            height={24}
          />
        </BarraLateral.Item>

        <BarraLateral.Item>
          <Image
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'/%3E"
            alt=""
            width={24}
            height={24}
          />
        </BarraLateral.Item>
        <div className="mt-auto">
          <button onClick={Voltar} type="button" className="font-semibold text-[#4A5546]">
            Voltar
          </button>
        </div>
      </BarraLateral.Root>

      <div className="flex-1 flex flex-col gap-8">
        <Titulo>Cadastrar livro</Titulo>

        <form
          onSubmit={handleSubmit}
          className="flex items-end justify-center gap-10"
        >
          <div className="w-full max-w-md bg-[#E2E4CF] text-[#4A5546] rounded-[40px] shadow-lg p-8 flex flex-col gap-5">
            <h2 className="text-center font-bold text-lg">Cadastro Manual</h2>

            {erro && <p className="text-xs text-red-600 text-center">{erro}</p>}
            {sucesso && <p className="text-xs text-green-700 text-center">{sucesso}</p>}

            <input
              className={estiloInput}
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <input
              className={estiloInput}
              placeholder="Autor"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
            />
            <input
              className={estiloInput}
              placeholder="Editora"
              value={editora}
              onChange={(e) => setEditora(e.target.value)}
            />
            <input
              className={estiloInput}
              placeholder="Ano"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
            />
            <input
              className={estiloInput}
              placeholder="Gênero"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-5">
            <button
              type="submit"
              disabled={carregando}
              className="bg-[#6BD464] font-serif italic font-bold py-2 px-8 rounded-full shadow-md hover:bg-[#5bc255] transition-colors disabled:opacity-50"
            >
              {carregando ? "Cadastrando..." : "Cadastrar"}
            </button>
            <button
              type="button"
              onClick={Voltar}
              className="bg-[#E8443A] text-white font-serif italic font-bold py-2 px-8 rounded-full shadow-md hover:bg-[#d3372d] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
