"use client";

import { useMemo, useState } from "react";

type TelaUsuario =
  | "emprestimos"
  | "reservas"
  | "multas"
  | "help"
  | "historico"
  | "perfil";

interface DashboardUsuarioProps {
  onLogout: () => void;
  IrPara: (tela: TelaUsuario) => void;
}

interface Livro {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  descricao: string;
}

const livros: Livro[] = [
  {
    id: 1,
    titulo: "All Tomorrows",
    autor: "C.M Kosemen",
    categoria: "Sci-fi",
    descricao: "Uma jornada pela evolução e pelo futuro da humanidade.",
  },
  {
    id: 2,
    titulo: "All Tomorrows",
    autor: "C.M Kosemen",
    categoria: "Sci-fi",
    descricao: "Uma jornada pela evolução e pelo futuro da humanidade.",
  },
  {
    id: 3,
    titulo: "All Tomorrows",
    autor: "C.M Kosemen",
    categoria: "Sci-fi",
    descricao: "Uma jornada pela evolução e pelo futuro da humanidade.",
  },
  {
    id: 4,
    titulo: "O Jardim Secreto",
    autor: "Frances Hodgson",
    categoria: "Drama",
    descricao: "Uma história sobre amizade, descoberta e transformação.",
  },
  {
    id: 5,
    titulo: "O Chamado de Cthulhu",
    autor: "H. P. Lovecraft",
    categoria: "Terror",
    descricao: "Um mistério envolvendo forças antigas e desconhecidas.",
  },
  {
    id: 6,
    titulo: "Orgulho e Preconceito",
    autor: "Jane Austen",
    categoria: "Romance",
    descricao: "Um clássico sobre relacionamentos e diferenças sociais.",
  },
];

const categorias = ["Ação", "Romance", "Terror", "Sci-fi", "Drama"];

