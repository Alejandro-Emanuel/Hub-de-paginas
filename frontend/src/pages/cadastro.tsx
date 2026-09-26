import React, { useState } from 'react'
import BackCadastro from '../assets/BackCadastro.png'
import iconePerfil from '../assets/iconePerfil.jpeg'

interface CadastroProps {
    IrParaLogin: () => void
}

export function Cadastro({IrParaLogin}: CadastroProps) {
    const [nome, setName] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmSenha, setConfirmSenha] = useState("");
    const [erro, setErro] = useState("");
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nome || !email || !senha || !confirmSenha) {
            setErro("Preencha todos os campos")
            return
        }

        if (senha !== confirmSenha) {
            setErro("As senhas n estão iguais")
            return;
        }

        setErro("");
        console.log("valores", {nome, email, senha});

    };
    
    
    
    return(
        <div className="w-screen h-screen bg-cover bg-center flex items-center justify-end p-8 md:p-16" 
        style={{backgroundImage: `url(${BackCadastro})`}}
        >
            <div className="bg-[#E2E4CF] w-full max-w-md p-8 rounded-[40px] flex flex-col items-center text-[#4A5546] shadow-lg">
                <div className="w-16 h-16 rounded-full border-2 border-[#4A5546] flex items-center justify-center mb-2">
                    <img
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
                    src={iconePerfil}
                    alt="icone-Perfil"
                    />
                </div>

                <h1 className="text-xl font-bold mb-4">Crie sua conta</h1>

                <form 
                    className='w-full flex flex-col gap-5 text-sm font-semibold'
                    onSubmit={handleSubmit}
                    >

                    <div>
                        <label htmlFor='nome' className='block mb-1 pl-1'>Digite seu nome</label>
                        <input 
                            type="text"
                            id='text'
                            placeholder='Seu nome'
                            value={nome}
                            onChange={(e) => setName(e.target.value)}
                            className='w-full p-3.5 rounded-full bg-[#FAF9EE] outline-none text-base placeholder:text-grey-400'
                        />
                    </div>

                    <div>
                        <label htmlFor='email' className='block mb-1 pl-1'>E-mail</label>
                        <input 
                            type="email"
                            id='email'
                            value={email}
                            placeholder='E-mail'
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full p-3.5 rounded-full bg-[#FAF9EE] outline-none text-base placeholder:text-grey-400'
                        />
                    </div>

                    <div>
                        <label htmlFor='senha' className='block mb-1 pl-1'>Senha</label>
                        <input 
                            type="password"
                            id='senha'
                            value={senha}
                            placeholder='Senha'
                            onChange={(e) => setSenha(e.target.value)}
                            className='w-full p-3.5 rounded-full bg-[#FAF9EE] outline-none text-base placeholder:text-grey-400'
                        />
                    </div>
                    
                    <div>
                        <label htmlFor='confirmarSenha' className='block mb-1 pl-1'>Digite sua Senha novamente</label>
                        <input 
                            type="password"
                            id='confirmarSenha'
                            placeholder='Confirme sua senha'
                            value={confirmSenha}
                            onChange={(e) => setConfirmSenha(e.target.value)}
                            className='w-full p-3.5 rounded-full bg-[#FAF9EE] outline-none text-base placeholder:text-grey-400'
                        />
                    </div>

                    {erro && (
                        <p className='text-xs text-red-600 text-center -mt-2'> {erro} </p>
                    )}

                    <div className="w-full border-t border-[#BFC2AA] my-6" />
                        <button
                            type="submit"
                            className="bg-[#4E5C4E] text-white py-2.5 px-10 rounded-2xl text-sm font-semibold shadow-md hover:bg-[#3D493D] transition-colors self-center"
                        > 
                        Criar conta
                        </button>

                   
                    <p className="text-xs text-[#5A6455] font-medium text-center">
                        Já tem conta?{" "}
                        <button
                            type="button"
                            onClick={IrParaLogin}
                            className="text-[#E08328] font-bold hover:underline"
                        >
                            Faça login
                        </button>    
                    </p>
                    
                </form>
            </div>
        </div>
    )
}