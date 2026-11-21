"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { chamarApi, tipoDoToken } from "@/utils/api";
import { diasDeAtraso, formatarData } from "@/utils/datas";
import { BarraLateral } from "../components/BarraLateral";
import { Titulo } from "../components/Titulo";
import { CardIcone } from "../components/CardsDashboard";
import telaFundo from "../assets/iconeCards/telaDeFundo.png";
import perfil from "../assets/iconeCards/Perfil.png";
import livroIcone from "../assets/iconeCards/Livro.png";
import marcadorIcone from "../assets/iconeCards/Marcador.png";
import renovacaoIcone from "../assets/iconeCards/Renovacao.png";
import ajudaIcon from "@/assets/iconeCards/interrogaçãoIcon.png";
import retornarIcon from "../assets/iconeCards/Log out.png";

// ---- Regras que você pode ajustar ----------------------------------------
const LIMITE_RENOVACOES = 2; // só vale se a API mandar "renovacoes" no empréstimo
const DIAS_POR_RENOVACAO = 7; // o backend atual soma 7 dias
// ---------------------------------------------------------------------------

type StatusLivro = "Disponível" | "Emprestado" | "Reservado";

interface Livro {
  id: number;
  nome: string;
  nome_do_autor: string;
  editora: string;
  ano: number;
  genero: string;
  disponivel?: boolean; // se a API ainda não manda, a tela libera o botão Reservar
  status?: StatusLivro;
}

interface LivroExterno {
  titulo: string;
  autor: string;
  ano: number | null;
  editora: string;
  capa: string | null;
}

// Formato esperado de GET /api/reservas
interface Reserva {
  id: number;
  livro: string;
  autor: string;
  dataReserva: string; // yyyy-mm-dd
  disponivel: boolean; // true = já pode retirar
  usuario?: string; // só vem para o administrador
}

// Formato que /api/meusEmprestimos já devolve
interface MeuEmprestimo {
  id: number;
  data_emprestimo: string;
  data_prevista_devolucao: string;
  cadastro_livro: { nome: string; nome_do_autor: string };
  devolucao: { id: number } | null;
  renovacoes?: number; // opcional: quantas vezes já foi renovado
}

type Painel = "buscar" | "reservas" | "renovacao" | null;
type Aviso = { tipo: "ok" | "erro"; texto: string };

interface ReservasProps {
  Voltar: () => void;
  IrParaAjuda: () => void;
}

const mensagemDe = (erro: unknown, padrao: string) =>
  erro instanceof Error ? erro.message : padrao;

const corAviso = (tipo: Aviso["tipo"]) =>
  tipo === "ok"
    ? "bg-[#DDE8CF] text-[#4B6B3A]"
    : "bg-[#F2CFC7] text-[#9A3A2A]";

function rotuloStatusLivro(livro: Livro): StatusLivro {
  if (livro.status) return livro.status;
  return livro.disponivel === false ? "Emprestado" : "Disponível";
}

function corStatusLivro(status: StatusLivro): string {
  if (status === "Disponível") return "bg-[#DDE8CF] text-[#4B6B3A]";
  if (status === "Reservado") return "bg-[#E2E4CF] text-[#586b55]";
  return "bg-[#F5E3B8] text-[#7A5B1E]";
}

