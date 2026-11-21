"use client";

import { useEffect, useMemo, useState } from "react";
import { Tela } from "@/utils/telas";
import { chamarApi } from "@/utils/api";
import { formatarData } from "@/utils/datas";
import { BarraAdmin } from "../components/BarraAdmin";
import { Titulo } from "../components/Titulo";
import telaFundo from "../assets/iconeCards/telaDeFundo.png";

type StatusMulta = "Pendente" | "Paga" | "Cancelada";
type Filtro = "Todas" | StatusMulta;

type Multa = {
  id: number;
  usuario: string;
  email: string;
  livro: string;
  motivo: string;
  valor: number;
  vencimento: string; // yyyy-mm-dd
  status: StatusMulta;
};

interface MultasProps {
  Voltar: () => void;
  IrPara: (tela: Tela) => void;
}

const FILTROS: Filtro[] = ["Todas", "Pendente", "Paga", "Cancelada"];

const rotuloFiltro: Record<Filtro, string> = {
  Todas: "Todas",
  Pendente: "Pendentes",
  Paga: "Pagas",
  Cancelada: "Canceladas",
};

const corStatus: Record<StatusMulta, string> = {
  Pendente: "bg-[#F5E3B8] text-[#7A5B1E]",
  Paga: "bg-[#DDE8CF] text-[#4B6B3A]",
  Cancelada: "bg-[#E2E4CF] text-[#586b55]",
};

