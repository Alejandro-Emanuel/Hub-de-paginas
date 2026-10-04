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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ titulo, autor, editora, ano, genero });
  };

  const estiloInput = "w-full p-3 rounded-full bg-[#FFF8E1] outline-none";

  return (
    <div className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6">
      <BarraLateral.Root>
        <Image src={perfil} alt="" className="w-20 h-20 rounded-full mx-auto" />
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
          <button onClick={Voltar}>Voltar</button>
        </div>
      </BarraLateral.Root>

      <div className="flex-1 flex flex-col gap-8">
        <Titulo>Cadastrar livro</Titulo>

        <form
          onSubmit={handleSubmit}
          className="flex items-end justify-center gap-10"
        >
          <div className="w-full max-w-md bg-[#E2E4CF] text-[#4A5546] rounded-[40px] shadow-lg p-8 flex flex-col gap-5">
            <h2 className="text-center">Cadastro Manual</h2>

            <input
              className={estiloInput}
              placeholder="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <input
              className={estiloInput}
              placeholder="autor"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
            />
            <input
              className={estiloInput}
              placeholder="editora"
              value={editora}
              onChange={(e) => setEditora(e.target.value)}
            />
            <input
              className={estiloInput}
              placeholder="ano"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
            />
            <input
              className={estiloInput}
              placeholder="genero"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-5">
            <button
              type="submit"
              className="bg-[#6BD464] font-serif italic font-bold py-2 px-8 rounded-full shadow-md"
            >
              Cadastrar
            </button>
            <button
              type="button"
              onClick={Voltar}
              className="bg-[#E8443A] font-serif italic font-bold py-2 px-8 rounded-full shadow-md"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
