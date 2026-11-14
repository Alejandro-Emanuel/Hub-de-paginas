"use client";

import { useState } from "react";
import { Login } from "@/pages/login";
import { Cadastro } from "@/pages/cadastro";
import { DashboardAdm } from "@/pages/dashboardAdm";
import { DashboardUsuario } from "@/pages/dashboardUsuario";
import { CadastrarLivros } from "@/pages/CadastrarLivros";
import { EmprestimosDevolucoes } from "@/pages/emprestimosDevolucoes";
import { HistoricoUsuario } from "@/pages/historicoUsuario";
import { Reservas } from "@/pages/reservas";
import { Multas } from "@/pages/Multas";
import { Help } from "@/pages/help";
import { Relatorios } from "@/pages/relatorios";

type Tela =
  | "login"
  | "cadastro"
  | "dashboardAdm"
  | "dashboardUsuario"
  | "cadastrarLivros"
  | "emprestimosDevolucoes"
  | "historicoUsuario"
  | "reservas"
  | "multas"
  | "help"
  | "relatorios";

export default function Home() {
  const [tela, setTela] = useState<Tela>("login");
  const [anterior, setAnterior] = useState<Tela>("login");

  // Troca de tela guardando de onde o usuário veio
  function IrPara(destino: Tela) {
    setAnterior(tela);
    setTela(destino);
  }

  // Volta para a tela de onde o usuário veio
  function Voltar() {
    setTela(anterior);
  }

  // Sai da conta e volta ao login
  function Sair() {
    setTela("login");
  }

  if (tela === "cadastro") {
    return <Cadastro IrParaLogin={Sair} />;
  }

  if (tela === "dashboardAdm") {
    return <DashboardAdm onLogout={Sair} IrPara={IrPara} />;
  }

  if (tela === "dashboardUsuario") {
    return <DashboardUsuario onLogout={Sair} IrPara={IrPara} />;
  }

  if (tela === "cadastrarLivros") {
    return (
      <CadastrarLivros
        Voltar={Voltar}
        Ajuda={() => IrPara("help")}
        Reservas={() => IrPara("reservas")}
      />
    );
  }

  if (tela === "emprestimosDevolucoes") {
    return <EmprestimosDevolucoes onLogout={Sair} IrPara={IrPara} />;
  }

  if (tela === "historicoUsuario") {
    return <HistoricoUsuario onLogout={Sair} IrPara={IrPara} />;
  }

  if (tela === "reservas") {
    return (
      <Reservas
        Voltar={Voltar}
        onLogout={Sair}
        IrParaAjuda={() => IrPara("help")}
      />
    );
  }

  if (tela === "multas") {
    return <Multas Voltar={Voltar} />;
  }

  if (tela === "help") {
    return <Help Voltar={Voltar} />;
  }

  if (tela === "relatorios") {
    return <Relatorios Voltar={Voltar} />;
  }


  return (
    <Login
      IrParaCasdastro={() => IrPara("cadastro")}
      SucessoLogin={(tipo) =>
        IrPara(tipo === "adm" ? "dashboardAdm" : "dashboardUsuario")
      }
    />
  );
}