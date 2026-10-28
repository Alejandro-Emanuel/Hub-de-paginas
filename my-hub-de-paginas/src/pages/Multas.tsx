
"use client";

import { useMemo, useState } from "react";

type StatusMulta = "Pendente" | "Paga" | "Cancelada";

type Multa = {
  id: number;
  usuario: string;
  email: string;
  livro: string;
  motivo: string;
  valor: number;
  vencimento: string;
  status: StatusMulta;
};

const multasIniciais: Multa[] = [
  {
    id: 1,
    usuario: "Ana Beatriz",
    email: "ana@email.com",
    livro: "Dom Casmurro",
    motivo: "Atraso na devolução",
    valor: 12.5,
    vencimento: "2026-10-20",
    status: "Pendente",
  },
  {
    id: 2,
    usuario: "Pedro Henrique",
    email: "pedro@email.com",
    livro: "O Pequeno Príncipe",
    motivo: "Atraso na devolução",
    valor: 8.0,
    vencimento: "2026-10-15",
    status: "Paga",
  },
  {
    id: 3,
    usuario: "Mariana Costa",
    email: "mariana@email.com",
    livro: "1984",
    motivo: "Livro danificado",
    valor: 35.0,
    vencimento: "2026-10-25",
    status: "Pendente",
  },
  {
    id: 4,
    usuario: "Lucas Ferreira",
    email: "lucas@email.com",
    livro: "O Hobbit",
    motivo: "Atraso na devolução",
    valor: 15.0,
    vencimento: "2026-10-10",
    status: "Cancelada",
  },
  {
    id: 5,
    usuario: "Juliana Alves",
    email: "juliana@email.com",
    livro: "Capitães da Areia",
    motivo: "Atraso na devolução",
    valor: 10.0,
    vencimento: "2026-10-22",
    status: "Pendente",
  },
];

const moeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const dataFormatada = (data: string) =>
  new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");