const moeda = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function Multas({ Voltar, IrPara }: MultasProps) {
  const [multas, setMultas] = useState<Multa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todas");
  const [multaSelecionada, setMultaSelecionada] = useState<Multa | null>(null);
  const [aviso, setAviso] = useState<{
    tipo: "ok" | "erro";
    texto: string;
  } | null>(null);
  const [ocupado, setOcupado] = useState<number | null>(null);

  // Carrega as multas ao abrir a tela
  useEffect(() => {
    let cancelado = false;

    chamarApi<Multa[]>("/api/multas")
      .then((dados) => {
        if (!cancelado) setMultas(Array.isArray(dados) ? dados : []);
      })
      .catch((e) => {
        if (!cancelado) {
          setErro(
            e instanceof Error
              ? e.message
              : "Não foi possível carregar as multas.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const resumo = useMemo(() => {
    const pendentes = multas.filter((m) => m.status === "Pendente");
    const pagas = multas.filter((m) => m.status === "Paga");

    return {
      total: multas.length,
      pendentes: pendentes.length,
      valorPendente: pendentes.reduce((soma, m) => soma + m.valor, 0),
      valorPago: pagas.reduce((soma, m) => soma + m.valor, 0),
    };
  }, [multas]);

  const multasFiltradas = useMemo(() => {
    const termo = pesquisa.toLowerCase().trim();

    return multas.filter((multa) => {
      const combinaBusca =
        !termo ||
        multa.usuario.toLowerCase().includes(termo) ||
        multa.livro.toLowerCase().includes(termo) ||
        String(multa.id).includes(termo);

      return combinaBusca && (filtro === "Todas" || multa.status === filtro);
    });
  }, [multas, pesquisa, filtro]);

  // Atualiza o status da multa (Paga ou Cancelada)
  async function atualizarStatus(id: number, status: StatusMulta) {
    setOcupado(id);
    setAviso(null);

    try {
      await chamarApi(`/api/multas/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      setMultas((atuais) =>
        atuais.map((multa) => (multa.id === id ? { ...multa, status } : multa)),
      );
      setAviso({
        tipo: "ok",
        texto:
          status === "Paga" ? "Multa marcada como paga." : "Multa cancelada.",
      });
    } catch (e) {
      setAviso({
        tipo: "erro",
        texto: e instanceof Error ? e.message : "Erro ao atualizar a multa.",
      });
    } finally {
      setOcupado(null);
      setMultaSelecionada(null);
    }
  }

  function cancelarMulta(id: number) {
    if (window.confirm("Deseja cancelar esta multa?")) {
      void atualizarStatus(id, "Cancelada");
    }
  }

  function exportarCSV() {
    const cabecalho = [
      "ID",
      "Usuário",
      "E-mail",
      "Livro",
      "Motivo",
      "Valor",
      "Vencimento",
      "Status",
    ];

    const linhas = multasFiltradas.map((multa) => [
      multa.id,
      multa.usuario,
      multa.email,
      multa.livro,
      multa.motivo,
      multa.valor.toFixed(2).replace(".", ","),
      formatarData(multa.vencimento),
      multa.status,
    ]);

    const csv = [cabecalho, ...linhas]
      .map((linha) =>
        linha.map((campo) => `"${String(campo).replace(/"/g, '""')}"`).join(";"),
      )
      .join("\n");

    const arquivo = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");
    link.href = url;
    link.download = "multas-my-hub.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6"
      style={{ backgroundImage: `url(${telaFundo.src})` }}
    >
      <BarraAdmin atual="multas" IrPara={IrPara} Voltar={Voltar} />

      <main className="flex-1 min-w-0 flex flex-col gap-6">
        <Titulo>Multas</Titulo>

        {/* Resumo */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <article className="rounded-4xl bg-[#FFF8E1] text-[#4A5546] shadow-lg p-6">
            <p className="font-serif italic font-bold text-sm text-[#64715e]">
              Total de multas
            </p>
            <p className="mt-2 text-3xl font-bold">{resumo.total}</p>
            <p className="mt-1 text-xs text-[#7d8270]">Registros no sistema</p>
          </article>

          <article className="rounded-4xl bg-[#FFF8E1] text-[#4A5546] shadow-lg p-6">
            <p className="font-serif italic font-bold text-sm text-[#64715e]">
              Pendentes
            </p>
            <p className="mt-2 text-3xl font-bold text-[#7A5B1E]">
              {resumo.pendentes}
            </p>
            <p className="mt-1 text-xs text-[#7d8270]">Aguardando pagamento</p>
          </article>

          <article className="rounded-4xl bg-[#FFF8E1] text-[#4A5546] shadow-lg p-6">
            <p className="font-serif italic font-bold text-sm text-[#64715e]">
              Valor em aberto
            </p>
            <p className="mt-2 text-3xl font-bold text-[#9A3A2A]">
              {moeda(resumo.valorPendente)}
            </p>
            <p className="mt-1 text-xs text-[#7d8270]">Soma das pendentes</p>
          </article>

          <article className="rounded-4xl bg-[#FFF8E1] text-[#4A5546] shadow-lg p-6">
            <p className="font-serif italic font-bold text-sm text-[#64715e]">
              Valor pago
            </p>
            <p className="mt-2 text-3xl font-bold text-[#4B6B3A]">
              {moeda(resumo.valorPago)}
            </p>
            <p className="mt-1 text-xs text-[#7d8270]">Soma das pagas</p>
          </article>
        </section>

        {/* Lista */}
        <section className="flex-1 rounded-4xl bg-[#FFF8E1] text-[#4A5546] shadow-lg p-6 sm:p-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              placeholder="Buscar usuário, livro ou ID"
              aria-label="Buscar multas"
              className="flex-1 min-w-48 rounded-full bg-white/70 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4A5546]"
            />

            <button
              type="button"
              onClick={exportarCSV}
              className="rounded-full bg-[#78866d] px-6 py-3 text-sm text-white font-serif italic font-bold hover:bg-[#64765b] transition cursor-pointer"
            >
              Exportar CSV
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTROS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFiltro(item)}
                className={`rounded-full px-4 py-2 text-xs font-serif italic font-bold transition cursor-pointer ${
                  filtro === item
                    ? "bg-[#87947b] text-white shadow-inner"
                    : "bg-[#dce0cb] text-[#586b55] hover:bg-[#c9d1b8]"
                }`}
              >
                {rotuloFiltro[item]}
              </button>
            ))}
          </div>

          {aviso && (
            <p
              role={aviso.tipo === "erro" ? "alert" : "status"}
              className={`rounded-2xl px-4 py-3 text-sm ${
                aviso.tipo === "ok"
                  ? "bg-[#DDE8CF] text-[#4B6B3A]"
                  : "bg-[#F2CFC7] text-[#9A3A2A]"
              }`}
            >
              {aviso.texto}
            </p>
          )}

          {carregando ? (
            <p className="py-12 text-center font-serif italic text-[#68745e]">
              Carregando multas...
            </p>
          ) : erro ? (
            <p role="alert" className="py-12 text-center text-red-700">
              {erro}
            </p>
          ) : multasFiltradas.length === 0 ? (
            <p className="py-12 text-center font-serif italic text-[#68745e]">
              Nenhuma multa encontrada.
            </p>
          ) : (
            <ul className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {multasFiltradas.map((multa) => (
                <li
                  key={multa.id}
                  className="rounded-3xl bg-[#F8F5E4] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-serif italic font-bold text-[#52644f] text-base leading-tight truncate">
                        {multa.livro}
                      </h2>
                      <p className="mt-1 text-xs text-[#64715e] truncate">
                        {multa.usuario} · {multa.email}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${corStatus[multa.status]}`}
                    >
                      {multa.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-[#68745e]">{multa.motivo}</p>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    <p className="text-[11px] text-[#7d8270]">
                      Vencimento: {formatarData(multa.vencimento)}
                    </p>
                    <p className="text-xl font-bold text-[#9A3A2A]">
                      {moeda(multa.valor)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMultaSelecionada(multa)}
                      className="rounded-full bg-[#dce0cb] px-4 py-2 text-xs text-[#586b55] font-serif italic font-bold hover:bg-[#c9d1b8] transition cursor-pointer"
                    >
                      Ver detalhes
                    </button>

                    {multa.status === "Pendente" && (
                      <>
                        <button
                          type="button"
                          onClick={() => atualizarStatus(multa.id, "Paga")}
                          disabled={ocupado === multa.id}
                          className="rounded-full bg-[#78866d] px-4 py-2 text-xs text-white font-serif italic font-bold hover:bg-[#64765b] transition cursor-pointer disabled:opacity-50"
                        >
                          {ocupado === multa.id
                            ? "Salvando..."
                            : "Marcar como paga"}
                        </button>

                        <button
                          type="button"
                          onClick={() => cancelarMulta(multa.id)}
                          disabled={ocupado === multa.id}
                          className="text-xs font-bold text-[#E08328] hover:underline cursor-pointer disabled:opacity-50"
                        >
                          Cancelar multa
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-[#7d8270]">
            Exibindo {multasFiltradas.length} de {multas.length} multas.
          </p>
        </section>
      </main>

      {/* Detalhes */}
      {multaSelecionada && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setMultaSelecionada(null)}
        >
          <div
            className="w-full max-w-md rounded-[30px] bg-[#FFF8E1] text-[#4A5546] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-serif italic font-bold text-xl text-[#52644f]">
                Detalhes da multa
              </h2>
              <button
                type="button"
                onClick={() => setMultaSelecionada(null)}
                aria-label="Fechar"
                className="text-2xl text-[#65715d] cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm text-[#68745e]">
              <p>
                <strong>Multa:</strong> #{multaSelecionada.id}
              </p>
              <p>
                <strong>Usuário:</strong> {multaSelecionada.usuario} (
                {multaSelecionada.email})
              </p>
              <p>
                <strong>Livro:</strong> {multaSelecionada.livro}
              </p>
              <p>
                <strong>Motivo:</strong> {multaSelecionada.motivo}
              </p>
              <p>
                <strong>Valor:</strong> {moeda(multaSelecionada.valor)}
              </p>
              <p>
                <strong>Vencimento:</strong>{" "}
                {formatarData(multaSelecionada.vencimento)}
              </p>
              <p>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${corStatus[multaSelecionada.status]}`}
                >
                  {multaSelecionada.status}
                </span>
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setMultaSelecionada(null)}
                className="flex-1 rounded-full bg-[#dce0cb] py-3 text-[#586b55] font-serif italic font-bold hover:bg-[#c9d1b8] transition cursor-pointer"
              >
                Fechar
              </button>

              {multaSelecionada.status === "Pendente" && (
                <button
                  type="button"
                  onClick={() => atualizarStatus(multaSelecionada.id, "Paga")}
                  className="flex-1 rounded-full bg-[#78866d] py-3 text-white font-serif italic font-bold hover:bg-[#64765b] transition cursor-pointer"
                >
                  Marcar como paga
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Multas;