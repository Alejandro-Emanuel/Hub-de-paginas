"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BarraLateral } from "../components/BarraLateral";
import { Titulo } from "../components/Titulo";
import { CardIcone } from "../components/CardsDashboard";
import telaFundo from "../assets/iconeCards/telaDeFundo.png";
import perfil from "../assets/iconeCards/Perfil.png";
import livroIcone from "../assets/iconeCards/Livro.png";
import renovacaoIcone from "../assets/iconeCards/casinhaIcon.png";
import ajudaIcon from "@/assets/iconeCards/interrogaçãoIcon.png"

interface Livro {
  id: number;
  nome: string;
  nome_do_autor: string;
  editora: string;
  ano: number;
  genero: string;
}

interface LivroExterno {
  titulo: string;
  autor: string;
  ano: number | null;
  editora: string;
  capa: string | null;
}

interface ReservasProps {
  Voltar: () => void;
  onLogout: () => void;
  IrParaAjuda: () => void;
}

export function Reservas({ Voltar, onLogout, IrParaAjuda }: ReservasProps) {
  const [painel, setPainel] = useState<"buscar" | "renovacao" | null>(null);
  const [busca, setBusca] = useState("");
  const [livros, setLivros] = useState<Livro[]>([]);
  const [externos, setExternos] = useState<LivroExterno[]>([]);
  const [erro, setErro] = useState("");

  // Roda quando o painel de busca está aberto e sempre que o texto muda
  useEffect(() => {
    if (painel !== "buscar") return;

    let cancelado = false;

    const timer = setTimeout(async () => {
      // 1) Livros da sua biblioteca (banco)
      try {
        const res = await fetch(
          `/api/livros?busca=${encodeURIComponent(busca)}`,
        );
        if (!res.ok) throw new Error("Falha");
        const dados: Livro[] = await res.json();
        if (!cancelado) {
          setLivros(dados);
          setErro("");
        }
      } catch {
        if (!cancelado) setErro("Não foi possível carregar os livros.");
      }

      // 2) Livros externos (Open Library). Se falhar, a lista fica vazia.
      try {
        const resExt = await fetch(
          `/api/livros/externo?busca=${encodeURIComponent(busca)}`,
        );
        if (resExt.ok && !cancelado) setExternos(await resExt.json());
        else if (!cancelado) setExternos([]);
      } catch {
        if (!cancelado) setExternos([]);
      }
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [painel, busca]);

  function handleLogout() {
    localStorage.removeItem("token");
    onLogout();
  }

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
        <BarraLateral.Item onClick={IrParaAjuda}>
          <Image src={ajudaIcon} alt="Ajuda" className="w-6 h-6" />
          Ajuda
        </BarraLateral.Item>

        <BarraLateral.Item onClick={Voltar}>← Voltar</BarraLateral.Item>

        <div className="mt-auto">
          <BarraLateral.Item onClick={handleLogout}>Sair</BarraLateral.Item>
        </div>
      </BarraLateral.Root>

      <main className="flex-1 flex flex-col gap-6">
        <Titulo>Reservas</Titulo>

        <div className="flex flex-1 gap-8">
          {/* Coluna dos dois botões */}
          <div className="flex flex-col justify-around">
            <CardIcone.Root onClick={() => setPainel("buscar")}>
              <Image
                src={livroIcone}
                alt="Buscar livro"
                className="w-20 h-20 object-contain"
              />
              <CardIcone.Texto>Buscar livros</CardIcone.Texto>
            </CardIcone.Root>

            <CardIcone.Root onClick={() => setPainel("renovacao")}>
              <Image
                src={renovacaoIcone}
                alt="Renovação"
                className="w-20 h-20 object-contain"
              />
              <CardIcone.Texto>Renovação de empréstimo</CardIcone.Texto>
            </CardIcone.Root>
          </div>

          {/* Painel da direita */}
          <section className="flex-1 bg-[#FFF8E1] text-[#4A5546] rounded-4xl shadow-lg p-6 min-h-96 max-h-[75vh] overflow-y-auto flex flex-col gap-4">
            {painel === null && (
              <p className="m-auto text-center font-serif italic">
                Escolha uma opção
              </p>
            )}

            {painel === "buscar" && (
              <>
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por título, autor ou gênero"
                  className="w-full rounded-full bg-white/70 px-5 py-3 outline-none focus:ring-2 focus:ring-[#4A5546]"
                />

                {erro && <p className="text-sm text-red-600">{erro}</p>}

                <ul className="flex flex-col gap-3">
                  {livros.map((livro) => (
                    <li
                      key={livro.id}
                      className="rounded-2xl bg-white/60 px-5 py-3"
                    >
                      <p className="font-serif italic font-bold">
                        {livro.nome}
                      </p>
                      <p className="text-sm">
                        {livro.nome_do_autor} · {livro.editora} · {livro.ano}
                      </p>
                      <p className="text-xs opacity-70">{livro.genero}</p>
                    </li>
                  ))}
                </ul>

                {externos.length > 0 && (
                  <>
                    <p className="font-serif italic text-sm">
                      Resultados externos
                    </p>
                    <ul className="flex flex-col gap-3">
                      {externos.map((livro, i) => (
                        <li
                          key={i}
                          className="flex gap-3 rounded-2xl bg-white/60 px-5 py-3"
                        >
                          {livro.capa && (
                            <img
                              src={livro.capa}
                              alt=""
                              className="w-12 h-16 object-cover"
                            />
                          )}
                          <div>
                            <p className="font-serif italic font-bold">
                              {livro.titulo}
                            </p>
                            <p className="text-sm">
                              {livro.autor} · {livro.editora} ·{" "}
                              {livro.ano ?? "s/ ano"}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}

            {painel === "renovacao" && (
              <p className="m-auto text-center font-serif italic">
                Em breve: aqui aparecerão os seus empréstimos para renovar.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
