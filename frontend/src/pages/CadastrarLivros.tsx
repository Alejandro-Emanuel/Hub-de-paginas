import { BarraLateral } from "../components/BarraLateral";
import { Titulo } from "../components/Titulo";

interface CadastrarLivrosProps {
    Voltar: () => void;
}

export function CadastrarLivros({Voltar}: CadastrarLivrosProps) {
  return (
    <div className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6">
      <BarraLateral.Root>
        <img src="" alt="" className="w-6 h-6 rounded-full mx-auto" />
        <hr />

        <BarraLateral.Item>
          <img src="" alt="" />
        </BarraLateral.Item>

        <BarraLateral.Item>
          <img src="" alt="" />
        </BarraLateral.Item>

        <BarraLateral.Item>
          <img src="" alt="" />
        </BarraLateral.Item>
        <div className="mt-auto">
            <button onClick={Voltar}>Voltar</button>
        </div>
      </BarraLateral.Root>
      
      <div className="flex-1 flex flex-col gap-8">
        <Titulo>Cadastrar livro</Titulo>

      </div>
    </div>
  );
}