export function Multas({ Voltar }: { Voltar: () => void }) {
  const [multas, setMultas] = useState<Multa[]>(multasIniciais);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todas");
  const [modalAberto, setModalAberto] = useState(false);
  const [multaSelecionada, setMultaSelecionada] =
    useState<Multa | null>(null);

  const [form, setForm] = useState({
    usuario: "",
    email: "",
    livro: "",
    motivo: "Atraso na devolução",
    valor: "",
    vencimento: "",
  });

  const resumo = useMemo(() => {
    const pendentes = multas.filter(
      (multa) => multa.status === "Pendente"
    );
    const pagas = multas.filter(
      (multa) => multa.status === "Paga"
    );

    return {
      total: multas.length,
      pendentes: pendentes.length,
      valorPendente: pendentes.reduce(
        (total, multa) => total + multa.valor,
        0
      ),
      valorPago: pagas.reduce(
        (total, multa) => total + multa.valor,
        0
      ),
    };
  }, [multas]);

  const multasFiltradas = useMemo(() => {
    const termo = pesquisa.toLowerCase().trim();

    return multas.filter((multa) => {
      const correspondePesquisa =
        multa.usuario.toLowerCase().includes(termo) ||
        multa.livro.toLowerCase().includes(termo) ||
        String(multa.id).includes(termo);

      const correspondeStatus =
        filtroStatus === "Todas" ||
        multa.status === filtroStatus;

      return correspondePesquisa && correspondeStatus;
    });
  }, [multas, pesquisa, filtroStatus]);

  function atualizarStatus(id: number, status: StatusMulta) {
    setMultas((atuais) =>
      atuais.map((multa) =>
        multa.id === id ? { ...multa, status } : multa
      )
    );

    setMultaSelecionada(null);
  }

  function cadastrarMulta(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const valor = Number(form.valor);

    if (
      !form.usuario.trim() ||
      !form.email.trim() ||
      !form.livro.trim() ||
      !form.vencimento ||
      !Number.isFinite(valor) ||
      valor <= 0
    ) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    const novaMulta: Multa = {
      id: Math.max(0, ...multas.map((multa) => multa.id)) + 1,
      usuario: form.usuario.trim(),
      email: form.email.trim(),
      livro: form.livro.trim(),
      motivo: form.motivo,
      valor,
      vencimento: form.vencimento,
      status: "Pendente",
    };

    setMultas((atuais) => [novaMulta, ...atuais]);
    setForm({
      usuario: "",
      email: "",
      livro: "",
      motivo: "Atraso na devolução",
      valor: "",
      vencimento: "",
    });
    setModalAberto(false);
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
      dataFormatada(multa.vencimento),
      multa.status,
    ]);

    const csv = [cabecalho, ...linhas]
      .map((linha) =>
        linha
          .map((campo) => `"${String(campo).replace(/"/g, '""')}"`)
          .join(";")
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

  function classeStatus(status: StatusMulta) {
    if (status === "Paga") {
      return "bg-green-100 text-green-800";
    }

    if (status === "Cancelada") {
      return "bg-gray-200 text-gray-700";
    }

    return "bg-amber-100 text-amber-800";
  }

  return (
    <main className="min-h-screen bg-[#C5CBB0] p-4 text-[#343B2B] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Cabeçalho */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              onClick={Voltar}
              className="mb-3 text-sm font-semibold text-[#536044] transition hover:text-[#252D20]"
            >
              ← Voltar ao painel
            </button>

            <p className="text-sm font-medium text-[#68715A]">
             ADMINISTRAÇÃO
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Gerenciamento de Multas
            </h1>

            <p className="mt-2 text-sm text-[#60684F]">
              Acompanhe cobranças, pagamentos e pendências da biblioteca.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportarCSV}
              className="rounded-xl border border-[#536044] px-5 py-3 text-sm font-semibold text-[#536044] transition hover:bg-[#536044] hover:text-white"
            >
              Exportar CSV
            </button>
            <button
              onClick={() => setModalAberto(true)}
              className="rounded-xl bg-[#536044] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3E4932]"
            >
              + Nova multa
            </button>
          </div>
        </header>

        {/* Indicadores */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-[#FFF8E1] p-5 shadow-sm">
            <p className="text-sm font-medium text-[#727761]">
              Total de multas
            </p>
            <p className="mt-3 text-3xl font-bold">{resumo.total}</p>
            <p className="mt-2 text-xs text-[#727761]">
              Registros na demonstração
            </p>
          </div>

          <div className="rounded-3xl bg-[#FFF8E1] p-5 shadow-sm">
            <p className="text-sm font-medium text-[#727761]">
              Multas pendentes
            </p>
            <p className="mt-3 text-3xl font-bold text-amber-700">
              {resumo.pendentes}
            </p>
            <p className="mt-2 text-xs text-[#727761]">
              Aguardando pagamento
            </p>
          </div>

          <div className="rounded-3xl bg-[#FFF8E1] p-5 shadow-sm">
            <p className="text-sm font-medium text-[#727761]">
              Valor em aberto
            </p>
            <p className="mt-3 text-2xl font-bold">
              {moeda(resumo.valorPendente)}
            </p>
            <p className="mt-2 text-xs text-[#727761]">
              Soma das multas pendentes
            </p>
          </div>

          <div className="rounded-3xl bg-[#E2E4CF] p-5 shadow-sm">
            <p className="text-sm font-medium text-[#626B51]">
              Valor pago
            </p>
            <p className="mt-3 text-2xl font-bold text-green-800">
              {moeda(resumo.valorPago)}
            </p>
            <p className="mt-2 text-xs text-[#626B51]">
              Soma das multas pagas
            </p>
          </div>
        </section>

        {/* Tabela */}
        <section className="overflow-hidden rounded-3xl bg-[#FFF8E1] shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E5E2D1] p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-bold">Lista de multas</h2>
              <p className="mt-1 text-sm text-[#727761]">
                Consulte os registros e atualize o status visualmente.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                placeholder="Buscar usuário, livro ou ID..."
                className="w-full rounded-xl border border-[#D5D7C5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#7D8868] sm:w-72"
              />

              <select
                value={filtroStatus}
                onChange={(event) => setFiltroStatus(event.target.value)}
                className="rounded-xl border border-[#D5D7C5] bg-white px-4 py-3 text-sm outline-none focus:border-[#7D8868]"
              >
                <option value="Todas">Todos os status</option>
                <option value="Pendente">Pendentes</option>
                <option value="Paga">Pagas</option>
                <option value="Cancelada">Canceladas</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-225 border-collapse text-left">
              <thead className="bg-[#E2E4CF] text-xs uppercase tracking-wide text-[#596148]">
                <tr>
                  <th className="px-5 py-4">Usuário</th>
                  <th className="px-5 py-4">Livro</th>
                  <th className="px-5 py-4">Motivo</th>
                  <th className="px-5 py-4">Valor</th>
                  <th className="px-5 py-4">Vencimento</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E9E6D8]">
                {multasFiltradas.map((multa) => (
                  <tr
                    key={multa.id}
                    className="transition hover:bg-[#FAF7E9]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold">{multa.usuario}</p>
                      <p className="mt-1 text-xs text-[#777B68]">
                        {multa.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm">{multa.livro}</td>

                    <td className="px-5 py-4 text-sm">{multa.motivo}</td>

                    <td className="px-5 py-4 font-semibold">
                      {moeda(multa.valor)}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {dataFormatada(multa.vencimento)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classeStatus(multa.status)}`}
                      >
                        {multa.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setMultaSelecionada(multa)}
                          title="Ver detalhes"
                          className="rounded-lg border border-[#D5D7C5] px-3 py-2 text-sm transition hover:bg-[#E2E4CF]"
                        >
                          Ver
                        </button>

                        {multa.status === "Pendente" && (
                          <>
                            <button
                              onClick={() =>
                                atualizarStatus(multa.id, "Paga")
                              }
                              title="Marcar como paga"
                              className="rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-200"
                            >
                              Pagar
                            </button>

                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Deseja cancelar esta multa?"
                                  )
                                ) {
                                  atualizarStatus(multa.id, "Cancelada");
                                }
                              }}
                              title="Cancelar multa"
                              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {multasFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm text-[#777B68]"
                    >
                      Nenhuma multa encontrada para essa pesquisa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#E5E2D1] px-5 py-4 text-sm text-[#727761]">
            Exibindo {multasFiltradas.length} de {multas.length} multas.
          </div>
        </section>

        <p className="text-center text-xs text-[#60684F]">
          My Hub · Protótipo administrativo · Dados demonstrativos
        </p>
      </div>

      {/* Modal para cadastrar multa */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-auto w-full max-w-xl rounded-3xl bg-[#FFF8E1] p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Nova multa</h2>
                <p className="mt-1 text-sm text-[#727761]">
                  Preencha os dados para adicionar ao protótipo.
                </p>
              </div>

              <button
                onClick={() => setModalAberto(false)}
                aria-label="Fechar formulário"
                className="rounded-lg px-3 py-2 text-xl hover:bg-[#E2E4CF]"
              >
                ×
              </button>
            </div>

            <form onSubmit={cadastrarMulta} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Nome do usuário
                </label>
                <input
                  required
                  value={form.usuario}
                  onChange={(event) =>
                    setForm({ ...form, usuario: event.target.value })
                  }
                  placeholder="Ex.: Maria Silva"
                  className="w-full rounded-xl border border-[#D5D7C5] bg-white px-4 py-3 outline-none focus:border-[#7D8868]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  E-mail do usuário
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="usuario@email.com"
                  className="w-full rounded-xl border border-[#D5D7C5] bg-white px-4 py-3 outline-none focus:border-[#7D8868]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Livro
                </label>
                <input
                  required
                  value={form.livro}
                  onChange={(event) =>
                    setForm({ ...form, livro: event.target.value })
                  }
                  placeholder="Título do livro"
                  className="w-full rounded-xl border border-[#D5D7C5] bg-white px-4 py-3 outline-none focus:border-[#7D8868]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Motivo da multa
                </label>
                <select
                  value={form.motivo}
                  onChange={(event) =>
                    setForm({ ...form, motivo: event.target.value })
                  }
                  className="w-full rounded-xl border border-[#D5D7C5] bg-white px-4 py-3 outline-none focus:border-[#7D8868]"
                >
                  <option>Atraso na devolução</option>
                  <option>Livro danificado</option>
                  <option>Livro perdido</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Valor (R$)
                  </label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.valor}
                    onChange={(event) =>
                      setForm({ ...form, valor: event.target.value })
                    }
                    placeholder="0,00"
                    className="w-full rounded-xl border border-[#D5D7C5] bg-white px-4 py-3 outline-none focus:border-[#7D8868]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Data de vencimento
                  </label>
                  <input
                    required
                    type="date"
                    value={form.vencimento}
                    onChange={(event) =>
                      setForm({ ...form, vencimento: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#D5D7C5] bg-white px-4 py-3 outline-none focus:border-[#7D8868]"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="rounded-xl border border-[#D5D7C5] px-5 py-3 font-semibold hover:bg-[#E2E4CF]"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#536044] px-5 py-3 font-semibold text-white transition hover:bg-[#3E4932]"
                >
                  Adicionar multa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalhes */}
      {multaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#FFF8E1] p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Detalhes da multa</h2>
              <button
                onClick={() => setMultaSelecionada(null)}
                aria-label="Fechar detalhes"
                className="rounded-lg px-3 py-2 text-xl hover:bg-[#E2E4CF]"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[#727761]">Identificação</p>
                <p className="font-semibold">Multa #{multaSelecionada.id}</p>
              </div>

              <div>
                <p className="text-[#727761]">Usuário</p>
                <p className="font-semibold">{multaSelecionada.usuario}</p>
                <p className="text-[#727761]">{multaSelecionada.email}</p>
              </div>

              <div>
                <p className="text-[#727761]">Livro</p>
                <p className="font-semibold">{multaSelecionada.livro}</p>
              </div>

              <div>
                <p className="text-[#727761]">Motivo</p>
                <p className="font-semibold">{multaSelecionada.motivo}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#727761]">Valor</p>
                  <p className="text-lg font-bold">
                    {moeda(multaSelecionada.valor)}
                  </p>
                </div>
                <div>
                  <p className="text-[#727761]">Vencimento</p>
                  <p className="font-semibold">
                    {dataFormatada(multaSelecionada.vencimento)}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[#727761]">Status atual</p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classeStatus(multaSelecionada.status)}`}
                >
                  {multaSelecionada.status}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setMultaSelecionada(null)}
                className="rounded-xl border border-[#D5D7C5] px-4 py-3 font-semibold hover:bg-[#E2E4CF]"
              >
                Fechar
              </button>

              {multaSelecionada.status === "Pendente" && (
                <button
                  onClick={() =>
                    atualizarStatus(multaSelecionada.id, "Paga")
                  }
                  className="rounded-xl bg-[#536044] px-4 py-3 font-semibold text-white hover:bg-[#3E4932]"
                >
                  Marcar como paga
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Multas;
