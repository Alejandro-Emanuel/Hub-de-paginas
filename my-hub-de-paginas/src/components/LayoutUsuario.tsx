
"use client";

import { ReactNode, useState } from "react";

type TelaUsuario =
  | "dashboardUsuario"
  | "emprestimosUsuario"
  | "historicoUsuario"
  | "multasUsuario"
  | "perfilUsuario";

interface LayoutUsuarioProps {
  children: ReactNode;
  telaAtual: TelaUsuario;
  IrPara: (tela: TelaUsuario) => void;
  onLogout: () => void;
}

export function LayoutUsuario({
  children,
  telaAtual,
  IrPara,
  onLogout,
}: LayoutUsuarioProps) {
  const [pesquisa, setPesquisa] = useState("");

  const menu = [
    { nome: "Pesquisar", tela: "dashboardUsuario" as TelaUsuario, icone: "⌕" },
    { nome: "Empréstimos e Reservas", tela: "emprestimosUsuario" as TelaUsuario, icone: "▣" },
    { nome: "Multas", tela: "multasUsuario" as TelaUsuario, icone: "♧" },
    { nome: "Histórico", tela: "historicoUsuario" as TelaUsuario, icone: "▤" },
  ];

  return (
    <main className="min-h-screen bg-[#c5cbaa] p-3 sm:p-5 flex flex-col md:flex-row gap-5">
      <aside className="w-full md:w-[180px] md:min-h-[calc(100vh-40px)] flex flex-col justify-between gap-4">
        <div className="rounded-[25px] bg-[#f8f5df] p-4 shadow-sm">
          <button
            onClick={() => IrPara("dashboardUsuario")}
            className="w-full flex items-center justify-center gap-2 border-b border-[#c5cbb0] pb-4"
          >
            <span className="text-xl">▣</span>
            <span className="font-serif italic font-bold text-[#60735c]">
              Hub de Páginas
            </span>
          </button>

          <nav className="flex flex-row md:flex-col gap-5 mt-5 flex-wrap">
            {menu.map((item) => (
              <button
                key={item.tela}
                onClick={() => IrPara(item.tela)}
                className={`flex items-center gap-3 text-left font-serif italic font-bold text-sm transition ${
                  telaAtual === item.tela
                    ? "text-[#354b39]"
                    : "text-[#64715e] hover:text-[#354b39]"
                }`}
              >
                <span className="text-xl">{item.icone}</span>
                {item.nome}
              </button>
            ))}
          </nav>
        </div>

        <div className="rounded-[25px] bg-[#f8f5df] p-4 flex flex-row md:flex-col gap-4 shadow-sm">
          <button
            onClick={() => IrPara("perfilUsuario")}
            className="flex items-center gap-3 text-[#64715e] font-serif italic font-bold text-sm"
          >
            <span className="text-xl">ⓘ</span>
            Perfil
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 text-[#64715e] font-serif italic font-bold text-sm"
          >
            <span className="text-xl">⇥</span>
            Sair
          </button>
        </div>
      </aside>

      <section className="flex-1 min-w-0 flex flex-col gap-4">
        <header className="flex items-center gap-3">
          <div className="flex-1 h-[48px] rounded-full bg-[#faf8e9] flex items-center px-5 shadow-sm">
            <span className="mr-3 text-[#69715e]">☰</span>
            <input
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              placeholder="Pesquisar Livros"
              className="w-full bg-transparent outline-none text-sm text-[#4e5749] placeholder:text-[#777b68]"
            />
            <span className="text-xl text-[#444b3e]">⌕</span>
          </div>

          <button
            onClick={() => IrPara("perfilUsuario")}
            className="w-[55px] h-[48px] rounded-[18px] bg-[#faf8e9] flex items-center justify-center text-2xl text-[#64715e] shadow-sm"
            title="Meu perfil"
          >
            ◉
          </button>
        </header>

        <div className="flex-1 rounded-[30px] bg-[#f8f5e4] p-5 sm:p-7 shadow-sm">
          {children}
        </div>
      </section>
    </main>
  );
}
