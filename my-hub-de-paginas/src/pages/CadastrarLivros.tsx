import { BarraLateral } from "../components/BarraLateral";
import { Titulo } from "../components/Titulo";
import Image from "next/image";

interface CadastrarLivrosProps {
    Voltar: () => void;
}

export function CadastrarLivros({Voltar}: CadastrarLivrosProps) {
  return (
    <div className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6">
      <BarraLateral.Root>
        <Image src="" alt="" width={24} height={24} className="w-6 h-6 rounded-full mx-auto" />
        <hr />

        <BarraLateral.Item>
          <Image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'/%3E" alt="" width={24} height={24} />
        </BarraLateral.Item>

        <BarraLateral.Item>
          <Image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'/%3E" alt="" width={24} height={24} />
        </BarraLateral.Item>

        <BarraLateral.Item>
          <Image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'/%3E" alt="" width={24} height={24} />
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
