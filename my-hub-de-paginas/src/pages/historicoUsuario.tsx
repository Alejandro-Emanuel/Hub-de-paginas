"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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
  | "reservas"
  | "multasUsuario"
  | "help";

interface HistoricoUsuarioProps {
  onLogout: () => void;
  IrPara: (tela: TelaUsuario) => void;
}

// Formato devolvido por /api/historico-usuario
interface LivroHistorico {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  dataEmprestimo: string; // yyyy-mm-dd
  dataPrevistaDevolucao: string; // yyyy-mm-dd
  dataDevolucao: string | null; // yyyy-mm-dd ou null
  status: "Devolvido" | "Atrasado" | "Em andamento";
}

const corStatus: Record<LivroHistorico["status"], string> = {
  Devolvido: "bg-[#DDE8CF] text-[#4B6B3A]",
  "Em andamento": "bg-[#F5E3B8] text-[#7A5B1E]",
  Atrasado: "bg-[#F2CFC7] text-[#9A3A2A]",
};

// "2026-10-05" -> "05/10/2026" (sem new Date, para evitar problema de fuso)
function formatarData(iso: string | null) {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function HistoricoUsuario({ onLogout, IrPara }: HistoricoUsuarioProps) {
  const [historico, setHistorico] = useState<LivroHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [livroSelecionado, setLivroSelecionado] =
    useState<LivroHistorico | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarHistorico() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

        const resposta = await fetch("/api/historico-usuario", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (resposta.status === 401) {
          throw new Error("Sua sessão expirou. Entre novamente.");
        }
        if (resposta.status === 403) {
          throw new Error("Esta área é exclusiva para contas de usuário.");
        }
        if (!resposta.ok) {
          throw new Error("Não foi possível carregar o histórico.");
        }

        const dados: LivroHistorico[] = await resposta.json();
        if (!Array.isArray(dados)) {
          throw new Error("A resposta do histórico está inválida.");
        }
        setHistorico(dados);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Erro ao carregar histórico:", error);
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o histórico.",
        );
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    void carregarHistorico();
    return () => controller.abort();
  }, []);

  const historicoFiltrado = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    if (!termo) return historico;
    return historico.filter(
      (livro) =>
        livro.titulo.toLowerCase().includes(termo) ||
        livro.autor.toLowerCase().includes(termo) ||
        livro.categoria.toLowerCase().includes(termo),
    );
  }, [historico, pesquisa]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  return (
    <div
      className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6"
      style={{ backgroundImage: `url(${telaFundo.src})` }}
    >
      {/* Barra lateral — mesmo componente do administrador */}
      <BarraLateral.Root>
        <Image
          src={perfil}
          alt="Perfil do usuário"
          className="w-20 h-20 rounded-full mx-auto"
        />
        <hr />

        <BarraLateral.Item onClick={() => IrPara("dashboardUsuario")}>
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

        <BarraLateral.Item ativo>
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
        <Titulo>Seu Histórico</Titulo>

        {/* Busca */}
        <div className="h-12 rounded-full bg-[#FFF8E1] shadow-lg flex items-center px-5">
          <input
            type="text"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar por título, autor ou categoria"
            aria-label="Pesquisar no histórico"
            className="w-full bg-transparent outline-none text-sm text-[#4A5546] placeholder:text-[#7d8270]"
          />
          <span aria-hidden="true" className="text-xl text-[#444b3e]">
            ⌕
          </span>
        </div>

        {/* Lista */}
        <section className="flex-1 rounded-4xl bg-[#FFF8E1] shadow-lg p-6 sm:p-8">
          {carregando ? (
            <p className="py-16 text-center font-serif italic text-[#68745e]">
              Carregando histórico...
            </p>
          ) : erro ? (
            <p role="alert" className="py-16 text-center text-red-700">
              {erro}
            </p>
          ) : historicoFiltrado.length === 0 ? (
            <p className="py-16 text-center font-serif italic text-[#68745e]">
              {historico.length === 0
                ? "Você ainda não pegou nenhum livro emprestado."
                : "Nenhum livro encontrado para essa busca."}
            </p>
          ) : (
            <ul className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {historicoFiltrado.map((livro) => (
                <li key={livro.id}>
                  <button
                    type="button"
                    onClick={() => setLivroSelecionado(livro)}
                    className="w-full flex items-center gap-4 rounded-3xl bg-[#F8F5E4] p-4 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
                  >
                    {/* Capa */}
                    <div className="relative w-16 h-22 shrink-0 rounded-[10px] border-[3px] border-[#241916] bg-linear-to-br from-[#96735d] to-[#38251f] shadow-md flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-1 border border-[#c3a58b]/60 rounded-sm" />
                      <span className="text-2xl text-[#dfc6a7]">⚝</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-serif italic font-bold text-[#52644f] text-base leading-tight truncate">
                        {livro.titulo}
                      </h2>
                      <p className="font-serif italic text-[#64715e] text-xs mt-1 truncate">
                        {livro.autor}
                      </p>
                      <p className="text-[11px] text-[#7d8270] mt-2">
                        {formatarData(livro.dataEmprestimo)} até{" "}
                        {formatarData(
                          livro.dataDevolucao ?? livro.dataPrevistaDevolucao,
                        )}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${corStatus[livro.status]}`}
                    >
                      {livro.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Detalhes */}
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
                Detalhes do empréstimo
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
                  <strong>Emprestado em:</strong>{" "}
                  {formatarData(livroSelecionado.dataEmprestimo)}
                </p>
                <p>
                  <strong>Devolução prevista:</strong>{" "}
                  {formatarData(livroSelecionado.dataPrevistaDevolucao)}
                </p>
                <p>
                  <strong>Devolvido em:</strong>{" "}
                  {formatarData(livroSelecionado.dataDevolucao)}
                </p>
                <p>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${corStatus[livroSelecionado.status]}`}
                  >
                    {livroSelecionado.status}
                  </span>
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