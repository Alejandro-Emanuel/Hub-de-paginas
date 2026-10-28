import { prisma } from "@/lib/prisma";

export async function buscarInformacoesAjuda() {
  // Busca o primeiro registro de configuração cadastrado
  const configuracaoAjuda = prisma.configuracaoAjuda;
  let config = await configuracaoAjuda.findFirst();
  
  // Se não existir nenhum, cria um padrão automaticamente no banco
  if (!config) {
    config = await configuracaoAjuda.create({
      data: {
        telefone: "(84) 9833-8627",
        email: "teste@gmail.com.br",
      },
    });
  }

  return config;
}

export async function atualizarInformacoesAjuda(dados: { telefone: string; email: string }) {
  const configuracaoAjuda = prisma.configuracaoAjuda;
  const config = await configuracaoAjuda.findFirst();
  
  if (config) {
    return await configuracaoAjuda.update({
      where: { id: config.id },
      data: dados,
    });
  } else {
    return await configuracaoAjuda.create({
      data: dados,
    });
  }
}
