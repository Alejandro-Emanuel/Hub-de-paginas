import "./App.css";
import { Login } from "./pages/login";
import { Cadastro } from "./pages/cadastro";
import { DasboardAdm } from "./pages/dashboardAdm";
import { useState } from "react";

type Tela = "login" | "cadastro" | "DashboardAdm";

function App() {
  const [tela, setTela] = useState<Tela>("login");

  if (tela === "DashboardAdm") {
    return <DasboardAdm onLogout={() => setTela("login")} />;
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
