import { CardIcone } from "../components/CardsDashboard";
import livro from "../assets/iconeCards/Livro.png";
import Dollar from "../assets/iconeCards/Dollar sign.png";
import Marcador from "../assets/iconeCards/Marcador.png";
import Multa from "../assets/iconeCards/Multa.png";
import Clip from "../assets/iconeCards/Paperclip.png";

interface DashboardAdmProps {
  onLogout: () => void;
}

export function DasboardAdm({ onLogout }: DashboardAdmProps) {
  return (
    <div className="min-h-screen bg-[#C5CBB0] flex flex-wrap items-center justify-center gap-12 p-8">
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
  );
}
