import './App.css'
import { Login } from './pages/login'
import { Cadastro } from './pages/cadastro'
import { useState } from 'react';

type Tela = "login" | "cadastro";

function App() {
  const [tela, setTela] = useState<Tela>("login");
  
  if (tela === "cadastro") {
    return <Cadastro IrParaLogin={() => setTela("login")} />;
  }
  
  return <Login IrParaCasdastro={() => setTela("cadastro")} />;
}

export default App
