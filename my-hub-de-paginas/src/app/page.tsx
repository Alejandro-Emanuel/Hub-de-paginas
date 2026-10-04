"use client";

import { useState } from "react";
import { Login } from "@/telas/login";
import { Cadastro } from "@/telas/cadastro";
import { DashboardAdm } from "@/telas/dashboardAdm";
import { CadastrarLivros } from "@/telas/CadastrarLivros";

type Tela = "login" | "cadastro" | "dashboardAdm" | "cadastrarLivros";

export default function Home() {
  const [tela, setTela] = useState<Tela>("login");

  if (tela === "cadastro") {
    return <Cadastro IrParaLogin={() => setTela("login")} />;
  }

  if (tela === "dashboardAdm") {
    return <DashboardAdm onLogout={() => setTela("login")} IrPara={setTela} />;
  }

  if (tela === "cadastrarLivros") {
    return <CadastrarLivros Voltar={() => setTela("dashboardAdm")} />;
  }

  return (
    <Login
      IrParaCasdastro={() => setTela("cadastro")}
      SucessoLogin={() => setTela("dashboardAdm")}
    />
  );
}