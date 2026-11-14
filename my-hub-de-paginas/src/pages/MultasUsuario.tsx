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
  | "historicoUsuario"
  | "reservas"
  | "help";

interface MultasUsuarioProps {
  onLogout: () => void;
  IrPara: (tela: TelaUsuario) => void;
}

// Formato devolvido por /api/multas-usuario
interface MultaUsuario {
  id: number;
  livro: string;
  autor: string;
  motivo: string;
  valor: number;
  dataPrevistaDevolucao: string; // yyyy-mm-dd
  dataDevolucao: string; // yyyy-mm-dd
  status: "Pendente" | "Paga";
}

type Aba = "Pendente" | "Paga";

const moeda = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// "2026-10-05" -> "05/10/2026" (sem new Date, para evitar problema de fuso)
function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function MultasUsuario({ onLogout, IrPara }: MultasUsuarioProps) {
  const [multas, setMultas] = useState<MultaUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState<Aba>("Pendente");

  useEffect(() => {
    const controller = new AbortController();

    async function carregarMultas() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

        const resposta = await fetch("/api/multas-usuario", {
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
          throw new Error("Não foi possível carregar suas multas.");
        }

        const dados: MultaUsuario[] = await resposta.json();
        if (!Array.isArray(dados)) {
          throw new Error("A resposta das multas está inválida.");
        }
        setMultas(dados);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Erro ao carregar multas:", error);
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar suas multas.",
        );
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    void carregarMultas();
    return () => controller.abort();
  }, []);

  const { emAberto, pagas, totalEmAberto, totalPago } = useMemo(() => {
    const emAberto = multas.filter((m) => m.status === "Pendente");
    const pagas = multas.filter((m) => m.status === "Paga");
    return {
      emAberto,
      pagas,
      totalEmAberto: emAberto.reduce((soma, m) => soma + m.valor, 0),
      totalPago: pagas.reduce((soma, m) => soma + m.valor, 0),
    };
  }, [multas]);

  const listaAtual = aba === "Pendente" ? emAberto : pagas;

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  return (
    <div
      className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6"
      style={{ backgroundImage: `url(${telaFundo.src})` }}
    >
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

        <BarraLateral.Item ativo>
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
        <Titulo>Suas Multas</Titulo>

        {/* Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-4xl bg-[#FFF8E1] shadow-lg p-6">
            <p className="font-serif italic font-bold text-sm text-[#64715e]">
              Valor em aberto
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${
                totalEmAberto > 0 ? "text-[#9A3A2A]" : "text-[#52644f]"
              }`}
            >
              {moeda(totalEmAberto)}
            </p>
            <p className="mt-1 text-xs text-[#7d8270]">
              {emAberto.length === 1
                ? "1 multa aguardando pagamento"
                : `${emAberto.length} multas aguardando pagamento`}
            </p>
          </div>

          <div className="rounded-4xl bg-[#FFF8E1] shadow-lg p-6">
            <p className="font-serif italic font-bold text-sm text-[#64715e]">
              Já pago
            </p>
            <p className="mt-2 text-3xl font-bold text-[#4B6B3A]">
              {moeda(totalPago)}
            </p>
            <p className="mt-1 text-xs text-[#7d8270]">
              {pagas.length === 1
                ? "1 multa paga"
                : `${pagas.length} multas pagas`}
            </p>
          </div>
        </div>

        {/* Lista */}
        <section className="flex-1 rounded-4xl bg-[#FFF8E1] shadow-lg p-6 sm:p-8">
          <div
            role="tablist"
            aria-label="Filtrar multas"
            className="mb-6 flex flex-wrap gap-3"
          >
            {(
              [
                { id: "Pendente", rotulo: "Em aberto", total: emAberto.length },
                { id: "Paga", rotulo: "Pagas", total: pagas.length },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={aba === item.id}
                onClick={() => setAba(item.id)}
                className={`rounded-full px-5 py-2 font-serif italic font-bold text-sm transition cursor-pointer ${
                  aba === item.id
                    ? "bg-[#87947b] text-white shadow-inner"
                    : "bg-[#dce0cb] text-[#586b55] hover:bg-[#c9d1b8]"
                }`}
              >
                {item.rotulo} ({item.total})
              </button>
            ))}
          </div>

          {carregando ? (
            <p className="py-12 text-center font-serif italic text-[#68745e]">
              Carregando multas...
            </p>
          ) : erro ? (
            <p role="alert" className="py-12 text-center text-red-700">
              {erro}
            </p>
          ) : listaAtual.length === 0 ? (
            <p className="py-12 text-center font-serif italic text-[#68745e]">
              {aba === "Pendente"
                ? "Você não tem multas em aberto."
                : "Você ainda não pagou nenhuma multa."}
            </p>
          ) : (
            <ul className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {listaAtual.map((multa) => (
                <li
                  key={multa.id}
                  className="rounded-3xl bg-[#F8F5E4] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-serif italic font-bold text-[#52644f] text-base leading-tight truncate">
                        {multa.livro}
                      </h2>
                      <p className="font-serif italic text-[#64715e] text-xs mt-1 truncate">
                        {multa.autor}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                        multa.status === "Paga"
                          ? "bg-[#DDE8CF] text-[#4B6B3A]"
                          : "bg-[#F5E3B8] text-[#7A5B1E]"
                      }`}
                    >
                      {multa.status === "Paga" ? "Paga" : "Em aberto"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-[#68745e]">{multa.motivo}</p>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div className="text-[11px] text-[#7d8270] leading-relaxed">
                      <p>
                        Devolução prevista:{" "}
                        {formatarData(multa.dataPrevistaDevolucao)}
                      </p>
                      <p>Devolvido em: {formatarData(multa.dataDevolucao)}</p>
                    </div>

                    <p
                      className={`text-xl font-bold ${
                        multa.status === "Paga"
                          ? "text-[#4B6B3A]"
                          : "text-[#9A3A2A]"
                      }`}
                    >
                      {moeda(multa.valor)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {aba === "Pendente" && emAberto.length > 0 && (
            <p className="mt-6 text-center text-xs text-[#7d8270]">
              Para pagar uma multa, procure a biblioteca. Precisa de ajuda?
              Veja a página de Ajuda.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}