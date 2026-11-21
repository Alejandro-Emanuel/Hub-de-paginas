// Ajudantes de front-end para falar com a API usando o token do login.

export function lerToken() {
  return typeof window === "undefined" ? null : localStorage.getItem("token");
}

// Só para decidir o que MOSTRAR na tela (ex.: botões de admin).
// A segurança de verdade precisa ser feita no backend.
export function tipoDoToken(): string | null {
  const token = lerToken();
  if (!token) return null;

  try {
    const corpo = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(corpo)).tipo ?? null;
  } catch {
    return null;
  }
}

// Faz a chamada, já com o token, e devolve o JSON.
// Se der erro, lança uma Error com a mensagem que a API mandou.
export async function chamarApi<T>(
  url: string,
  opcoes: Omit<RequestInit, "headers"> = {},
): Promise<T> {
  const token = lerToken();

  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(
      resposta.status === 401
        ? "Sua sessão expirou. Entre novamente."
        : ((dados as { mensagem?: string }).mensagem ??
            "Não foi possível concluir a operação."),
    );
  }

  return dados as T;
}