export function Reservas({ Voltar, IrParaAjuda }: ReservasProps) {
  // Só muda o que aparece na tela; a regra de verdade fica no backend
  const [ehAdmin] = useState(() => tipoDoToken() === "adm");

  const [painel, setPainel] = useState<Painel>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [versao, setVersao] = useState(0); // aumenta para recarregar as listas

  // Buscar livros
  const [busca, setBusca] = useState("");
  const [livros, setLivros] = useState<Livro[]>([]);
  const [externos, setExternos] = useState<LivroExterno[]>([]);
  const [erroBusca, setErroBusca] = useState("");
  const [avisosLivro, setAvisosLivro] = useState<Record<number, Aviso>>({});

  // Reservas e renovação
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [emprestimos, setEmprestimos] = useState<MeuEmprestimo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erroLista, setErroLista] = useState("");

  // Busca de livros: roda com o painel aberto e quando o texto muda
  useEffect(() => {
    if (painel !== "buscar") return;

    let cancelado = false;

    const timer = setTimeout(async () => {
      // 1) Livros da biblioteca (banco)
      try {
        const dados = await chamarApi<Livro[]>(
          `/api/livros?busca=${encodeURIComponent(busca)}`,
        );
        if (!cancelado) {
          setLivros(Array.isArray(dados) ? dados : []);
          setErroBusca("");
        }
      } catch {
        if (!cancelado) setErroBusca("Não foi possível carregar os livros.");
      }

      // 2) Livros externos (Open Library). Se falhar, a lista fica vazia.
      try {
        const resExt = await fetch(
          `/api/livros/externo?busca=${encodeURIComponent(busca)}`,
        );
        if (resExt.ok && !cancelado) {
          const dadosExt = await resExt.json();
          setExternos(Array.isArray(dadosExt) ? dadosExt : []);
        } else if (!cancelado) {
          setExternos([]);
        }
      } catch {
        if (!cancelado) setExternos([]);
      }
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [painel, busca, versao]);

  // Lista de reservas (do usuário, ou de todos se for administrador)
  useEffect(() => {
    if (painel !== "reservas") return;

    let cancelado = false;
    setCarregando(true);
    setErroLista("");

    chamarApi<Reserva[]>("/api/reservas")
      .then((dados) => {
        if (!cancelado) setReservas(Array.isArray(dados) ? dados : []);
      })
      .catch((erro) => {
        if (!cancelado) {
          setErroLista(
            mensagemDe(erro, "Não foi possível carregar as reservas."),
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [painel, versao]);

  // Empréstimos do usuário, para renovar
  useEffect(() => {
    if (painel !== "renovacao") return;

    let cancelado = false;
    setCarregando(true);
    setErroLista("");

    chamarApi<MeuEmprestimo[]>("/api/meusEmprestimos")
      .then((dados) => {
        if (!cancelado) setEmprestimos(Array.isArray(dados) ? dados : []);
      })
      .catch((erro) => {
        if (!cancelado) {
          setErroLista(
            mensagemDe(erro, "Não foi possível carregar seus empréstimos."),
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [painel, versao]);

  function abrirPainel(novo: Exclude<Painel, null>) {
    setPainel(novo);
    setAviso(null);
    setErroLista("");
  }

  async function reservarLivro(livro: Livro) {
    setOcupado(livro.id);
    setAvisosLivro((atual) => {
      const copia = { ...atual };
      delete copia[livro.id];
      return copia;
    });

    try {
      await chamarApi("/api/reservas", {
        method: "POST",
        body: JSON.stringify({ livroId: livro.id }),
      });
      setAvisosLivro((atual) => ({
        ...atual,
        [livro.id]: {
          tipo: "ok",
          texto: "Reserva feita! Você pode acompanhar em Minhas reservas.",
        },
      }));
      setVersao((v) => v + 1);
    } catch (erro) {
      setAvisosLivro((atual) => ({
        ...atual,
        [livro.id]: {
          tipo: "erro",
          texto: mensagemDe(erro, "Não foi possível reservar este livro."),
        },
      }));
    } finally {
      setOcupado(null);
    }
  }

  async function cancelarReserva(id: number) {
    setOcupado(id);
    setAviso(null);

    try {
      await chamarApi(`/api/reservas/${id}`, { method: "DELETE" });
      setAviso({ tipo: "ok", texto: "Reserva cancelada." });
      setVersao((v) => v + 1);
    } catch (erro) {
      setAviso({
        tipo: "erro",
        texto: mensagemDe(erro, "Não foi possível cancelar a reserva."),
      });
    } finally {
      setOcupado(null);
    }
  }

  async function renovar(id: number) {
    setOcupado(id);
    setAviso(null);

    try {
      await chamarApi("/api/emprestimo", {
        method: "PATCH",
        body: JSON.stringify({ emprestimoId: id }),
      });
      setAviso({
        tipo: "ok",
        texto: `Empréstimo renovado por mais ${DIAS_POR_RENOVACAO} dias.`,
      });
      setVersao((v) => v + 1);
    } catch (erro) {
      setAviso({
        tipo: "erro",
        texto: mensagemDe(erro, "Não foi possível renovar o empréstimo."),
      });
    } finally {
      setOcupado(null);
    }
  }

  const emprestimosAtivos = emprestimos.filter((e) => !e.devolucao);

  return (
    <div
      className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6"
      style={{ backgroundImage: `url(${telaFundo.src})` }}
    >
      <BarraLateral.Root>
        <Image
          src={perfil}
          alt="Perfil"
          className="w-20 h-20 rounded-full mx-auto"
        />
        <hr />
        <BarraLateral.Item onClick={IrParaAjuda}>
          <Image src={ajudaIcon} alt="" className="w-6 h-6" />
          Ajuda
        </BarraLateral.Item>

        <div className="mt-auto">
          <BarraLateral.Item onClick={Voltar}>
            <Image src={retornarIcon} alt="" className="w-6 h-6" />
            Voltar
          </BarraLateral.Item>
        </div>
      </BarraLateral.Root>

      <main className="flex-1 min-w-0 flex flex-col gap-6">
        <Titulo>Reservas</Titulo>

        <div className="flex flex-1 flex-col md:flex-row gap-8">
          {/* Coluna dos cartões */}
          <div className="flex md:flex-col gap-6 md:justify-around">
            <CardIcone.Root onClick={() => abrirPainel("buscar")}>
              <Image
                src={livroIcone}
                alt="Buscar livro"
                className="w-20 h-20 object-contain"
              />
              <CardIcone.Texto>Buscar livros</CardIcone.Texto>
            </CardIcone.Root>

            <CardIcone.Root onClick={() => abrirPainel("reservas")}>
              <Image
                src={marcadorIcone}
                alt="Reservas"
                className="w-20 h-20 object-contain"
              />
              <CardIcone.Texto>
                {ehAdmin ? "Reservas dos usuários" : "Minhas reservas"}
              </CardIcone.Texto>
            </CardIcone.Root>

            {!ehAdmin && (
              <CardIcone.Root onClick={() => abrirPainel("renovacao")}>
                <Image
                  src={renovacaoIcone}
                  alt="Renovação"
                  className="w-20 h-20 object-contain"
                />
                <CardIcone.Texto>Renovação de empréstimo</CardIcone.Texto>
              </CardIcone.Root>
            )}
          </div>

          {/* Painel da direita */}
          <section className="flex-1 min-w-0 bg-[#FFF8E1] text-[#4A5546] rounded-4xl shadow-lg p-6 min-h-96 max-h-[75vh] overflow-y-auto flex flex-col gap-4">
            {painel === null && (
              <p className="m-auto text-center font-serif italic">
                Escolha uma opção
              </p>
            )}

            {aviso && painel !== "buscar" && (
              <p
                role={aviso.tipo === "erro" ? "alert" : "status"}
                className={`rounded-2xl px-4 py-3 text-sm ${corAviso(aviso.tipo)}`}
              >
                {aviso.texto}
              </p>
            )}

            {/* ---------------------- BUSCAR LIVROS ---------------------- */}
            {painel === "buscar" && (
              <>
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por título, autor ou gênero"
                  aria-label="Buscar livros"
                  className="w-full rounded-full bg-white/70 px-5 py-3 outline-none focus:ring-2 focus:ring-[#4A5546]"
                />

                {erroBusca && (
                  <p role="alert" className="text-sm text-red-600">
                    {erroBusca}
                  </p>
                )}

                <ul className="flex flex-col gap-3">
                  {livros.map((livro) => {
                    const avisoLivro = avisosLivro[livro.id];
                    const statusAtual = rotuloStatusLivro(livro);
                    const estaDisponivel =
                      livro.disponivel !== undefined
                        ? livro.disponivel
                        : statusAtual === "Disponível";

                    return (
                      <li
                        key={livro.id}
                        className="rounded-2xl bg-white/60 px-5 py-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-serif italic font-bold">
                              {livro.nome}
                            </p>
                            <p className="text-sm">
                              {livro.nome_do_autor} · {livro.editora} ·{" "}
                              {livro.ano}
                            </p>
                            <p className="text-xs opacity-70">{livro.genero}</p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${corStatusLivro(statusAtual)}`}
                          >
                            {statusAtual}
                          </span>
                        </div>

                        {!ehAdmin &&
                          (estaDisponivel ? (
                            <p className="mt-3 text-xs opacity-70">
                              Este livro está disponível: é só retirar na
                              biblioteca, sem precisar reservar.
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={() => reservarLivro(livro)}
                              disabled={
                                ocupado === livro.id || avisoLivro?.tipo === "ok"
                              }
                              className="mt-3 rounded-full bg-[#78866d] px-5 py-2 text-xs text-white font-serif italic font-bold hover:bg-[#64765b] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {ocupado === livro.id
                                ? "Reservando..."
                                : "Reservar"}
                            </button>
                          ))}

                        {avisoLivro && (
                          <p
                            role={avisoLivro.tipo === "erro" ? "alert" : "status"}
                            className={`mt-3 rounded-2xl px-4 py-2 text-xs ${corAviso(avisoLivro.tipo)}`}
                          >
                            {avisoLivro.texto}
                          </p>
                        )}
                      </li>
                    );
                  })}

                  {livros.length === 0 && !erroBusca && (
                    <li className="py-4 text-center font-serif italic text-sm">
                      Nenhum livro encontrado.
                    </li>
                  )}
                </ul>

                {externos.length > 0 && (
                  <>
                    <p className="font-serif italic text-sm">
                      Resultados externos
                    </p>
                    <ul className="flex flex-col gap-3">
                      {externos.map((livro, i) => (
                        <li
                          key={i}
                          className="flex gap-3 rounded-2xl bg-white/60 px-5 py-3"
                        >
                          {livro.capa && (
                            <Image
                              src={livro.capa}
                              alt=""
                              width={48}
                              height={64}
                              unoptimized
                              className="w-12 h-16 object-cover"
                            />
                          )}
                          <div>
                            <p className="font-serif italic font-bold">
                              {livro.titulo}
                            </p>
                            <p className="text-sm">
                              {livro.autor} · {livro.editora} ·{" "}
                              {livro.ano ?? "s/ ano"}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}

            {/* ------------------------ RESERVAS ------------------------- */}
            {painel === "reservas" &&
              (carregando ? (
                <p className="m-auto text-center font-serif italic">
                  Carregando reservas...
                </p>
              ) : erroLista ? (
                <p role="alert" className="m-auto text-center text-red-700">
                  {erroLista}
                </p>
              ) : reservas.length === 0 ? (
                <p className="m-auto text-center font-serif italic">
                  {ehAdmin
                    ? "Nenhuma reserva no momento."
                    : "Você ainda não reservou nenhum livro."}
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {reservas.map((reserva) => (
                    <li
                      key={reserva.id}
                      className="rounded-2xl bg-white/60 px-5 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-serif italic font-bold">
                            {reserva.livro}
                          </p>
                          <p className="text-sm">{reserva.autor}</p>
                          {ehAdmin && reserva.usuario && (
                            <p className="text-xs opacity-70">
                              Reservado por {reserva.usuario}
                            </p>
                          )}
                          <p className="text-xs opacity-70">
                            Reservado em {formatarData(reserva.dataReserva)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                            reserva.disponivel
                              ? "bg-[#DDE8CF] text-[#4B6B3A]"
                              : "bg-[#F5E3B8] text-[#7A5B1E]"
                          }`}
                        >
                          {reserva.disponivel
                            ? "Disponível para retirada"
                            : "Na fila"}
                        </span>
                      </div>

                      {!ehAdmin && (
                        <button
                          type="button"
                          onClick={() => cancelarReserva(reserva.id)}
                          disabled={ocupado === reserva.id}
                          className="mt-3 text-xs font-bold text-[#E08328] hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {ocupado === reserva.id
                            ? "Cancelando..."
                            : "Cancelar reserva"}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ))}

            {/* ------------------------ RENOVAÇÃO ------------------------ */}
            {painel === "renovacao" &&
              (carregando ? (
                <p className="m-auto text-center font-serif italic">
                  Carregando empréstimos...
                </p>
              ) : erroLista ? (
                <p role="alert" className="m-auto text-center text-red-700">
                  {erroLista}
                </p>
              ) : emprestimosAtivos.length === 0 ? (
                <p className="m-auto text-center font-serif italic">
                  Você não tem empréstimos em andamento.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {emprestimosAtivos.map((emprestimo) => {
                    const atraso = diasDeAtraso(
                      emprestimo.data_prevista_devolucao,
                    );
                    const renovacoes = emprestimo.renovacoes;
                    const noLimite =
                      renovacoes !== undefined && renovacoes >= LIMITE_RENOVACOES;
                    const bloqueado = atraso > 0 || noLimite;

                    return (
                      <li
                        key={emprestimo.id}
                        className="rounded-2xl bg-white/60 px-5 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-serif italic font-bold">
                              {emprestimo.cadastro_livro.nome}
                            </p>
                            <p className="text-sm">
                              {emprestimo.cadastro_livro.nome_do_autor}
                            </p>
                            <p className="text-xs opacity-70">
                              Devolução prevista:{" "}
                              {formatarData(emprestimo.data_prevista_devolucao)}
                            </p>
                            {renovacoes !== undefined && (
                              <p className="text-xs opacity-70">
                                Renovações: {renovacoes} de {LIMITE_RENOVACOES}
                              </p>
                            )}
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                              atraso > 0
                                ? "bg-[#F2CFC7] text-[#9A3A2A]"
                                : "bg-[#F5E3B8] text-[#7A5B1E]"
                            }`}
                          >
                            {atraso > 0
                              ? `${atraso} dia(s) de atraso`
                              : "Em andamento"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => renovar(emprestimo.id)}
                          disabled={bloqueado || ocupado === emprestimo.id}
                          className="mt-3 rounded-full bg-[#78866d] px-5 py-2 text-xs text-white font-serif italic font-bold hover:bg-[#64765b] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {ocupado === emprestimo.id
                            ? "Renovando..."
                            : `Renovar +${DIAS_POR_RENOVACAO} dias`}
                        </button>

                        {atraso > 0 && (
                          <p className="mt-2 text-xs text-[#9A3A2A]">
                            Empréstimo em atraso: devolva o livro na biblioteca
                            para regularizar.
                          </p>
                        )}
                        {noLimite && atraso === 0 && (
                          <p className="mt-2 text-xs opacity-70">
                            Limite de renovações atingido.
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ))}
          </section>
        </div>
      </main>
    </div>
  );
}
