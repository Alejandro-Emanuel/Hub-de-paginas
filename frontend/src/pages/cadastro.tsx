import BackCadastro from '../assets/BackCadastro.png'
import iconePerfil from '../assets/iconePerfil.jpeg'

export function Cadastro() {
    return(
        <div className="w-screen h-screen bg-cover bg-center flex items-center justify-end p-8 md:p-16" 
        style={{backgroundImage: `url(${BackCadastro})`}}
        >
            <div className="bg-[#E2E4CF] w-full max-w-md p-8 rounded-[40px] flex flex-col itemn-center text-[#4A5546] shadow-lg">
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
                    >
                    <div className="">
                        <label className='block mb-1 pl-1'>Digite seu nome</label>
                        <input 
                            type="text"
                            placeholder='Seu nome'
                            className='w-full p-3.5 rounded-full bg-[#FAF9EE] outline-none text-base placeholder:text-grey-400'
                        />
                    </div>

                    <div className="">
                        <label className='block mb-1 pl-1'>E-mail</label>
                        <input 
                            type="email"
                            placeholder='E-mail'
                            className='w-full p-3.5 rounded-full bg-[#FAF9EE] outline-none text-base placeholder:text-grey-400'
                        />
                    </div>

                    <div className="">
                        <label className='block mb-1 pl-1'>Senha</label>
                        <input 
                            type="password"
                            placeholder='Senha'
                            className='w-full p-3.5 rounded-full bg-[#FAF9EE] outline-none text-base placeholder:text-grey-400'
                        />
                    </div>
                    
                    <div className="">
                        <label className='block mb-1 pl-1'>Digite sua Senha novamente</label>
                        <input 
                            type="password"
                            placeholder='Senha'
                            className='w-full p-3.5 rounded-full bg-[#FAF9EE] outline-none text-base placeholder:text-grey-400'
                        />
                    </div>

                    <div className="w-full border-t border-[#BFC2AA] my-6" />

                    <div className="w-full flex justify-center mt-2 p-3">
                        <button
                            type="submit"
                            className="bg-[#4E5C4E] text-white py-2 px-6 rounded-xl self-center mt-2"
                        >
                            Entrar
                        </button>
                    </div>
                </form>
                

            </div>

        </div>
    )
}