export function DashboardUsuario({ onLogout, IrPara }: DashboardUsuarioProps) {
  const [pesquisa, setPesquisa] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);

  const livrosFiltrados = useMemo(() => {
    return livros.filter((livro) => {
      const correspondePesquisa =
        livro.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
        livro.autor.toLowerCase().includes(pesquisa.toLowerCase()) ||
        livro.categoria.toLowerCase().includes(pesquisa.toLowerCase());

      const correspondeCategoria =
        categoriaAtiva === "Todos" || livro.categoria === categoriaAtiva;

      return correspondePesquisa && correspondeCategoria;
    });
  }, [pesquisa, categoriaAtiva]);

  const livrosExibidos = mostrarTodos
    ? livrosFiltrados
    : livrosFiltrados.slice(0, 3);

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  return (
    <main className="min-h-screen w-full bg-[#c5cbaa] p-3 sm:p-5 flex flex-col md:flex-row gap-5">
      <aside className="w-full md:w-[165px] md:min-h-[calc(100vh-40px)] flex flex-col justify-between gap-5 shrink-0">
        <div className="rounded-[28px] bg-[#f8f5df] px-4 py-5 shadow-sm">
          <div className="flex items-center justify-center gap-2 border-b border-[#a6ad91] pb-3">
            <span className="text-2xl text-[#333d32]">▣</span>

            <span className="font-serif italic font-bold text-[#66735e] text-sm whitespace-nowrap">
              Hub de Páginas
            </span>
          </div>

          <nav className="mt-5 flex flex-row md:flex-col gap-4 md:gap-7 flex-wrap">
            <button
              onClick={() => {
                setPesquisa("");
                setCategoriaAtiva("Todos");
                setMostrarTodos(false);
              }}
              className="flex items-center gap-3 text-[#5c6b57] hover:text-[#283a2d] transition"
            >
              <span className="text-xl">⌕</span>

              <span className="font-serif italic font-bold text-sm">
                Pesquisar
              </span>
            </button>

            <button
              onClick={() => IrPara("emprestimos")}
              className="flex items-center gap-3 text-[#5c6b57] hover:text-[#283a2d] transition"
            >
              <span className="text-xl">▣</span>

              <span className="font-serif italic font-bold text-sm text-left leading-tight">
                Empréstimos e Reservas
              </span>
            </button>

            <button
              onClick={() => IrPara("multas")}
              className="flex items-center gap-3 text-[#5c6b57] hover:text-[#283a2d] transition"
            >
              <span className="text-xl">♧</span>

              <span className="font-serif italic font-bold text-sm">
                Multas
              </span>
            </button>

            <button onClick={() => IrPara("historico")}>
              <span className="text-xl">▤</span>
              <span className="font-serif italic font-bold text-sm">
                Histórico
              </span>
            </button>
          </nav>
        </div>

        <div className="rounded-[26px] bg-[#f8f5df] px-4 py-4 shadow-sm flex flex-row md:flex-col gap-4">
          <button
            onClick={() => IrPara("help")}
            className="flex items-center gap-3 text-[#5c6b57] hover:text-[#283a2d] transition"
          >
            <span className="text-xl">ⓘ</span>

            <span className="font-serif italic font-bold text-sm">Ajuda</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-[#5c6b57] hover:text-[#283a2d] transition"
          >
            <span className="text-xl">⇥</span>

            <span className="font-serif italic font-bold text-sm">Log out</span>
          </button>
        </div>
      </aside>

      <section className="flex-1 min-w-0 flex flex-col gap-4">
        <header className="flex items-center gap-4">
          <div className="flex-1 h-[48px] rounded-full bg-[#faf8e9] flex items-center px-5 shadow-sm">
            <span className="text-xl text-[#69715e] mr-4">☰</span>

            <input
              type="text"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              placeholder="Pesquisar Livros"
              className="w-full bg-transparent outline-none text-[#4e5749] placeholder:text-[#626454] text-sm"
            />

            <span className="text-2xl text-[#444b3e]">⌕</span>
          </div>

          <button
            onClick={() => IrPara("perfil")}
            aria-label="Abrir perfil"
            className="w-[72px] h-[48px] rounded-[20px] bg-[#faf8e9] flex items-center justify-center text-[#737d6b] hover:bg-white transition shadow-sm"
          >
            <svg
              viewBox="0 0 40 40"
              className="w-9 h-9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="20" cy="20" r="17" fill="#78836f" />

              <circle cx="20" cy="14" r="6" fill="#f8f5df" />

              <path
                d="M8 31C9.5 24.5 14 21 20 21C26 21 30.5 24.5 32 31"
                fill="#f8f5df"
              />
            </svg>
          </button>
        </header>

        <div className="flex-1 rounded-[32px] bg-[#f8f5e4] px-5 sm:px-7 py-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-serif italic font-bold tracking-[2px] text-[#52644f] text-lg">
              Recomendados:
            </h1>

            <button
              onClick={() => setMostrarTodos(!mostrarTodos)}
              className="font-serif italic font-bold text-[#63715c] text-sm hover:text-[#354b39] transition"
            >
              {mostrarTodos ? "Ver menos" : "Ver mais >"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
            {livrosExibidos.map((livro) => (
              <button
                key={livro.id}
                onClick={() => setLivroSelecionado(livro)}
                className="flex flex-col items-center group"
              >
                <div className="relative w-[145px] h-[190px] rounded-[12px] bg-gradient-to-br from-[#8b6753] to-[#3b2924] border-[5px] border-[#211714] shadow-[0_5px_9px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col items-center justify-center transition-transform group-hover:-translate-y-1">
                  <div className="absolute inset-[5px] border border-[#c3a58b]/70 rounded-[5px]" />

                  <div className="absolute top-7 w-16 h-16 rounded-full border border-[#d8bda0]/50" />

                  <div className="text-[#d9c2a7] text-5xl leading-none opacity-90">
                    ⚝
                  </div>

                  <div className="mt-8 text-center px-2">
                    <p className="font-serif text-[9px] tracking-wide text-[#e7d4bd]">
                      ALL TOMORROWS
                    </p>

                    <p className="font-serif text-[7px] text-[#d1b89e]">
                      C.M. KOSEMEN
                    </p>
                  </div>
                </div>

                <h2 className="mt-3 font-serif italic font-bold text-[#60735c] text-lg tracking-wide">
                  {livro.titulo}
                </h2>

                <p className="font-serif italic font-bold text-[#64715e] text-xs">
                  {livro.autor}
                </p>
              </button>
            ))}
          </div>

          {livrosExibidos.length === 0 && (
            <div className="py-12 text-center text-[#69735f] font-serif italic">
              Nenhum livro encontrado.
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-serif italic font-bold tracking-[2px] text-[#52644f] text-lg mb-4">
              Categorias:
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {categorias.map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => {
                    setCategoriaAtiva(
                      categoriaAtiva === categoria ? "Todos" : categoria,
                    );

                    setMostrarTodos(true);
                  }}
                  className={`rounded-full px-4 py-2 font-serif italic text-sm tracking-wider transition ${
                    categoriaAtiva === categoria
                      ? "bg-[#87947b] text-white shadow-inner"
                      : "bg-[#dce0cb] text-[#586b55] hover:bg-[#c9d1b8]"
                  }`}
                >
                  {categoria}
                </button>
              ))}

              <button
                onClick={() => {
                  setCategoriaAtiva("Todos");
                  setMostrarTodos(true);
                }}
                className="rounded-full bg-[#f5d1a9] px-5 py-2 font-serif italic text-sm text-[#6b5845] hover:bg-[#edc18f] transition"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </section>

      {livroSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[25px] bg-[#f8f5e4] p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-serif italic font-bold text-xl text-[#52644f]">
                Informações do livro
              </h2>

              <button
                onClick={() => setLivroSelecionado(null)}
                className="text-2xl text-[#65715d]"
              >
                ×
              </button>
            </div>

            <div className="text-center">
              <h3 className="font-serif italic font-bold text-2xl text-[#52644f]">
                {livroSelecionado.titulo}
              </h3>

              <p className="text-[#68745e] mt-1">{livroSelecionado.autor}</p>

              <p className="text-sm text-[#68745e] mt-4">
                Categoria: {livroSelecionado.categoria}
              </p>

              <p className="text-sm text-[#68745e] mt-2">
                {livroSelecionado.descricao}
              </p>
            </div>

            <button
              onClick={() => setLivroSelecionado(null)}
              className="mt-6 w-full rounded-full bg-[#78866d] py-3 text-white font-serif italic font-bold hover:bg-[#64765b] transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
