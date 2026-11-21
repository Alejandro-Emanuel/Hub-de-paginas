"use client";

import { useEffect, useMemo, useState } from "react";
import { Tela } from "@/utils/telas";
import { chamarApi } from "@/utils/api";
import { formatarData } from "@/utils/datas";
import { BarraAdmin } from "../components/BarraAdmin";
import { Titulo } from "../components/Titulo";
import telaFundo from "../assets/iconeCards/telaDeFundo.png";

interface RelatoriosProps {
  Voltar: () => void;
  IrPara: (tela: Tela) => void;
}

type TipoRelatorio = "todos" | "emprestimos" | "reservas" | "multas";

interface Registro {
  id: number;
  tipo: Exclude<TipoRelatorio, "todos">;
  descricao: string;
  responsavel: string;
  data: string; // yyyy-mm-dd
  status: string;
}

const nomesTipo: Record<TipoRelatorio, string> = {
  todos: "Todos os registros",
  emprestimos: "Empréstimos",
  reservas: "Reservas",
  multas: "Multas",
};

// Cores do selo de status (qualquer status desconhecido usa a cor neutra)
function corStatus(status: string) {
  if (["Devolvido", "Paga", "Confirmada"].includes(status)) {
    return "bg-[#DDE8CF] text-[#4B6B3A]";
  }
  if (["Atrasado", "Cancelada"].includes(status)) {
    return status === "Atrasado"
      ? "bg-[#F2CFC7] text-[#9A3A2A]"
      : "bg-[#E2E4CF] text-[#586b55]";
  }
  return "bg-[#F5E3B8] text-[#7A5B1E]";
}

const campo =
  "mt-2 w-full rounded-full bg-white/70 px-5 py-3 text-sm text-[#4A5546] outline-none focus:ring-2 focus:ring-[#4A5546]";

