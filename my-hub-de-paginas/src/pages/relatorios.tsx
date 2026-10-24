'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { BarraLateral } from '../components/BarraLateral';
import { Titulo } from '../components/Titulo';
import perfil from '../assets/iconeCards/Perfil.png';

interface RelatoriosProps {
  Voltar: () => void;
}

type TipoRelatorio = 'todos' | 'emprestimos' | 'reservas' | 'multas';

interface Registro {
  id: number;
  tipo: Exclude<TipoRelatorio, 'todos'>;
  descricao: string;
  responsavel: string;
  data: string;
  status: string;
}

const nomesTipo: Record<TipoRelatorio, string> = {
  todos: 'Todos os registros',
  emprestimos: 'Empréstimos',
  reservas: 'Reservas',
  multas: 'Multas',
};

const campo =
  'w-full rounded-xl border border-[#C5CBB0] bg-[#FFF8E1] px-4 py-3 text-sm text-[#4A5546] outline-none focus:ring-2 focus:ring-[#879477]';

export function Relatorios({ Voltar }: RelatoriosProps) {
  const [tipo, setTipo] = useState<TipoRelatorio>('todos');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [busca, setBusca] = useState('');
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Buscar os dados reais da API ao carregar a página
  useEffect(() => {
    async function carregarRelatorios() {
      try {
        const resposta = await fetch('/api/relatorios');
        if (!resposta.ok) {
          throw new Error('Erro ao buscar relatórios');
        }
        const dados = await resposta.json();
        if (Array.isArray(dados)) {
          setRegistros(dados);
        }
      } catch (erro) {
        console.error('Erro ao carregar dados da API:', erro);
        setMensagem('Erro ao carregar os dados do servidor.');
      } finally {
        setCarregando(false);
      }
    }

    carregarRelatorios();
  }, []);

  const filtrados = useMemo(() => {
    return registros.filter((registro) => {
      const correspondeTipo = tipo === 'todos' || registro.tipo === tipo;
      const correspondeBusca =
        `${registro.descricao} ${registro.responsavel} ${registro.status}`
          .toLowerCase()
          .includes(busca.toLowerCase());

      return (
        correspondeTipo &&
        correspondeBusca &&
        (!inicio || registro.data >= inicio) &&
        (!fim || registro.data <= fim)
      );
    });
  }, [registros, tipo, inicio, fim, busca]);

  const totalEmprestimos = registros.filter(
    (r) => r.tipo === 'emprestimos',
  ).length;

  const totalReservas = registros.filter(
    (r) => r.tipo === 'reservas',
  ).length;

  const totalMultas = registros.filter(
    (r) => r.tipo === 'multas',
  ).length;

  function exportarCSV() {
    const cabecalho = [
      'ID',
      'Tipo',
      'Descricao',
      'Responsavel',
      'Data',
      'Status',
    ];

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
      .map((linha) => linha.map(escapar).join(';'))
      .join('\r\n');

    const arquivo = new Blob(
      ['\uFEFF' + conteudo],
      { type: 'text/csv;charset=utf-8;' },
    );

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'relatorio-my-hub.csv';
    link.click();

    URL.revokeObjectURL(url);
    setMensagem('Arquivo CSV exportado com sucesso.');
  }

  function atualizarStatus(id: number, status: string) {
    setRegistros((atuais) =>
      atuais.map((r) => (r.id === id ? { ...r, status } : r)),
    );
    setMensagem(
      'Status alterado localmente. (Implemente a rota PATCH se desejar persistir no banco).',
    );
  }

  function limparFiltros() {
    setTipo('todos');
    setInicio('');
    setFim('');
    setBusca('');
    setMensagem('');
  }

  return (
    <div className="min-h-screen bg-[#C5CBB0] p-4 sm:p-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5 md:flex-row md:gap-6">

        <BarraLateral.Root>
          <Image
            src={perfil}
            alt="Perfil do administrador"
            className="mx-auto h-20 w-20 rounded-full object-cover"
          />

          <p className="text-center text-xs font-semibold">
            Administrador
          </p>

          <hr className="border-[#D5D8C4]" />

          <BarraLateral.Item onClick={Voltar}>
            <span aria-hidden="true">⌂</span>
            Dashboard
          </BarraLateral.Item>

          <BarraLateral.Item>
            <span aria-hidden="true">▤</span>
            Relatórios
          </BarraLateral.Item>

          <div className="mt-auto pt-6">
            <BarraLateral.Item onClick={Voltar}>
              <span aria-hidden="true">←</span>
              Voltar
            </BarraLateral.Item>
          </div>
        </BarraLateral.Root>

        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <Titulo>Relatórios</Titulo>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl bg-[#FFF8E1] p-5 text-[#4A5546] shadow-md">
              <p className="text-sm">Registros encontrados</p>
              <p className="mt-2 text-3xl font-bold">{filtrados.length}</p>
              <p className="mt-1 text-xs opacity-70">Conforme os filtros</p>
            </article>

            <article className="rounded-3xl bg-[#E2E4CF] p-5 text-[#4A5546] shadow-md">
              <p className="text-sm">Empréstimos</p>
              <p className="mt-2 text-3xl font-bold">{totalEmprestimos}</p>
              <p className="mt-1 text-xs opacity-70">Registros no banco</p>
            </article>

            <article className="rounded-3xl bg-[#E2E4CF] p-5 text-[#4A5546] shadow-md">
              <p className="text-sm">Reservas</p>
              <p className="mt-2 text-3xl font-bold">{totalReservas}</p>
              <p className="mt-1 text-xs opacity-70">Registros no banco</p>
            </article>

            <article className="rounded-3xl bg-[#FFF8E1] p-5 text-[#4A5546] shadow-md">
              <p className="text-sm">Multas</p>
              <p className="mt-2 text-3xl font-bold">{totalMultas}</p>
              <p className="mt-1 text-xs opacity-70">Registros no banco</p>
            </article>
          </section>

          <section className="rounded-3xl bg-[#E2E4CF] p-5 text-[#4A5546] shadow-lg sm:p-7">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Consultar relatórios</h2>
              <p className="mt-1 text-sm opacity-75">
                Filtre os registros por categoria, período ou palavra-chave.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-sm font-semibold">
                Tipo de relatório
                <select
                  className={`${campo} mt-2`}
                  value={tipo}
                  onChange={(e) =>
                    setTipo(e.target.value as TipoRelatorio)
                  }
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
                  className={`${campo} mt-2`}
                  value={inicio}
                  max={fim || undefined}
                  onChange={(e) => setInicio(e.target.value)}
                />
              </label>

              <label className="text-sm font-semibold">
                Data final
                <input
                  type="date"
                  className={`${campo} mt-2`}
                  value={fim}
                  min={inicio || undefined}
                  onChange={(e) => setFim(e.target.value)}
                />
              </label>

              <label className="text-sm font-semibold">
                Pesquisar
                <input
                  type="search"
                  className={`${campo} mt-2`}
                  placeholder="Livro, responsável ou status..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={limparFiltros}
                className="rounded-full border border-[#879477] px-5 py-3 text-sm font-bold transition hover:bg-[#D5D8C4]"
              >
                Limpar filtros
              </button>

              <button
                type="button"
                onClick={exportarCSV}
                className="rounded-full bg-[#4A5546] px-5 py-3 text-sm font-bold text-[#FFF8E1] transition hover:bg-[#354033]"
              >
                Exportar CSV
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full bg-[#879477] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                Imprimir relatório
              </button>
            </div>

            {mensagem && (
              <p role="status" className="mt-4 text-sm font-medium">
                {mensagem}
              </p>
            )}
          </section>

          <section className="min-w-0 rounded-3xl bg-[#FFF8E1] p-5 text-[#4A5546] shadow-lg sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Dados do relatório</h2>
                <p className="mt-1 text-sm opacity-70">
                  {filtrados.length} registro(s) encontrado(s)
                </p>
              </div>

              <span className="rounded-full bg-[#E2E4CF] px-4 py-2 text-xs font-bold">
                {nomesTipo[tipo]}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-175 border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#D5D8C4]">
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
                      <td colSpan={5} className="px-3 py-10 text-center opacity-70">
                        Carregando relatórios do banco de dados...
                      </td>
                    </tr>
                  ) : filtrados.length > 0 ? (
                    filtrados.map((registro) => (
                      <tr
                        key={`${registro.tipo}-${registro.id}`}
                        className="border-b border-[#E2E4CF] transition hover:bg-[#F5F0DA]"
                      >
                        <td className="px-3 py-4 font-semibold">
                          {registro.descricao}
                        </td>
                        <td className="px-3 py-4">{registro.responsavel}</td>
                        <td className="px-3 py-4">
                          {registro.data
                            ? new Date(`${registro.data}T12:00:00`).toLocaleDateString('pt-BR')
                            : '-'}
                        </td>
                        <td className="px-3 py-4">
                          {nomesTipo[registro.tipo]}
                        </td>
                        <td className="px-3 py-4">
                          <select
                            aria-label={`Alterar status de ${registro.descricao}`}
                            className="max-w-36 rounded-lg border border-[#C5CBB0] bg-white px-2 py-2"
                            value={registro.status}
                            onChange={(e) =>
                              atualizarStatus(registro.id, e.target.value)
                            }
                          >
                            {(
                              registro.tipo === 'emprestimos'
                                ? ['Ativo', 'Devolvido', 'Atrasado']
                                : registro.tipo === 'reservas'
                                  ? ['Pendente', 'Confirmada', 'Cancelada']
                                  : ['Pendente', 'Paga', 'Cancelada']
                            ).map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-10 text-center opacity-70"
                      >
                        Nenhum registro encontrado com esses filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-5 text-xs opacity-65">
              Dados integrados diretamente com o banco de dados PostgreSQL.
            </p>
          </section>

          <footer className="pb-2 text-center text-xs text-[#4A5546] opacity-75">
            My Hub de Páginas · Painel administrativo
          </footer>
        </main>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          button,
          aside,
          select,
          input,
          footer {
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
