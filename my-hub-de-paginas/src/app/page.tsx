"use client";

import { useState } from "react";
import { Login } from "@/pages/login";
import { Cadastro } from "@/pages/cadastro";
import { DashboardAdm } from "@/pages/dashboardAdm";
import { CadastrarLivros } from "@/pages/CadastrarLivros";
<<<<<<< HEAD
import { Relatorios } from "@/pages/relatorios";
=======
import { Reservas } from "@/pages/reservas";
>>>>>>> 2b85767 (tela de reservas front)

type Tela =
  | "login"
  | "cadastro"
  | "dashboardAdm"
  | "cadastrarLivros"
  | "emprestimos"
  | "reservas"
  | "multas"
  | "relatorios";

export default function Home() {
  const [tela, setTela] = useState<Tela>("login");

  if (tela === "relatorios") {
  return (
    <Relatorios
      Voltar={() => setTela("dashboardAdm")}
    />
  );
}

  if (tela === "cadastro") {
    return <Cadastro IrParaLogin={() => setTela("login")} />;
  }

  if (tela === "dashboardAdm") {
    return <DashboardAdm onLogout={() => setTela("login")} IrPara={setTela} />;
  }

  if (tela === "cadastrarLivros") {
    return <CadastrarLivros Voltar={() => setTela("dashboardAdm")} />;
  }

  if (tela === "reservas") {
    return (
      <Reservas
        Voltar={() => setTela("dashboardAdm")}
        onLogout={() => setTela("login")}
      />
    );
  }

  return (
    <Login
      IrParaCasdastro={() => setTela("cadastro")}
      SucessoLogin={() => setTela("dashboardAdm")}
    />
  );
}
