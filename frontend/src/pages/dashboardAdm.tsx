import { CardIcone } from "../components/CardsDashboard";
import { BarraLateral } from "../components/BarraLateral";
import {Titulo} from "../components/Titulo"
import livro from "../assets/iconeCards/Livro.png";
import Dollar from "../assets/iconeCards/Dollar sign.png";
import Marcador from "../assets/iconeCards/Marcador.png";
import Multa from "../assets/iconeCards/Multa.png";
import Clip from "../assets/iconeCards/Paperclip.png";
import Perfil from "../assets/iconeCards/Perfil.png"
// import { config } from "../assets/iconeCards/Renovacao.png";?



interface DashboardAdmProps {
  onLogout: () => void;
}

export function DasboardAdm({ onLogout }: DashboardAdmProps) {
  return (
    <div className="min-h-screen bg-[#C5CBB0] flex gap-6 p-6">
      
      <BarraLateral.Root>
        <img src={Perfil} alt="" className="w-20 h-20 rounded-full mx-auto" />
        <hr/>

        <BarraLateral.Item>
          <img src="" alt="" className="w-6 h-6" />
          Config
        </BarraLateral.Item>

        <BarraLateral.Item>
          <img src="" alt="" className="w-6 h-6" />
          Adjuda
        </BarraLateral.Item>

        <BarraLateral.Item>
          <img src={Marcador} alt="" className="w-6 h-6" />
          Historico
        </BarraLateral.Item>

        <div className="mt-auto">
          <BarraLateral.Item onClick={onLogout}>
            <img src="" alt="" className="w-6 h-6"/>
            Log out
          </BarraLateral.Item>
        </div>
      </BarraLateral.Root>

      <main className="flex-1 flex flex-col gap-8">
        <Titulo>Gestão</Titulo>

        <div className="flex flex-wrap justify-center gap-12">
          <CardIcone.Root>
        <img
          src={livro}
          alt="icone de livro"
          className="w-20 h-20 object-contain"
        />
        <CardIcone.Texto>Cadastrar</CardIcone.Texto>
      </CardIcone.Root>

      <CardIcone.Root>
        <img
          src={Dollar}
          alt="icone de livro"
          className="w-20 h-20 object-contain"
        />
        <CardIcone.Texto>Emprestimos</CardIcone.Texto>
      </CardIcone.Root>

      <CardIcone.Root>
        <img
          src={Marcador}
          alt="icone de livro"
          className="w-20 h-20 object-contain"
        />
        <CardIcone.Texto>Reservas</CardIcone.Texto>
      </CardIcone.Root>

      <CardIcone.Root>
        <img
          src={Multa}
          alt="icone de livro"
          className="w-20 h-20 object-contain"
        />
        <CardIcone.Texto>Multas</CardIcone.Texto>
      </CardIcone.Root>

      <CardIcone.Root>
        <img
          src={Clip}
          alt="icone de livro"
          className="w-20 h-20 object-contain"
        />
        <CardIcone.Texto>Relatorios</CardIcone.Texto>
      </CardIcone.Root>

        </div>
      </main>
    </div>
  );
}
