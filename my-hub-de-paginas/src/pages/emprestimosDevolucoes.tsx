
"use client";

import { useState } from "react";

type TelaAdmin =
  | "dashboardAdm"
  | "livros"
  | "relatorio"
  | "multas"
  | "historico"
  | "perfil";

interface EmprestimosDevolucoesProps {
  onLogout: () => void;
  IrPara: (tela: TelaAdmin) => void;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  matricula: string;
}

interface Emprestimo {
  id: number;
  usuario: string;
  livro: string;
  dataEmprestimo: string;
  dataDevolucao: string;
  status: "Em andamento" | "Atrasado" | "Devolvido";
}

const usuarios: Usuario[] = [
  { id: 1, nome: "João Silva", email: "joao@email.com", matricula: "2024001" },
  { id: 2, nome: "Maria Oliveira", email: "maria@email.com", matricula: "2024002" },
  { id: 3, nome: "Pedro Santos", email: "pedro@email.com", matricula: "2024003" },
  { id: 4, nome: "Ana Costa", email: "ana@email.com", matricula: "2024004" },
];

const emprestimos: Emprestimo[] = [
  { id: 1, usuario: "João Silva", livro: "All Tomorrows", dataEmprestimo: "05/11/2026", dataDevolucao: "15/11/2026", status: "Em andamento" },
  { id: 2, usuario: "Maria Oliveira", livro: "O Chamado de Cthulhu", dataEmprestimo: "20/10/2026", dataDevolucao: "30/10/2026", status: "Atrasado" },
  { id: 3, usuario: "Pedro Santos", livro: "Orgulho e Preconceito", dataEmprestimo: "01/11/2026", dataDevolucao: "10/11/2026", status: "Devolvido" },
];

const statusList = ["Todos", "Em andamento", "Atrasado", "Devolvido"];

