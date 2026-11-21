"use client";

import Image, { type StaticImageData } from "next/image";
import { Tela } from "@/utils/telas";
import { BarraLateral } from "./BarraLateral";
import perfil from "../assets/iconeCards/Perfil.png";
import casinhaIcon from "../assets/iconeCards/casinhaIcon.png";
import livroIcon from "../assets/iconeCards/Livro.png";
import dollarIcon from "../assets/iconeCards/Dollar sign.png";
import multaIcon from "../assets/iconeCards/Multa.png";
import clipIcon from "../assets/iconeCards/Paperclip.png";
import ajudaIcon from "../assets/iconeCards/interrogaçãoIcon.png";
import retornarIcon from "../assets/iconeCards/Log out.png";

interface BarraAdminProps {
  atual?: Tela; // tela aberta agora: o item dela não aparece no menu
  IrPara: (tela: Tela) => void;
  Voltar: () => void;
}

const ITENS: Array<{ tela: Tela; rotulo: string; icone: StaticImageData }> = [
  { tela: "dashboardAdm", rotulo: "Início", icone: casinhaIcon },
  { tela: "cadastrarLivros", rotulo: "Livros", icone: livroIcon },
  { tela: "emprestimosDevolucoes", rotulo: "Empréstimos", icone: dollarIcon },
  { tela: "multas", rotulo: "Multas", icone: multaIcon },
  { tela: "relatorios", rotulo: "Relatórios", icone: clipIcon },
];

// Barra lateral padrão das telas de administrador:
// perfil, atalhos, e embaixo Ajuda + Voltar.
export function BarraAdmin({ atual, IrPara, Voltar }: BarraAdminProps) {
  return (
    <BarraLateral.Root>
      <Image
        src={perfil}
        alt="Perfil do administrador"
        className="w-20 h-20 rounded-full mx-auto"
      />
      <hr />

      {ITENS.filter((item) => item.tela !== atual).map((item) => (
        <BarraLateral.Item key={item.tela} onClick={() => IrPara(item.tela)}>
          <Image src={item.icone} alt="" className="w-6 h-6" />
          {item.rotulo}
        </BarraLateral.Item>
      ))}

      <div className="mt-auto flex flex-col gap-4">
        {atual !== "help" && (
          <BarraLateral.Item onClick={() => IrPara("help")}>
            <Image src={ajudaIcon} alt="" className="w-6 h-6" />
            Ajuda
          </BarraLateral.Item>
        )}

        <BarraLateral.Item onClick={Voltar}>
          <Image src={retornarIcon} alt="" className="w-6 h-6" />
          Voltar
        </BarraLateral.Item>
      </div>
    </BarraLateral.Root>
  );
}