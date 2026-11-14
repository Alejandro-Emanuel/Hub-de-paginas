"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BarraLateral } from "../components/BarraLateral";
import { Titulo } from "../components/Titulo";
import telaFundo from "../assets/iconeCards/telaDeFundo.png";
import perfil from "../assets/iconeCards/Perfil.png";
import casinhaIcon from "../assets/iconeCards/casinhaIcon.png";
import livroIcon from "../assets/iconeCards/Livro.png";
import marcador from "../assets/iconeCards/Marcador.png";
import multaIcon from "../assets/iconeCards/Multa.png";
import ajudaIcon from "../assets/iconeCards/interrogaçãoIcon.png";
import logoutIcon from "../assets/iconeCards/Log out.png";

type TelaUsuario =
  | "dashboardUsuario"
  | "historicoUsuario"
  | "reservas"
  | "multasUsuario"
  | "help";

interface DashboardUsuarioProps {
  onLogout: () => void;
  IrPara: (tela: TelaUsuario) => void;
}

interface Livro {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  editora: string;
  ano: number;
}

interface DashboardUsuarioData {
  livros: Livro[];
  categorias: string[];
}

export function DashboardUsuario({ onLogout, IrPara }: DashboardUsuarioProps) {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);

  useEffect(() => {
    let cancelado = false;
    const controller = new AbortController();

    async function carregarLivros() {
      setCarregando(true);
      setErro("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Sua sessão expirou. Entre novamente.");
        }

        const parametros = new URLSearchParams();
        if (pesquisa.trim()) parametros.set("busca", pesquisa.trim());
        if (categoriaAtiva !== "Todos") {
          parametros.set("categoria", categoriaAtiva);
        }

        const resposta = await fetch(
          `/api/dashboard-usuario?${parametros.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );

        if (resposta.status === 401) {
          throw new Error("Sua sessão expirou. Entre novamente.");
        }
        if (resposta.status === 403) {
          throw new Error("Esta área é exclusiva para contas de usuário.");
        }
        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os livros.");
        }

        const dados: DashboardUsuarioData = await resposta.json();
        if (!Array.isArray(dados.livros) || !Array.isArray(dados.categorias)) {
          throw new Error("A resposta do dashboard está inválida.");
        }

        if (!cancelado) {
          setLivros(dados.livros);
          setCategorias(dados.categorias);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Erro ao carregar livros do dashboard:", error);
        if (!cancelado) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os livros.",
          );
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    const timer = setTimeout(() => {
      void carregarLivros();
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [pesquisa, categoriaAtiva]);

  const livrosExibidos = mostrarTodos ? livros : livros.slice(0, 6);

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  return (
    <div
      className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6"
      style={{ backgroundImage: `url(${telaFundo.src})` }}
    >
      {/* Barra lateral — igual à do administrador e do histórico */}
      <BarraLateral.Root>
        <Image
          src={perfil}
          alt="Perfil do usuário"
          className="w-20 h-20 rounded-full mx-auto"
        />
        <hr />

        <BarraLateral.Item ativo>
          <Image src={casinhaIcon} alt="" className="w-6 h-6" />
          Início
        </BarraLateral.Item>

        <BarraLateral.Item onClick={() => IrPara("reservas")}>
          <Image src={livroIcon} alt="" className="w-6 h-6" />
          Reservas
        </BarraLateral.Item>

        <BarraLateral.Item onClick={() => IrPara("multasUsuario")}>
          <Image src={multaIcon} alt="" className="w-6 h-6" />
          Multas
        </BarraLateral.Item>

        <BarraLateral.Item onClick={() => IrPara("historicoUsuario")}>
          <Image src={marcador} alt="" className="w-6 h-6" />
          Histórico
        </BarraLateral.Item>

        <div className="mt-auto flex flex-col gap-4">
          <BarraLateral.Item onClick={() => IrPara("help")}>
            <Image src={ajudaIcon} alt="" className="w-6 h-6" />
            Ajuda
          </BarraLateral.Item>

          <BarraLateral.Item onClick={handleLogout}>
            <Image src={logoutIcon} alt="" className="w-6 h-6" />
            Log out
          </BarraLateral.Item>
        </div>
      </BarraLateral.Root>

      <main className="flex-1 min-w-0 flex flex-col gap-6">
        <Titulo>Hub de Páginas</Titulo>

        {/* Busca */}
        <div className="h-12 rounded-full bg-[#FFF8E1] shadow-lg flex items-center px-5">
          <input
            type="text"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar livros"
            aria-label="Pesquisar livros"
            className="w-full bg-transparent outline-none text-sm text-[#4A5546] placeholder:text-[#7d8270]"
          />
          <span aria-hidden="true" className="text-xl text-[#444b3e]">
            ⌕
          </span>
        </div>

        <section className="flex-1 rounded-4xl bg-[#FFF8E1] shadow-lg p-6 sm:p-8">
          {/* Livros */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif italic font-bold tracking-[2px] text-[#52644f] text-lg">
              {categoriaAtiva === "Todos" ? "Recomendados:" : `${categoriaAtiva}:`}
            </h2>

            {livros.length > 6 && (
              <button
                type="button"
                onClick={() => setMostrarTodos(!mostrarTodos)}
                className="font-serif italic font-bold text-[#63715c] text-sm hover:text-[#354b39] transition cursor-pointer"
              >
                {mostrarTodos ? "Ver menos" : "Ver mais >"}
              </button>
            )}
          </div>

          {carregando ? (
            <p className="py-12 text-center font-serif italic text-[#68745e]">
              Carregando livros...
            </p>
          ) : erro ? (
            <p role="alert" className="py-12 text-center text-red-700">
              {erro}
            </p>
          ) : livros.length === 0 ? (
            <p className="py-12 text-center font-serif italic text-[#68745e]">
              Nenhum livro encontrado.
            </p>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {livrosExibidos.map((livro) => (
                <li key={livro.id}>
                  <button
                    type="button"
                    onClick={() => setLivroSelecionado(livro)}
                    className="w-full h-full flex flex-col items-center rounded-3xl bg-[#F8F5E4] p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
                  >
                    <div className="relative w-28 h-36 rounded-xl border-[4px] border-[#241916] bg-linear-to-br from-[#8b6753] to-[#3b2924] shadow-md overflow-hidden flex flex-col items-center justify-center">
                      <div className="absolute inset-1 border border-[#c3a58b]/70 rounded-sm" />
                      <span className="text-4xl text-[#d9c2a7] opacity-90">
                        ⚝
                      </span>
                      <p className="mt-3 px-2 text-center font-serif text-[8px] leading-tight text-[#e7d4bd] line-clamp-2">
                        {livro.titulo}
                      </p>
                    </div>

                    <h3 className="mt-3 font-serif italic font-bold text-[#52644f] text-base text-center leading-tight line-clamp-2">
                      {livro.titulo}
                    </h3>
                    <p className="mt-1 font-serif italic text-[#64715e] text-xs text-center line-clamp-1">
                      {livro.autor}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Categorias */}
          <div className="mt-10">
            <h2 className="font-serif italic font-bold tracking-[2px] text-[#52644f] text-lg mb-4">
              Categorias:
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {categorias.map((categoria) => (
                <button
                  key={categoria}
                  type="button"
                  onClick={() => {
                    setCategoriaAtiva(
                      categoriaAtiva === categoria ? "Todos" : categoria,
                    );
                    setMostrarTodos(true);
                  }}
                  className={`rounded-full px-4 py-2 font-serif italic text-sm tracking-wider transition cursor-pointer ${
                    categoriaAtiva === categoria
                      ? "bg-[#87947b] text-white shadow-inner"
                      : "bg-[#dce0cb] text-[#586b55] hover:bg-[#c9d1b8]"
                  }`}
                >
                  {categoria}
                </button>
              ))}

              {categoriaAtiva !== "Todos" && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoriaAtiva("Todos");
                    setMostrarTodos(false);
                  }}
                  className="rounded-full bg-[#f5d1a9] px-5 py-2 font-serif italic text-sm text-[#6b5845] hover:bg-[#edc18f] transition cursor-pointer"
                >
                  Limpar filtro
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Detalhes do livro */}
      {livroSelecionado && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setLivroSelecionado(null)}
        >
          <div
            className="w-full max-w-md rounded-[30px] bg-[#FFF8E1] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-serif italic font-bold text-xl text-[#52644f]">
                Informações do livro
              </h2>
              <button
                type="button"
                onClick={() => setLivroSelecionado(null)}
                aria-label="Fechar"
                className="text-2xl text-[#65715d] cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="text-center">
              <h3 className="font-serif italic font-bold text-2xl text-[#52644f]">
                {livroSelecionado.titulo}
              </h3>
              <p className="text-[#68745e] mt-1">{livroSelecionado.autor}</p>

              <div className="mt-5 space-y-3 text-sm text-[#68745e]">
                <p>
                  <strong>Categoria:</strong> {livroSelecionado.categoria}
                </p>
                <p>
                  <strong>Editora:</strong> {livroSelecionado.editora}
                </p>
                <p>
                  <strong>Ano:</strong> {livroSelecionado.ano}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLivroSelecionado(null)}
              className="mt-6 w-full rounded-full bg-[#78866d] py-3 text-white font-serif italic font-bold hover:bg-[#64765b] transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}