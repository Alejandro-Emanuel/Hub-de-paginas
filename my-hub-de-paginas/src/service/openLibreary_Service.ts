export interface LivroExterno {
  titulo: string;
  autor: string;
  ano: number | null;
  editora: string;
  capa: string | null;
}

export async function buscarLivrosExternos(
  busca: string,
): Promise<LivroExterno[]> {
  if (!busca) return [];

  const url =
    `https://openlibrary.org/search.json?q=${encodeURIComponent(busca)}` +
    `&limit=10&fields=title,author_name,first_publish_year,publisher,cover_i`;

  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error("Open Library indisponível");

  const dados = await resposta.json();

  return dados.docs.map((doc: any) => ({
    titulo: doc.title,
    autor: doc.author_name?.[0] ?? "Autor desconhecido",
    ano: doc.first_publish_year ?? null,
    editora: doc.publisher?.[0] ?? "Não informada",
    capa: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
  }));
}
