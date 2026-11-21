"use client";

import { useState } from "react";
import { Login } from "@/telas/login";
import { Cadastro } from "@/telas/cadastro";
import { CadastroAdm } from "@/telas/CadastroAdm";
import { DashboardAdm } from "@/telas/dashboardAdm";
import { DashboardUsuario } from "@/telas/dashboardUsuario";
import { CadastrarLivros } from "@/telas/CadastrarLivros";
import { EmprestimosDevolucoes } from "@/telas/emprestimosDevolucoes";
import { HistoricoUsuario } from "@/telas/historicoUsuario";
import { Reservas } from "@/telas/reservas";
import { Multas } from "@/telas/Multas";
import { MultasUsuario } from "@/telas/MultasUsuario";
import { Help } from "@/telas/help";
import { Relatorios } from "@/telas/relatorios";
import { Tela } from "@/utils/telas";



export default function Home() {
  const [tela, setTela] = useState<Tela>("login");
  const [historico, setHistorico] = useState<Tela[]>([]);

  
  function IrPara(destino: Tela) {
    setHistorico([...historico, tela]);
    setTela(destino);
  }

  
  function Voltar() {
    setTela(historico[historico.length - 1] ?? "login");
    setHistorico(historico.slice(0, -1));
  }

  // Sai da aplicação, removendo o token e limpando o histórico
  function Sair() {
    localStorage.removeItem("token");
    setHistorico([]);
    setTela("login");
  }

  if (tela === "cadastro") {
    return <Cadastro IrParaLogin={Sair} />;
  }

    if (tela === "cadastroAdm") {
    return (
      <CadastroAdm
        IrParaLogin={Sair}
        SucessoLogin={(tipo) =>
          IrPara(tipo === "adm" ? "dashboardAdm" : "dashboardUsuario")
        }
      />
    );
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
    return <EmprestimosDevolucoes Voltar={Voltar} IrPara={IrPara} />;
  }

  if (tela === "historicoUsuario") {
    return <HistoricoUsuario onLogout={Sair} IrPara={IrPara} />;
  }

  if (tela === "reservas") {
    return (
      <Reservas
        Voltar={Voltar}
        IrParaAjuda={() => IrPara("help")}
      />
    );
  }

  if (tela === "multas") {
    return <Multas Voltar={Voltar} IrPara={IrPara} />;
  }

  if (tela === "multasUsuario") {
    return <MultasUsuario onLogout={Sair} IrPara={IrPara} />;
  }

  if (tela === "help") {
    return <Help Voltar={Voltar} />;
  }

  if (tela === "relatorios") {
    return <Relatorios Voltar={Voltar} IrPara={IrPara} />;
  }

    return (
    <Login
      IrParaCasdastro={() => IrPara("cadastro")}
      IrParaCadastroAdm={() => IrPara("cadastroAdm")}
      SucessoLogin={(tipo) =>
        IrPara(tipo === "adm" ? "dashboardAdm" : "dashboardUsuario")
      }
    />
  );
}