export function EmprestimosDevolucoes({
  onLogout,
  IrPara,
}: EmprestimosDevolucoesProps) {
  const [modo, setModo] = useState<"inicio" | "usuarios" | "devolucoes">("inicio");
  const [pesquisa, setPesquisa] = useState("");
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const usuariosFiltrados = usuarios.filter((u) =>
    [u.nome, u.email, u.matricula].some((campo) =>
      campo.toLowerCase().includes(pesquisa.toLowerCase())
    )
  );

  const emprestimosFiltrados = emprestimos.filter(
    (e) =>
      (filtroStatus === "Todos" || e.status === filtroStatus) &&
      (!usuarioSelecionado || e.usuario === usuarioSelecionado.nome)
  );

  const selecionarModo = (novoModo: "usuarios" | "devolucoes") => {
    setModo(novoModo);
    setPesquisa("");
    setUsuarioSelecionado(null);
    setFiltroStatus("Todos");
  };

  const voltar = () => setModo("inicio");

  const corStatus = (status: Emprestimo["status"]) => ({
    "Atrasado": "bg-[#f3d3c1] text-[#9b5139]",
    "Devolvido": "bg-[#cbdcc0] text-[#4f7049]",
    "Em andamento": "bg-[#eee0b9] text-[#85703d]",
  }[status]);

  return (
    <main className="min-h-screen w-full bg-[#c5cbaa] p-3 sm:p-5 flex flex-col md:flex-row gap-5">

      <aside className="w-full md:w-[65px] md:min-h-[calc(100vh-40px)] flex flex-col justify-between shrink-0">
        <div className="rounded-[28px] bg-[#f8f5df] px-2 py-3 shadow-sm">

          <button onClick={() => IrPara("perfil")} title="Perfil" className="w-full flex justify-center mb-5">
            <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
              <circle cx="20" cy="20" r="17" fill="#78836f" />
              <circle cx="20" cy="14" r="6" fill="#f8f5df" />
              <path d="M8 31C9.5 24.5 14 21 20 21C26 21 30.5 24.5 32 31" fill="#f8f5df" />
            </svg>
          </button>

          <div className="border-t border-[#c5cbb7] mb-5 mx-1" />

          <nav className="flex flex-row md:flex-col items-center justify-around md:gap-7">
            {[
              ["dashboardAdm", "ⓘ", "Ajuda"],
              ["livros", "▤", "Livros"],
              ["historico", "♧", "Histórico"],
            ].map(([tela, icone, titulo]) => (
              <button
                key={tela}
                onClick={() => IrPara(tela as TelaAdmin)}
                title={titulo}
                className="text-[#64735d] text-2xl hover:text-[#283a2d] transition"
              >
                {icone}
              </button>
            ))}
          </nav>
        </div>

        <div className="rounded-[25px] bg-[#f8f5df] px-2 py-3 shadow-sm flex justify-center items-center">
          <button onClick={onLogout} title="Sair" className="text-[#64735d] text-2xl hover:text-[#283a2d] transition">
            ⇥
          </button>
        </div>
      </aside>

      <section className="flex-1 min-w-0 flex flex-col gap-4">

        <header className="h-[43px] rounded-full bg-[#faf8e9] flex items-center justify-center shadow-sm">
          <h1 className="font-serif italic font-bold tracking-[1px] text-[#63735e] text-sm sm:text-base">
            Empréstimos e Devoluções
          </h1>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[120px_minmax(0,1fr)] gap-5 md:gap-7">

          <div className="flex flex-row md:flex-col justify-center md:justify-start gap-5 md:gap-12 py-3">
            {[
              { modo: "usuarios", titulo: <>Buscar<br />usuários</>, icone: "usuario" },
              { modo: "devolucoes", titulo: <>Estado<br />Devolução</>, icone: "relogio" },
            ].map((item) => (
              <button
                key={item.modo}
                onClick={() => selecionarModo(item.modo as "usuarios" | "devolucoes")}
                className={`w-[105px] h-[100px] rounded-[25px] bg-[#fff9e5] shadow-[0_4px_8px_rgba(0,0,0,0.17)] flex flex-col items-center justify-center gap-1 transition hover:-translate-y-1 ${
                  modo === item.modo ? "ring-2 ring-[#89977c]" : ""
                }`}
              >
                {item.icone === "usuario" ? (
                  <svg viewBox="0 0 60 60" className="w-12 h-12" fill="none">
                    <circle cx="30" cy="30" r="23" stroke="#78836f" strokeWidth="5" />
                    <circle cx="30" cy="21" r="8" fill="#78836f" />
                    <path d="M13 45C15 36 21 32 30 32C39 32 45 36 47 45" fill="#78836f" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 60 60" className="w-12 h-12" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M49 23A22 22 0 1 0 51 34" />
                    <path d="M49 8V23H34" />
                    <path d="M30 17V30L39 38" />
                  </svg>
                )}

                <span className="font-serif italic font-bold text-[#63735e] text-sm text-center leading-tight">
                  {item.titulo}
                </span>
              </button>
            ))}
          </div>

          <section className="min-h-[450px] rounded-[28px] bg-[#fff9e5] shadow-[0_3px_8px_rgba(0,0,0,0.12)] p-5 sm:p-7 overflow-y-auto">

            {modo === "inicio" && (
              <div className="h-full min-h-[400px] flex items-center justify-center">
                <p className="font-serif italic text-[#89927c] text-center">
                  Selecione uma opção para começar.
                </p>
              </div>
            )}

            {modo === "usuarios" && (
              <div>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                  <h2 className="font-serif italic font-bold text-[#63735e] text-lg">
                    Buscar usuários
                  </h2>
                  <button onClick={voltar} className="text-[#63735e] text-sm hover:underline">
                    Voltar
                  </button>
                </div>

                <input
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  placeholder="Pesquisar por nome, e-mail ou matrícula..."
                  className="w-full rounded-full bg-[#e9ead8] px-5 py-3 text-sm text-[#4e5749] outline-none focus:ring-2 focus:ring-[#89977c]"
                />

                <div className="mt-5 space-y-3">
                  {usuariosFiltrados.map((usuario) => (
                    <button
                      key={usuario.id}
                      onClick={() => setUsuarioSelecionado(usuario)}
                      className="w-full text-left rounded-2xl bg-[#e9ead8] p-4 hover:bg-[#dce1cc] transition"
                    >
                      <p className="font-serif italic font-bold text-[#586b55]">{usuario.nome}</p>
                      <p className="text-xs text-[#77816b] mt-1">{usuario.email}</p>
                      <p className="text-xs text-[#77816b] mt-1">Matrícula: {usuario.matricula}</p>
                    </button>
                  ))}

                  {!usuariosFiltrados.length && (
                    <p className="text-center py-8 text-sm text-[#77816b]">
                      Nenhum usuário encontrado.
                    </p>
                  )}
                </div>

                {usuarioSelecionado && (
                  <div className="mt-6 rounded-2xl bg-[#e0e5d1] p-4">
                    <h3 className="font-serif italic font-bold text-[#586b55] mb-3">
                      Empréstimos de {usuarioSelecionado.nome}
                    </h3>

                    {emprestimos.filter((e) => e.usuario === usuarioSelecionado.nome).map((item) => (
                      <div key={item.id} className="border-b border-[#c3cbb5] py-3 last:border-0">
                        <p className="font-bold text-sm text-[#586b55]">{item.livro}</p>
                        <p className="text-xs text-[#77816b] mt-1">Devolução prevista: {item.dataDevolucao}</p>
                        <p className="text-xs text-[#77816b] mt-1">Situação: {item.status}</p>
                      </div>
                    ))}

                    {!emprestimos.some((e) => e.usuario === usuarioSelecionado.nome) && (
                      <p className="text-sm text-[#77816b]">
                        Este usuário não possui empréstimos registrados.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {modo === "devolucoes" && (
              <div>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                  <h2 className="font-serif italic font-bold text-[#63735e] text-lg">
                    Estado das devoluções
                  </h2>
                  <button onClick={voltar} className="text-[#63735e] text-sm hover:underline">
                    Voltar
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {statusList.map((status) => (
                    <button
                      key={status}
                      onClick={() => setFiltroStatus(status)}
                      className={`rounded-full px-4 py-2 text-xs font-serif italic transition ${
                        filtroStatus === status
                          ? "bg-[#78866d] text-white"
                          : "bg-[#e4e8d6] text-[#586b55] hover:bg-[#d5ddc8]"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {emprestimosFiltrados.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-[#e9ead8] p-4">
                      <div className="flex justify-between items-start gap-3 flex-wrap">
                        <div>
                          <h3 className="font-serif italic font-bold text-[#586b55]">{item.livro}</h3>
                          <p className="text-xs text-[#77816b] mt-1">Usuário: {item.usuario}</p>
                        </div>

                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${corStatus(item.status)}`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[#77816b]">
                        <p>Empréstimo:<br /><strong>{item.dataEmprestimo}</strong></p>
                        <p>Devolução:<br /><strong>{item.dataDevolucao}</strong></p>
                      </div>
                    </div>
                  ))}

                  {!emprestimosFiltrados.length && (
                    <p className="text-center py-8 text-sm text-[#77816b]">
                      Nenhum empréstimo encontrado.
                    </p>
                  )}
                </div>
              </div>
            )}

          </section>
        </div>
      </section>
    </main>
  );
}
