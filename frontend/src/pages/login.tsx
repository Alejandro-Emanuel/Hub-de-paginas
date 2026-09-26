import backLoginImg from "../assets/BackLogin.png";
import iconePerfil from "../assets/iconePerfil.jpeg";
import Google from "../assets/Google.jpg";
import { useState } from "react";

interface LoginProps {
  IrParaCasdastro: () => void;
}

export function Login({IrParaCasdastro}: LoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !senha) {
      setErro('Preencha o E-mail e a Senha')
      return;
    }

    setErro('');
    console.log('valores', {email, senha});
  };

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat flex items-center justify-end pr-12 md:pr-24"
      style={{ backgroundImage: `url(${backLoginImg})` }}
    >
      <div className="bg-[#E2E4CF] w-full max-w-md p-8 rounded-[40px] flex flex-col items-center text-[#4A5546] shadow-lg">
        <img
          className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
          src={iconePerfil}
          alt="icone-Perfil"
        />

        <h1 className="text-xl font-bold mb-4">Faça seu login</h1>

        <form 
        className="w-full flex flex-col gap-5 text-sm font-semibold"
        onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="email" className="block mb-1">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 rounded-full bg-[#FAF9EE] outline-none text-base placeholder:text-gray-400"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block mb-1">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-2.5 rounded-full bg-[#FAF9EE] outline-none"
            />
            <a
              href="#"
              className="block text-right text-[10px] text-[#E08328] mt-1"
            >
              Esqueceu sua senha?
            </a>
          </div>

          {erro && (
            <p className="text-xs text-red-600 text-center -mt-2"> {erro} </p>
          )}

          <div className="w-full flex justify-center mt-2 p-3">
            <button
              type="submit"
              className="bg-[#4E5C4E] text-white py-2 px-6 rounded-xl self-center mt-2"
            >
              Entrar
            </button>
          </div>
        </form>

        <div className="">
          <p className="text-xs font-semibold mb-2">Conecte-se também com</p>

          <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#BFC2AA] mb-4 ">
            <img src={Google} alt="login com google" />
          </button>

          <p className="text-xs text-[#5A6455] font-medium">
            Não tem conta?{" "}
            <button 
              type="button"
              onClick={IrParaCasdastro}
              className="text-[#E08328] font-bold hover:underline"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
