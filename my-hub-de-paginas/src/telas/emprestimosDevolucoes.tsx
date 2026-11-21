"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Tela } from "@/utils/telas";
import { chamarApi } from "@/utils/api";
import {
  diasDeAtraso,
  formatarData,
  hojeISO,
  somarDias,
} from "@/utils/datas";
import { estimarMulta } from "@/utils/multa";
import { BarraAdmin } from "../components/BarraAdmin";
import { CardIcone } from "../components/CardsDashboard";
import { Titulo } from "../components/Titulo";
import telaFundo from "../assets/iconeCards/telaDeFundo.png";
import livroIcon from "../assets/iconeCards/Livro.png";
import renovacaoIcon from "../assets/iconeCards/Renovacao.png";

interface EmprestimosDevolucoesProps {
  Voltar: () => void;
  IrPara: (tela: Tela) => void;
}

// ---- Regras que você pode ajustar ----------------------------------------
const PRAZOS_EM_DIAS = [7, 14, 21];
const PRAZO_PADRAO = 14;
// ---------------------------------------------------------------------------

// Formatos que a tela espera receber da API (veja a lista no final da resposta)
interface UsuarioBusca {
  id: number;
  nome: string;
  email: string;
}

interface LivroBusca {
  id: number;
  nome: string;
  nome_do_autor: string;
  disponivel?: boolean; // se a API ainda não manda, a tela libera o livro
}

interface MultaInfo {
  valor: number;
  diasAtraso: number;
  status: string;
}

interface EmprestimoAdm {
  id: number;
  usuario: string;
  livro: string;
  dataEmprestimo: string; // yyyy-mm-dd
  dataPrevistaDevolucao: string; // yyyy-mm-dd
  dataDevolucao: string | null; // yyyy-mm-dd ou null enquanto não devolveu
  multa?: MultaInfo | null;
}

type Situacao = "Em andamento" | "Atrasado" | "Devolvido";
type Painel = "novo" | "devolucoes" | null;
type Aviso = { tipo: "ok" | "erro"; texto: string } | null;

const FILTROS: Array<"Todos" | Situacao> = [
  "Todos",
  "Em andamento",
  "Atrasado",
  "Devolvido",
];

const corSituacao: Record<Situacao, string> = {
  "Em andamento": "bg-[#F5E3B8] text-[#7A5B1E]",
  Atrasado: "bg-[#F2CFC7] text-[#9A3A2A]",
  Devolvido: "bg-[#DDE8CF] text-[#4B6B3A]",
};

const moeda = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function situacaoDe(emprestimo: EmprestimoAdm): Situacao {
  if (emprestimo.dataDevolucao) return "Devolvido";
  return diasDeAtraso(emprestimo.dataPrevistaDevolucao) > 0
    ? "Atrasado"
    : "Em andamento";
}

const mensagemDe = (erro: unknown, padrao: string) =>
  erro instanceof Error ? erro.message : padrao;

const estiloBusca =
  "w-full rounded-full bg-white/70 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4A5546]";

