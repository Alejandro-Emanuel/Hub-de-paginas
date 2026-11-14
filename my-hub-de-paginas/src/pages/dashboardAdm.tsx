'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { CardIcone } from "../components/CardsDashboard";
import { BarraLateral } from "../components/BarraLateral";
import { Titulo } from "../components/Titulo";
import livro from "../assets/iconeCards/Livro.png";
import Dollar from "../assets/iconeCards/Dollar sign.png";
import Marcador from "../assets/iconeCards/Marcador.png";
import Multa from "../assets/iconeCards/Multa.png";
import Clip from "../assets/iconeCards/Paperclip.png";
import Perfil from "../assets/iconeCards/Perfil.png";
import telaFundo from "../assets/iconeCards/telaDeFundo.png";
import ajudaIcon from "../assets/iconeCards/interrogaçãoIcon.png";
import logoutIcon from "../assets/iconeCards/Log out.png";

type TelaAdmin =
  | "cadastrarLivros"
  | "emprestimosDevolucoes"
  | "reservas"
  | "multas"
  | "relatorios"
  | "help";

interface DashboardAdmProps {
  onLogout: () => void;
  IrPara: (tela: TelaAdmin) => void;
}

export function DashboardAdm({ onLogout, IrPara }: DashboardAdmProps) {
  const [metricas, setMetricas] = useState({
    totalLivros: 0,
    totalEmprestimosAtivos: 0,
    totalReservas: 0,
    totalMultasPendentes: 0,
  });

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const data = await response.json();
          setMetricas(data);
        }
      } catch (err) {
        console.error("Erro ao carregar métricas:", err);
      }
    }
    carregarDashboard();
  }, []);

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
          src={Perfil}
          alt="Perfil do administrador"
          className="w-20 h-20 rounded-full mx-auto"
        />
        <hr />

        <BarraLateral.Item onClick={() => IrPara("help")}>
          <Image src={ajudaIcon} alt="" className="w-6 h-6" />
          Ajuda
        </BarraLateral.Item>

        
        <BarraLateral.Item onClick={() => IrPara("relatorios")}>
          <Image src={Marcador} alt="" className="w-6 h-6" />
          Histórico
        </BarraLateral.Item>

        <div className="mt-auto">
          <BarraLateral.Item onClick={handleLogout}>
            <Image src={logoutIcon} alt="" className="w-6 h-6" />
            Log out
          </BarraLateral.Item>
        </div>
      </BarraLateral.Root>

      <main className="flex-1 flex flex-col gap-8">
        <Titulo>Gestão</Titulo>

        <div className="flex flex-wrap justify-center gap-12">
          <CardIcone.Root onClick={() => IrPara("cadastrarLivros")}>
            <Image
              src={livro}
              alt="Ícone de livro"
              className="w-20 h-20 object-contain"
            />
            <CardIcone.Texto>Cadastrar</CardIcone.Texto>
          </CardIcone.Root>

          
          <CardIcone.Root onClick={() => IrPara("emprestimosDevolucoes")}>
            <Image
              src={Dollar}
              alt="Ícone de empréstimos"
              className="w-20 h-20 object-contain"
            />
            <CardIcone.Texto>
              Empréstimos ({metricas.totalEmprestimosAtivos})
            </CardIcone.Texto>
          </CardIcone.Root>

          <CardIcone.Root onClick={() => IrPara("reservas")}>
            <Image
              src={Marcador}
              alt="Ícone de reservas"
              className="w-20 h-20 object-contain"
            />
            <CardIcone.Texto>
              Reservas ({metricas.totalReservas})
            </CardIcone.Texto>
          </CardIcone.Root>

          <CardIcone.Root onClick={() => IrPara("multas")}>
            <Image
              src={Multa}
              alt="Ícone de multas"
              className="w-20 h-20 object-contain"
            />
            <CardIcone.Texto>
              Multas ({metricas.totalMultasPendentes})
            </CardIcone.Texto>
          </CardIcone.Root>

          <CardIcone.Root onClick={() => IrPara("relatorios")}>
            <Image
              src={Clip}
              alt="Ícone de relatórios"
              className="w-20 h-20 object-contain"
            />
            <CardIcone.Texto>Relatórios</CardIcone.Texto>
          </CardIcone.Root>
        </div>
      </main>
    </div>
  );
}