export function Relatorios({ Voltar, IrPara }: RelatoriosProps) {
  const [tipo, setTipo] = useState<TipoRelatorio>("todos");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [busca, setBusca] = useState("");
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Busca os dados da API ao abrir a tela
  useEffect(() => {
    let cancelado = false;

    chamarApi<Registro[]>("/api/relatorios")
      .then((dados) => {
        if (!cancelado && Array.isArray(dados)) setRegistros(dados);
      })
      .catch((e) => {
        if (!cancelado) {
          setErro(
            e instanceof Error
              ? e.message
              : "Erro ao carregar os dados do servidor.",
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

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase();

    return registros.filter((registro) => {
      const combinaTipo = tipo === "todos" || registro.tipo === tipo;
      const combinaBusca = `${registro.descricao} ${registro.responsavel} ${registro.status}`
        .toLowerCase()
        .includes(termo);

      return (
        combinaTipo &&
        combinaBusca &&
        (!inicio || registro.data >= inicio) &&
        (!fim || registro.data <= fim)
      );
    });
  }, [registros, tipo, inicio, fim, busca]);

  const totalEmprestimos = registros.filter((r) => r.tipo === "emprestimos").length;
  const totalReservas = registros.filter((r) => r.tipo === "reservas").length;
  const totalMultas = registros.filter((r) => r.tipo === "multas").length;

  function exportarCSV() {
    const cabecalho = ["ID", "Tipo", "Descricao", "Responsavel", "Data", "Status"];

    const linhas = filtrados.map((r) => [
      r.id,
      nomesTipo[r.tipo],
      r.descricao,
      r.responsavel,
      r.data,
      r.status,
    ]);

    const escapar = (valor: string | number) =>
      `"${String(valor).replace(/"/g, '""')}"`;

    const conteudo = [cabecalho, ...linhas]
      .map((linha) => linha.map(escapar).join(";"))
      .join("\r\n");

    const arquivo = new Blob(["\uFEFF" + conteudo], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-my-hub.csv";
    link.click();
    URL.revokeObjectURL(url);

    setMensagem("Arquivo CSV exportado com sucesso.");
  }

  function limparFiltros() {
    setTipo("todos");
    setInicio("");
    setFim("");
    setBusca("");
    setMensagem("");
  }

  return (
    <div
      className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6"
      style={{ backgroundImage: `url(${telaFundo.src})` }}
    >
      <BarraAdmin atual="relatorios" IrPara={IrPara} Voltar={Voltar} />

      <main className="flex-1 min-w-0 flex flex-col gap-6">
        <Titulo>Relatórios</Titulo>

        {/* Resumo */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <article className="rounded-4xl bg-[#FFF8E1] text-[#4A5546] shadow-lg p-6">
            <p className="font-serif italic font-bold text-sm text-[#64715e]">
              Registros encontrados
            </p>
            <p className="mt-2 text-3xl font-bold">{filtrados.length}</p>
            <p className="mt-1 text-xs text-[#7d8270]">Conforme os filtros</p>
          </article>

          <article className="rounded-4xl bg-[#FFF8E1] text-[#4A5546] shadow-lg p-6">
            <p className="font-serif italic font-bold text-sm text-[#64715e]">
              Empréstimos
            </p>
            <p className="mt-2 text-3xl font-bold">{totalEmprestimos}</p>
            <p className="mt-1 text-xs text-[#7d8270]">Registros no sistema</p>
          </article>

          <article className="rounded-4xl bg-[#FFF8E1] text-[#4A5546] shadow-lg p-6">
            <p className="font-serif italic font-bold text-sm text-[#64715e]">
              Reservas
            </p>
            <p className="mt-2 text-3xl font-bold">{totalReservas}</p>
            <p className="mt-1 text-xs text-[#7d8270]">Registros no sistema</p>
          </article>

          <article className="rounded-4xl bg-[#FFF8E1] text-[#4A5546] shadow-lg p-6">
            <p className="font-serif italic font-bold text-sm text-[#64715e]">
              Multas
            </p>
            <p className="mt-2 text-3xl font-bold">{totalMultas}</p>
            <p className="mt-1 text-xs text-[#7d8270]">Registros no sistema</p>
          </article>
        </section>

        {/* Filtros */}
        <section className="rounded-4xl bg-[#FFF8E1] text-[#4A5546] shadow-lg p-6 sm:p-8">
          <h2 className="font-serif italic font-bold text-lg">
            Consultar relatórios
          </h2>
          <p className="mt-1 text-sm text-[#7d8270]">
            Filtre os registros por categoria, período ou palavra-chave.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <label className="text-sm font-semibold">
              Tipo de relatório
              <select
                className={campo}
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoRelatorio)}
              >
                <option value="todos">Todos os registros</option>
                <option value="emprestimos">Empréstimos</option>
                <option value="reservas">Reservas</option>
                <option value="multas">Multas</option>
              </select>
            </label>

            <label className="text-sm font-semibold">
              Data inicial
              <input
                type="date"
                className={campo}
                value={inicio}
                max={fim || undefined}
                onChange={(e) => setInicio(e.target.value)}
              />
            </label>

            <label className="text-sm font-semibold">
              Data final
              <input
                type="date"
                className={campo}
                value={fim}
                min={inicio || undefined}
                onChange={(e) => setFim(e.target.value)}
              />
            </label>

            <label className="text-sm font-semibold">
              Pesquisar
              <input
                type="search"
                className={campo}
                placeholder="Livro, responsável ou status"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={limparFiltros}
              className="rounded-full bg-[#dce0cb] px-6 py-3 text-sm text-[#586b55] font-serif italic font-bold hover:bg-[#c9d1b8] transition cursor-pointer"
            >
              Limpar filtros
            </button>

            <button
              type="button"
              onClick={exportarCSV}
              className="rounded-full bg-[#78866d] px-6 py-3 text-sm text-white font-serif italic font-bold hover:bg-[#64765b] transition cursor-pointer"
            >
              Exportar CSV
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-[#E08328] px-6 py-3 text-sm text-white font-serif italic font-bold hover:bg-[#c9731f] transition cursor-pointer"
            >
              Imprimir relatório
            </button>
          </div>

          {mensagem && (
            <p
              role="status"
              className="mt-4 rounded-2xl bg-[#DDE8CF] px-4 py-3 text-sm text-[#4B6B3A]"
            >
              {mensagem}
            </p>
          )}
        </section>

        {/* Dados */}
        <section className="min-w-0 rounded-4xl bg-[#FFF8E1] text-[#4A5546] shadow-lg p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif italic font-bold text-lg">
                Dados do relatório
              </h2>
              <p className="mt-1 text-sm text-[#7d8270]">
                {filtrados.length} registro(s) encontrado(s)
              </p>
            </div>

            <span className="rounded-full bg-[#dce0cb] px-4 py-2 text-xs font-bold text-[#586b55]">
              {nomesTipo[tipo]}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-175 border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[#dce0cb] font-serif italic">
                  <th className="px-3 py-4">Livro / registro</th>
                  <th className="px-3 py-4">Responsável</th>
                  <th className="px-3 py-4">Data</th>
                  <th className="px-3 py-4">Categoria</th>
                  <th className="px-3 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-10 text-center font-serif italic text-[#68745e]"
                    >
                      Carregando relatórios...
                    </td>
                  </tr>
                ) : erro ? (
                  <tr>
                    <td
                      colSpan={5}
                      role="alert"
                      className="px-3 py-10 text-center text-red-700"
                    >
                      {erro}
                    </td>
                  </tr>
                ) : filtrados.length > 0 ? (
                  filtrados.map((registro) => (
                    <tr
                      key={`${registro.tipo}-${registro.id}`}
                      className="border-b border-[#E9E6D8] transition hover:bg-[#F8F5E4]"
                    >
                      <td className="px-3 py-4 font-semibold">
                        {registro.descricao}
                      </td>
                      <td className="px-3 py-4">{registro.responsavel}</td>
                      <td className="px-3 py-4">{formatarData(registro.data)}</td>
                      <td className="px-3 py-4">{nomesTipo[registro.tipo]}</td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${corStatus(registro.status)}`}
                        >
                          {registro.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-10 text-center font-serif italic text-[#68745e]"
                    >
                      Nenhum registro encontrado com esses filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          button,
          aside,
          select,
          input {
            display: none !important;
          }

          main {
            width: 100% !important;
          }

          section,
          article {
            box-shadow: none !important;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}