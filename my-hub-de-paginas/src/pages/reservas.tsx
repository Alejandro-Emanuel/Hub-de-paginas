"use client";

import { BarraLateral } from "../components/BarraLateral";
import telaFundo from "../assets/iconeCards/telaDeFundo.png";
import perfil from "../assets/iconeCards/Perfil.png";
import Image from "next/image";
import interrogacao from "../assets/iconeCards/interrogaçãoIcon.png";
import marcador from "../assets/iconeCards/Marcador.png";
import { Titulo } from "../components/Titulo";
import { CardIcone } from "../components/CardsDashboard";
import livroIcone from "../assets/iconeCards/Livro.png";
import renovacaoIcone from "../assets/iconeCards/casinhaIcon.png";
import { useEffect, useState } from "react";
import sair from "@/assets/iconeCards/Log out.png"

interface Livro {
  id: number;
  nome: string;
  nome_do_autor: string;
  editora: string;
  ano: number;
  genero: string;
}

interface Emprestimo {
  id: number;
  usuario_id: number;
  livro_id: number;
  data_prevista_devolucao: string;
}

interface ReservasProps {
  Voltar: () => void;
  onLogout: () => void;
  IrParaAjuda: () => void;
}

type Painel = "buscar" | "renovacao" | null;

export function Reservas({ Voltar, onLogout, IrParaAjuda}: ReservasProps) {
  const [painel, setPainel] = useState<Painel>(null);
  const [busca, setBusca] = useState("");
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [erro, setErro] = useState("");

  // Estados para gerenciar os empréstimos e a renovação
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [erroRenovacao, setErroRenovacao] = useState("");

  useEffect(() => {
    if (painel !== "buscar") return;

    let cancelado = false;

    const timer = setTimeout(async () => {
      try {
        const resposta = await fetch(
          `/api/livros?busca=${encodeURIComponent(busca)}`,
        );
        if (!resposta.ok) throw new Error("Falha na busca");

        const dados: Livro[] = await resposta.json();
        if (!cancelado) {
          setLivros(dados);
          setErro("");
          setCarregado(true);
        }
      } catch {
        if (!cancelado) setErro("Não foi possível carregar os livros.");
      }
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [painel, busca]);

  // Effect para buscar empréstimos ativos quando o painel for "renovacao"
  useEffect(() => {
    if (painel !== "renovacao") return;

    const usuarioIdLogado = 1; // Ajuste conforme o ID do usuário logado no seu sistema

    async function carregarEmprestimos() {
      try {
        const resposta = await fetch(`/api/emprestimos?usuarioId=${usuarioIdLogado}`);
        if (!resposta.ok) throw new Error("Erro ao carregar");
        const dados = await resposta.json();
        setEmprestimos(dados);
        setErroRenovacao("");
      } catch {
        setErroRenovacao("Não foi possível carregar seus empréstimos.");
      }
    }

    carregarEmprestimos();
  }, [painel]);

  // Função para chamar a API de renovação de empréstimo
  const handleRenovar = async (emprestimoId: number) => {
    try {
      const resposta = await fetch("/api/emprestimos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emprestimoId }),
      });

      if (!resposta.ok) throw new Error("Falha ao renovar");

      const resultado = await resposta.json();
      alert(resultado.mensagem || "Empréstimo renovado com sucesso!");

      // Atualiza a data na lista localmente para refletir na tela na mesma hora
      setEmprestimos(emprestimos.map(e => 
        e.id === emprestimoId 
          ? { ...e, data_prevista_devolucao: resultado.emprestimo.data_prevista_devolucao } 
          : e
      ));
    } catch {
      alert("Erro ao tentar renovar o empréstimo.");
    }
  };

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
          alt="Perfil"
          className="w-20 h-20 rounded-full mx-auto"
        />
        <hr />

        <BarraLateral.Item onClick={IrParaAjuda}>
          <Image src={interrogacao} alt="Ajuda" className="w-6 h-6" />
          Ajuda
        </BarraLateral.Item>

        <BarraLateral.Item>
          <Image src={marcador} alt="Histórico" className="w-6 h-6" />
          Histórico
        </BarraLateral.Item>

        <div className="mt-auto">
          <BarraLateral.Item onClick={() => { handleLogout(); Voltar(); }}>
            <Image src={sair} alt="Ajuda" className="w-6 h-6" />
            Voltar
          </BarraLateral.Item>
        </div>
      </BarraLateral.Root>

      <main className="flex-1 flex flex-col gap-6">
        <Titulo>Reservas</Titulo>

        <div className="flex flex-1 gap-8">
          <div className="flex flex-col justify-around">
            <CardIcone.Root onClick={() => setPainel("buscar")}>
              <Image
                src={livroIcone}
                alt="Buscar livro"
                className="w-20 h-20 object-contain"
              />
              <CardIcone.Texto>Buscar livros</CardIcone.Texto>
            </CardIcone.Root>

            <CardIcone.Root onClick={() => setPainel("renovacao")}>
              <Image
                src={renovacaoIcone}
                alt="Renovação"
                className="w-20 h-20 object-contain"
              />
              <CardIcone.Texto>Renovação de empréstimo</CardIcone.Texto>
            </CardIcone.Root>
          </div>

          <section className="flex-1 bg-[#FFF8E1] text-[#4A5546] rounded-4xl shadow-lg p-6 min-h-96 max-h-[75vh] overflow-y-auto flex flex-col">
            {painel === null && (
              <p className="m-auto text-center font-serif italic">
                Escolha uma opção
              </p>
            )}

            {painel === "buscar" && (
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por título, autor ou gênero"
                  className="w-full rounded-full bg-white/70 px-5 py-3 outline-none focus:ring-2 focus:ring-[#4A5546]"
                />

                {erro && <p className="text-sm text-red-600">{erro}</p>}

                {carregado && livros.length === 0 && !erro && (
                  <p className="text-center font-serif italic">
                    Nenhum livro encontrado.
                  </p>
                )}

                <ul className="flex flex-col gap-3">
                  {livros.map((livro) => (
                    <li
                      key={livro.id}
                      className="rounded-2xl bg-white/60 px-5 py-3"
                    >
                      <p className="font-serif italic font-bold">
                        {livro.nome}
                      </p>
                      <p className="text-sm">
                        {livro.nome_do_autor} · {livro.editora} · {livro.ano}
                      </p>
                      <p className="text-xs opacity-70">{livro.genero}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {painel === "renovacao" && (
              <div className="flex flex-col gap-4">
                <h3 className="font-serif italic font-bold text-lg">Meus Empréstimos Ativos</h3>

                {erroRenovacao && <p className="text-sm text-red-600">{erroRenovacao}</p>}

                {emprestimos.length === 0 && !erroRenovacao && (
                  <p className="text-center font-serif italic">
                    Você não possui empréstimos ativos no momento.
                  </p>
                )}

                <ul className="flex flex-col gap-3">
                  {emprestimos.map((emp) => (
                    <li
                      key={emp.id}
                      className="rounded-2xl bg-white/60 px-5 py-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-serif italic font-bold">Empréstimo #{emp.id}</p>
                        <p className="text-sm">
                          Devolução prevista para: {new Date(emp.data_prevista_devolucao).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRenovar(emp.id)}
                        className="bg-[#4A5546] text-[#FFF8E1] px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition cursor-pointer"
                      >
                        Renovar (+7 dias)
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
