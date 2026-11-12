
"use client";

import { useMemo, useState } from "react";

type TelaUsuario =
  | "dashboardUsuario"
  | "emprestimos"
  | "reservas"
  | "multas"
  | "help"
  | "perfil";

interface HistoricoUsuarioProps {
  onLogout: () => void;
  IrPara: (tela: TelaUsuario) => void;
}

interface LivroHistorico {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  dataEmprestimo: string;
  dataDevolucao: string;
  status: string;
}

const historicoInicial: LivroHistorico[] = [
  {
    id: 1,
    titulo: "All Tomorrows",
    autor: "C.M Kosemen",
    categoria: "Sci-fi",
    dataEmprestimo: "05/10/2026",
    dataDevolucao: "15/10/2026",
    status: "Devolvido",
  },
  {
    id: 2,
    titulo: "All Tomorrows",
    autor: "C.M Kosemen",
    categoria: "Sci-fi",
    dataEmprestimo: "12/09/2026",
    dataDevolucao: "22/09/2026",
    status: "Devolvido",
  },
  {
    id: 3,
    titulo: "All Tomorrows",
    autor: "C.M Kosemen",
    categoria: "Sci-fi",
    dataEmprestimo: "20/08/2026",
    dataDevolucao: "30/08/2026",
    status: "Devolvido",
  },
  {
    id: 4,
    titulo: "All Tomorrows",
    autor: "C.M Kosemen",
    categoria: "Sci-fi",
    dataEmprestimo: "10/07/2026",
    dataDevolucao: "20/07/2026",
    status: "Devolvido",
  },
  {
    id: 5,
    titulo: "All Tomorrows",
    autor: "C.M Kosemen",
    categoria: "Sci-fi",
    dataEmprestimo: "15/06/2026",
    dataDevolucao: "25/06/2026",
    status: "Devolvido",
  },
  {
    id: 6,
    titulo: "All Tomorrows",
    autor: "C.M Kosemen",
    categoria: "Sci-fi",
    dataEmprestimo: "02/05/2026",
    dataDevolucao: "12/05/2026",
    status: "Devolvido",
  },
];