export function EmprestimosDevolucoes({
  Voltar,
  IrPara,
}: EmprestimosDevolucoesProps) {
  const [painel, setPainel] = useState<Painel>(null);

  // ----- Registrar empréstimo -----
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [usuarios, setUsuarios] = useState<UsuarioBusca[]>([]);
  const [usuarioSel, setUsuarioSel] = useState<UsuarioBusca | null>(null);
  const [buscaLivro, setBuscaLivro] = useState("");
  const [livros, setLivros] = useState<LivroBusca[]>([]);
  const [livroSel, setLivroSel] = useState<LivroBusca | null>(null);
  const [prazo, setPrazo] = useState(PRAZO_PADRAO);
  const [enviando, setEnviando] = useState(false);
  const [avisoNovo, setAvisoNovo] = useState<Aviso>(null);

  // ----- Devoluções -----
  const [lista, setLista] = useState<EmprestimoAdm[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erroLista, setErroLista] = useState("");
  const [versao, setVersao] = useState(0); // aumenta para recarregar a lista
  const [filtro, setFiltro] = useState<"Todos" | Situacao>("Todos");
  const [pesquisa, setPesquisa] = useState("");
  const [confirmando, setConfirmando] = useState<EmprestimoAdm | null>(null);
  const [enviandoDev, setEnviandoDev] = useState(false);
  const [avisoDev, setAvisoDev] = useState<Aviso>(null);

  // Busca de usuários (só enquanto nenhum foi escolhido)
  useEffect(() => {
    if (painel !== "novo" || usuarioSel) return;
    let cancelado = false;

    const timer = setTimeout(async () => {
      try {
        const dados = await chamarApi<UsuarioBusca[]>(
          `/api/usuarios?busca=${encodeURIComponent(buscaUsuario)}`,
        );
        if (!cancelado) setUsuarios(Array.isArray(dados) ? dados : []);
      } catch {
        if (!cancelado) setUsuarios([]);
      }
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [painel, buscaUsuario, usuarioSel]);

  // Busca de livros (só enquanto nenhum foi escolhido)
  useEffect(() => {
    if (painel !== "novo" || livroSel) return;
    let cancelado = false;

    const timer = setTimeout(async () => {
      try {
        const dados = await chamarApi<LivroBusca[]>(
          `/api/livros?busca=${encodeURIComponent(buscaLivro)}`,
        );
        if (!cancelado) setLivros(Array.isArray(dados) ? dados : []);
      } catch {
        if (!cancelado) setLivros([]);
      }
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [painel, buscaLivro, livroSel]);

  // Lista de empréstimos
  useEffect(() => {
    if (painel !== "devolucoes") return;
    let cancelado = false;

    setCarregando(true);
    setErroLista("");

    chamarApi<EmprestimoAdm[]>("/api/emprestimo")
      .then((dados) => {
        if (!cancelado) setLista(Array.isArray(dados) ? dados : []);
      })
      .catch((erro) => {
        if (!cancelado) {
          setErroLista(mensagemDe(erro, "Não foi possível carregar os empréstimos."));
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [painel, versao]);

  const listaFiltrada = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    return lista.filter((item) => {
      const combinaFiltro = filtro === "Todos" || situacaoDe(item) === filtro;
      const combinaBusca =
        !termo ||
        item.usuario.toLowerCase().includes(termo) ||
        item.livro.toLowerCase().includes(termo);
      return combinaFiltro && combinaBusca;
    });
  }, [lista, filtro, pesquisa]);

  function abrirPainel(novo: Exclude<Painel, null>) {
    setPainel(novo);
    setAvisoNovo(null);
    setAvisoDev(null);
  }

  async function registrarEmprestimo() {
    if (!usuarioSel || !livroSel) return;

    setEnviando(true);
    setAvisoNovo(null);

    try {
      await chamarApi("/api/emprestimo", {
        method: "POST",
        body: JSON.stringify({
          usuarioId: usuarioSel.id,
          livroId: livroSel.id,
          dias: prazo,
        }),
      });

      setAvisoNovo({
        tipo: "ok",
        texto: `Empréstimo registrado: "${livroSel.nome}" para ${usuarioSel.nome}. Devolução prevista em ${formatarData(somarDias(hojeISO(), prazo))}.`,
      });
      setUsuarioSel(null);
      setLivroSel(null);
      setBuscaUsuario("");
      setBuscaLivro("");
      setPrazo(PRAZO_PADRAO);
    } catch (erro) {
      setAvisoNovo({
        tipo: "erro",
        texto: mensagemDe(erro, "Não foi possível registrar o empréstimo."),
      });
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarDevolucao() {
    if (!confirmando) return;

    setEnviandoDev(true);

    try {
      const resposta = await chamarApi<{ multa?: MultaInfo | null }>(
        "/api/devolucoes",
        {
          method: "POST",
          body: JSON.stringify({ emprestimoId: confirmando.id }),
        },
      );

      setAvisoDev({
        tipo: "ok",
        texto: resposta.multa
          ? `Devolução registrada. Multa gerada: ${moeda(resposta.multa.valor)} (${resposta.multa.diasAtraso} dia(s) de atraso).`
          : "Devolução registrada sem multa.",
      });
      setConfirmando(null);
      setVersao((v) => v + 1);
    } catch (erro) {
      setAvisoDev({
        tipo: "erro",
        texto: mensagemDe(erro, "Não foi possível registrar a devolução."),
      });
      setConfirmando(null);
    } finally {
      setEnviandoDev(false);
    }
  }

  const diasAtrasoModal = confirmando
    ? diasDeAtraso(confirmando.dataPrevistaDevolucao)
    : 0;

  return (
    <div
      className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6"
      style={{ backgroundImage: `url(${telaFundo.src})` }}
    >
      <BarraAdmin atual="emprestimosDevolucoes" IrPara={IrPara} Voltar={Voltar} />

      <main className="flex-1 min-w-0 flex flex-col gap-6">
        <Titulo>Empréstimos e Devoluções</Titulo>

        <div className="flex flex-1 flex-col md:flex-row gap-8">
          <div className="flex md:flex-col gap-6 md:justify-around">
            <CardIcone.Root onClick={() => abrirPainel("novo")}>
              <Image
                src={livroIcon}
                alt="Registrar empréstimo"
                className="w-20 h-20 object-contain"
              />
              <CardIcone.Texto>Registrar empréstimo</CardIcone.Texto>
            </CardIcone.Root>

            <CardIcone.Root onClick={() => abrirPainel("devolucoes")}>
              <Image
                src={renovacaoIcon}
                alt="Devoluções"
                className="w-20 h-20 object-contain"
              />
              <CardIcone.Texto>Devoluções</CardIcone.Texto>
            </CardIcone.Root>
          </div>

          <section className="flex-1 min-w-0 bg-[#FFF8E1] text-[#4A5546] rounded-4xl shadow-lg p-6 min-h-96 max-h-[75vh] overflow-y-auto flex flex-col gap-4">
            {painel === null && (
              <p className="m-auto text-center font-serif italic">
                Escolha uma opção
              </p>
            )}

            {/* ------------------ REGISTRAR EMPRÉSTIMO ------------------ */}
            {painel === "novo" && (
              <>
                <h2 className="font-serif italic font-bold text-lg">
                  Registrar empréstimo
                </h2>

                {avisoNovo && (
                  <p
                    role={avisoNovo.tipo === "erro" ? "alert" : "status"}
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      avisoNovo.tipo === "ok"
                        ? "bg-[#DDE8CF] text-[#4B6B3A]"
                        : "bg-[#F2CFC7] text-[#9A3A2A]"
                    }`}
                  >
                    {avisoNovo.texto}
                  </p>
                )}

                {/* 1. Usuário */}
                <div className="flex flex-col gap-2">
                  <p className="font-serif italic font-bold text-sm">
                    1. Usuário
                  </p>

                  {usuarioSel ? (
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-5 py-3">
                      <div className="min-w-0">
                        <p className="font-serif italic font-bold truncate">
                          {usuarioSel.nome}
                        </p>
                        <p className="text-xs opacity-70 truncate">
                          {usuarioSel.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUsuarioSel(null)}
                        className="text-xs font-bold text-[#E08328] hover:underline cursor-pointer"
                      >
                        Trocar
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={buscaUsuario}
                        onChange={(e) => setBuscaUsuario(e.target.value)}
                        placeholder="Buscar usuário por nome ou e-mail"
                        aria-label="Buscar usuário"
                        className={estiloBusca}
                      />
                      <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {usuarios.map((usuario) => (
                          <li key={usuario.id}>
                            <button
                              type="button"
                              onClick={() => setUsuarioSel(usuario)}
                              className="w-full text-left rounded-2xl bg-white/60 px-5 py-3 hover:bg-white transition cursor-pointer"
                            >
                              <p className="font-serif italic font-bold">
                                {usuario.nome}
                              </p>
                              <p className="text-xs opacity-70">
                                {usuario.email}
                              </p>
                            </button>
                          </li>
                        ))}
                        {usuarios.length === 0 && (
                          <li className="text-xs opacity-70 px-2">
                            Nenhum usuário encontrado.
                          </li>
                        )}
                      </ul>
                    </>
                  )}
                </div>

                {/* 2. Livro */}
                <div className="flex flex-col gap-2">
                  <p className="font-serif italic font-bold text-sm">2. Livro</p>

                  {livroSel ? (
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-5 py-3">
                      <div className="min-w-0">
                        <p className="font-serif italic font-bold truncate">
                          {livroSel.nome}
                        </p>
                        <p className="text-xs opacity-70 truncate">
                          {livroSel.nome_do_autor}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLivroSel(null)}
                        className="text-xs font-bold text-[#E08328] hover:underline cursor-pointer"
                      >
                        Trocar
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={buscaLivro}
                        onChange={(e) => setBuscaLivro(e.target.value)}
                        placeholder="Buscar livro por título, autor ou gênero"
                        aria-label="Buscar livro"
                        className={estiloBusca}
                      />
                      <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {livros.map((livro) => {
                          const emprestado = livro.disponivel === false;
                          return (
                            <li key={livro.id}>
                              <button
                                type="button"
                                disabled={emprestado}
                                onClick={() => setLivroSel(livro)}
                                className="w-full flex items-center justify-between gap-3 text-left rounded-2xl bg-white/60 px-5 py-3 hover:bg-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span className="min-w-0">
                                  <span className="block font-serif italic font-bold truncate">
                                    {livro.nome}
                                  </span>
                                  <span className="block text-xs opacity-70 truncate">
                                    {livro.nome_do_autor}
                                  </span>
                                </span>
                                {emprestado && (
                                  <span className="shrink-0 rounded-full bg-[#F5E3B8] px-3 py-1 text-[11px] font-bold text-[#7A5B1E]">
                                    Emprestado
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                        {livros.length === 0 && (
                          <li className="text-xs opacity-70 px-2">
                            Nenhum livro encontrado.
                          </li>
                        )}
                      </ul>
                    </>
                  )}
                </div>

                {/* 3. Prazo */}
                <div className="flex flex-col gap-2">
                  <p className="font-serif italic font-bold text-sm">3. Prazo</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRAZOS_EM_DIAS.map((dias) => (
                      <button
                        key={dias}
                        type="button"
                        onClick={() => setPrazo(dias)}
                        className={`rounded-full px-4 py-2 text-sm font-serif italic font-bold transition cursor-pointer ${
                          prazo === dias
                            ? "bg-[#87947b] text-white shadow-inner"
                            : "bg-[#dce0cb] text-[#586b55] hover:bg-[#c9d1b8]"
                        }`}
                      >
                        {dias} dias
                      </button>
                    ))}
                    <span className="text-xs opacity-70">
                      Devolução prevista em {formatarData(somarDias(hojeISO(), prazo))}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={registrarEmprestimo}
                  disabled={!usuarioSel || !livroSel || enviando}
                  className="self-start rounded-full bg-[#78866d] px-8 py-3 text-white font-serif italic font-bold hover:bg-[#64765b] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? "Registrando..." : "Registrar empréstimo"}
                </button>
              </>
            )}

            {/* ------------------------ DEVOLUÇÕES ------------------------ */}
            {painel === "devolucoes" && (
              <>
                <h2 className="font-serif italic font-bold text-lg">
                  Devoluções
                </h2>

                {avisoDev && (
                  <p
                    role={avisoDev.tipo === "erro" ? "alert" : "status"}
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      avisoDev.tipo === "ok"
                        ? "bg-[#DDE8CF] text-[#4B6B3A]"
                        : "bg-[#F2CFC7] text-[#9A3A2A]"
                    }`}
                  >
                    {avisoDev.texto}
                  </p>
                )}

                <input
                  type="text"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  placeholder="Buscar por usuário ou livro"
                  aria-label="Buscar empréstimos"
                  className={estiloBusca}
                />

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
                      {item}
                    </button>
                  ))}
                </div>

                {carregando ? (
                  <p className="py-8 text-center font-serif italic">
                    Carregando empréstimos...
                  </p>
                ) : erroLista ? (
                  <p role="alert" className="py-8 text-center text-red-700">
                    {erroLista}
                  </p>
                ) : listaFiltrada.length === 0 ? (
                  <p className="py-8 text-center font-serif italic">
                    Nenhum empréstimo encontrado.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {listaFiltrada.map((item) => {
                      const situacao = situacaoDe(item);
                      return (
                        <li
                          key={item.id}
                          className="rounded-2xl bg-white/60 px-5 py-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-serif italic font-bold">
                                {item.livro}
                              </p>
                              <p className="text-xs opacity-70">
                                Usuário: {item.usuario}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-bold ${corSituacao[situacao]}`}
                            >
                              {situacao}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs opacity-80">
                            <p>
                              Empréstimo:
                              <br />
                              <strong>{formatarData(item.dataEmprestimo)}</strong>
                            </p>
                            <p>
                              Prevista:
                              <br />
                              <strong>
                                {formatarData(item.dataPrevistaDevolucao)}
                              </strong>
                            </p>
                            <p>
                              Devolvido em:
                              <br />
                              <strong>{formatarData(item.dataDevolucao)}</strong>
                            </p>
                          </div>

                          {item.multa && (
                            <p className="mt-3 text-xs font-bold text-[#9A3A2A]">
                              Multa: {moeda(item.multa.valor)} ({item.multa.diasAtraso}{" "}
                              dia(s) de atraso) · {item.multa.status}
                            </p>
                          )}

                          {situacao === "Atrasado" && (
                            <p className="mt-3 text-xs font-bold text-[#9A3A2A]">
                              {diasDeAtraso(item.dataPrevistaDevolucao)} dia(s) de atraso ·
                              multa estimada até hoje:{" "}
                              {moeda(
                                estimarMulta(diasDeAtraso(item.dataPrevistaDevolucao)),
                              )}
                            </p>
                          )}

                          {situacao !== "Devolvido" && (
                            <button
                              type="button"
                              onClick={() => setConfirmando(item)}
                              className="mt-3 rounded-full bg-[#78866d] px-5 py-2 text-xs text-white font-serif italic font-bold hover:bg-[#64765b] transition cursor-pointer"
                            >
                              Registrar devolução
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Confirmação de devolução */}
      {confirmando && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => !enviandoDev && setConfirmando(null)}
        >
          <div
            className="w-full max-w-md rounded-[30px] bg-[#FFF8E1] text-[#4A5546] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif italic font-bold text-xl text-[#52644f] mb-4">
              Confirmar devolução
            </h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Livro:</strong> {confirmando.livro}
              </p>
              <p>
                <strong>Usuário:</strong> {confirmando.usuario}
              </p>
              <p>
                <strong>Devolução prevista:</strong>{" "}
                {formatarData(confirmando.dataPrevistaDevolucao)}
              </p>
              <p>
                <strong>Entrega hoje:</strong> {formatarData(hojeISO())}
              </p>
            </div>

            {diasAtrasoModal > 0 ? (
              <p className="mt-4 rounded-2xl bg-[#F2CFC7] px-4 py-3 text-sm text-[#9A3A2A]">
                {diasAtrasoModal} dia(s) de atraso. Multa estimada:{" "}
                <strong>{moeda(estimarMulta(diasAtrasoModal))}</strong>.
                O valor final é calculado pelo sistema ao confirmar.
              </p>
            ) : (
              <p className="mt-4 rounded-2xl bg-[#DDE8CF] px-4 py-3 text-sm text-[#4B6B3A]">
                Dentro do prazo, sem multa.
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmando(null)}
                disabled={enviandoDev}
                className="flex-1 rounded-full bg-[#dce0cb] py-3 text-[#586b55] font-serif italic font-bold hover:bg-[#c9d1b8] transition cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarDevolucao}
                disabled={enviandoDev}
                className="flex-1 rounded-full bg-[#78866d] py-3 text-white font-serif italic font-bold hover:bg-[#64765b] transition cursor-pointer disabled:opacity-50"
              >
                {enviandoDev ? "Registrando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}