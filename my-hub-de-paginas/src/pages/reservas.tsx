"use client";

import { BarraLateral } from "../components/BarraLateral";
import telaFundo from "../assets/iconeCards/telaDeFundo.png";
import perfil from "../assets/iconeCards/Perfil.png";
import Image from "next/image";
import interrogacao from "../assets/iconeCards/interrogaçãoIcon.png";
import reservas from "../assets/iconeCards/Marcador.png";
import { Titulo } from "../components/Titulo";
import { CardIcone } from "../components/CardsDashboard";
import livro from "../assets/iconeCards/Livro.png";
import renovacao from "../assets/iconeCards/casinhaIcon.png";
import { useState } from "react";

interface Livro {
  id: number;
  nome: string;
  nome_do_autor: string;
  editora: string;
  ano: number;
  genero: string;
}

interface ReservasProps {
  Voltar: () => void;
  onLogout: () => void;
}

type Painel = "buscar" | "renovacao" | null;
 
export function Reservas({ Voltar, onLogout }: ReservasProps) {
  const [painel, setPainel] = useState<Painel>(null);
  const [busca, setBusca] = useState("");
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [erro, setErro] = useState("");

type painel = "buscar" | "renovacao" | null;

export function Reservas({ Voltar, onLogout }: reservasProps) {
  return (
    <div
      className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6"
      style={{ backgroundImage: `url(${telaFundo.src})` }}
    >
      <BarraLateral.Root>
        <Image
          src={perfil}
          alt="Perfil"
          className="w-20 h-20 rounded-full mx-auto"
        />
        <hr />

        <BarraLateral.Item>
          <Image
            src={interrogacao}
            alt="ajuda"
            className="w-20 h-20 rounded-full mx-auto"
          />
          Ajuda
        </BarraLateral.Item>

        <BarraLateral.Item>
          <Image
            src={reservas}
            alt="reservas"
            className="w-20 h-20 rounded-full mx-auto"
          />
          Historico
        </BarraLateral.Item>

        <div className="mt-auto">
          <BarraLateral.Item onClick={}>
            <span className="w-6 h-6" aria-hidden="true" />
            Sair
          </BarraLateral.Item>
        </div>
      </BarraLateral.Root>

      <main className="flex-1 flex flex-col gap-6">
        <Titulo> Reservas </Titulo>

        <div className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col justify-around">
            <CardIcone.Root onClick={() => setPainel("buscar")}>
              <Image
                src={livro}
                alt="Buscar livro"
                className="w-20 h20 object-contain"
              />
              <CardIcone.Texto>Buscar livros</CardIcone.Texto>
            </CardIcone.Root>

            <CardIcone.Root onClick={() => setPainel("renovacao")}>
              <Image
                src={renovacao}
                alt="renovacao"
                className="w-20 h-20 object-contain"
              />
              <CardIcone.Texto> Renovação de emprestimo </CardIcone.Texto>
            </CardIcone.Root>
          </div>

          <section className="flex-1 bg-[#FFF8E1] text-[#4A5546] rounded-4xl shadow-lg p-6 min-h-96 max-h-[75vh] overflow-y-auto flex flex-col">
            {painel === null && (
              <p className="m-auto text-center font-serif italic">
                Escolha uma opçao
              </p>
            )}

            {painel === "buscar" && (
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="buscar por livro"
                className="w-full rounded-full bg-white/70 px-5 py-3 outline-none focus:ring-2 focus:ring-[#4A5546]"
              />
            )}

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            {carregado && livros.length === 0 && !erro && (
              <p className="text-center font-serif italic">
                Nenhum livro encontrado.
              </p>
            )}
            <ul className="flex flex-col gap-3">
              {livros.map((livro) => (
                <li
                  key={livro.id}
                  className="rounded-2xl bg-white/60 px-5 py-3"
                >
                  <p className="font-serif italic font-bold">{livro.nome}</p>
                  <p className="text-sm">
                    {livro.nome_do_autor} · {livro.editora} · {livro.ano}
                  </p>
                  <p className="text-xs opacity-70">{livro.genero}</p>
                </li>
              ))}
              {painel === "renovacao" && (
                <p className="m-auto text-center font-serif italic">
                  Em breve: aqui aparecerão os seus empréstimos para renovar.
                </p>
              )}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