export function HistoricoUsuario({
  onLogout,
  IrPara,
}: HistoricoUsuarioProps) {
  const [pesquisa, setPesquisa] = useState("");
  const [livroSelecionado, setLivroSelecionado] =
    useState<LivroHistorico | null>(null);

  const historicoFiltrado = useMemo(() => {
    return historicoInicial.filter((livro) => {
      const termo = pesquisa.toLowerCase();

      return (
        livro.titulo.toLowerCase().includes(termo) ||
        livro.autor.toLowerCase().includes(termo) ||
        livro.categoria.toLowerCase().includes(termo)
      );
    });
  }, [pesquisa]);

  return (
    <main className="min-h-screen w-full bg-[#c5cbaa] p-3 sm:p-5 flex flex-col md:flex-row gap-5">

      <aside className="w-full md:w-[65px] flex md:min-h-[calc(100vh-40px)] flex-col justify-between shrink-0">

        <div className="rounded-[28px] bg-[#f8f5df] px-2 py-3 shadow-sm">

          <button
            onClick={() => IrPara("dashboardUsuario")}
            title="Página inicial"
            className="w-full flex justify-center items-center mb-5 text-[#52644f] hover:text-[#283a2d]"
          >
            <span className="text-2xl border-2 border-[#a36bd8] px-1">
              ▣
            </span>
          </button>

          <nav className="flex flex-row md:flex-col items-center justify-around md:justify-start gap-5">

            <button
              onClick={() => IrPara("dashboardUsuario")}
              title="Pesquisar livros"
              className="text-[#536650] text-xl hover:text-[#283a2d] transition"
            >
              ⌕
            </button>

            <button
              onClick={() => IrPara("emprestimos")}
              title="Empréstimos e reservas"
              className="text-[#536650] text-xl hover:text-[#283a2d] transition"
            >
              ▣
            </button>

            <button
              onClick={() => IrPara("multas")}
              title="Multas"
              className="text-[#536650] text-xl hover:text-[#283a2d] transition"
            >
              ♧
            </button>

            <button
              title="Histórico"
              className="text-[#536650] text-xl hover:text-[#283a2d] transition"
            >
              ▤
            </button>

          </nav>
        </div>

        <div className="rounded-[25px] bg-[#f8f5df] px-2 py-3 shadow-sm flex flex-row md:flex-col items-center justify-around md:gap-4">

          <button
            onClick={() => IrPara("help")}
            title="Ajuda"
            className="text-[#64735d] text-2xl hover:text-[#283a2d] transition"
          >
            ⓘ
          </button>

          <button
            onClick={onLogout}
            title="Sair"
            className="text-[#64735d] text-2xl hover:text-[#283a2d] transition"
          >
            ⇥
          </button>

        </div>
      </aside>

      <section className="flex-1 min-w-0 flex flex-col gap-3">

        <header className="flex items-center gap-4">

          <div className="flex-1 h-[45px] rounded-full bg-[#faf8e9] flex items-center px-4 sm:px-5 shadow-sm">

            <span className="text-xl text-[#69715e] mr-3">
              ☰
            </span>

            <input
              type="text"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              placeholder="Pesquisar Livros"
              className="w-full bg-transparent outline-none text-[#4e5749] placeholder:text-[#626454] text-sm"
            />

            <span className="text-xl text-[#444b3e]">
              ⌕
            </span>

          </div>

          <button
            onClick={() => IrPara("perfil")}
            title="Meu perfil"
            className="w-[65px] h-[45px] rounded-[18px] bg-[#faf8e9] flex items-center justify-center hover:bg-white transition shadow-sm"
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

        <section className="flex-1 bg-[#f8f5e4] rounded-[28px] px-5 sm:px-8 py-6 shadow-sm min-h-[500px]">

          <div className="flex items-center justify-center mb-7">

            <h1 className="font-serif italic font-bold tracking-[2px] text-[#52644f] text-lg">
              Seu Histórico:
            </h1>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 sm:gap-x-8 gap-y-5">

            {historicoFiltrado.map((livro) => (

              <button
                key={livro.id}
                onClick={() => setLivroSelecionado(livro)}
                className="flex items-center gap-3 sm:gap-4 text-left group min-w-0"
              >

                <div className="w-[75px] h-[105px] sm:w-[62px] sm:h-[82px] shrink-0 rounded-[10px] border-[3px] border-[#241916] bg-gradient-to-br from-[#96735d] to-[#38251f] shadow-[0_3px_7px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center overflow-hidden relative group-hover:-translate-y-1 transition-transform">

                  <div className="absolute inset-[3px] border border-[#c3a58b]/60 rounded-[4px]" />

                  <span className="text-[#dfc6a7] text-2xl">
                    ⚝
                  </span>

                  <span className="text-[5px] text-[#e7d4bd] font-serif mt-2">
                    ALL TOMORROWS
                  </span>

                  <span className="text-[4px] text-[#d1b89e] font-serif">
                    C.M. KOSEMEN
                  </span>

                </div>

                <div className="min-w-0">

                  <h2 className="font-serif italic font-bold text-[#60735c] text-sm sm:text-base tracking-wide leading-tight group-hover:text-[#354b39] transition">
                    {livro.titulo}
                  </h2>

                  <p className="font-serif italic font-bold text-[#64715e] text-[11px] sm:text-xs mt-1">
                    {livro.autor}
                  </p>

                </div>

              </button>

            ))}

          </div>

          {historicoFiltrado.length === 0 && (

            <div className="flex flex-col items-center justify-center py-16 text-center">

              <span className="text-4xl text-[#8b967d] mb-3">
                ▤
              </span>

              <p className="font-serif italic text-[#68745e]">
                Nenhum livro encontrado no histórico.
              </p>

            </div>

          )}

        </section>
      </section>

      {livroSelecionado && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="w-full max-w-md rounded-[25px] bg-[#f8f5e4] p-6 shadow-xl">

            <div className="flex justify-between items-center mb-5">

              <h2 className="font-serif italic font-bold text-xl text-[#52644f]">
                Detalhes do histórico
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

              <p className="text-[#68745e] mt-1">
                {livroSelecionado.autor}
              </p>

              <div className="mt-5 space-y-3 text-sm text-[#68745e]">

                <p>
                  <strong>Categoria:</strong> {livroSelecionado.categoria}
                </p>

                <p>
                  <strong>Data do empréstimo:</strong>{" "}
                  {livroSelecionado.dataEmprestimo}
                </p>

                <p>
                  <strong>Data da devolução:</strong>{" "}
                  {livroSelecionado.dataDevolucao}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span className="text-[#607c52] font-bold">
                    {livroSelecionado.status}
                  </span>
                </p>

              </div>

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
