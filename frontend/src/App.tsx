import "./App.css";
import { Login } from "./pages/login";
import { Cadastro } from "./pages/cadastro";
import { DashboardAdm } from "./pages/dashboardAdm";
import { CadastrarLivros } from "./pages/CadastrarLivros";
import { useState } from "react";

export type Tela = "login" | "cadastro" | "DashboardAdm" | "cadastrarLivros";

function App() {
  const [tela, setTela] = useState<Tela>("login");

  if (tela === "DashboardAdm") {
    return (<DashboardAdm onLogout={() => setTela("login")} IrPara={setTela} />);
  }

  if (tela === "cadastrarLivros") {
    return <CadastrarLivros Voltar={() => setTela("DashboardAdm")} />;
  }

  if (tela === "cadastro") {
    return <Cadastro IrParaLogin={() => setTela("login")} />;
  }

  return (
    <Login
      IrParaCasdastro={() => setTela("cadastro")}
      SucessoLogin={() => setTela("DashboardAdm")}
    />
  );
}

export default App;
