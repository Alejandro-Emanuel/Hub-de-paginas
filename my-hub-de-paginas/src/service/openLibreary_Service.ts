export interface LivroExterno {
  titulo: string;
  autor: string;
  ano: number | null;
  editora: string;
  capa: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function buscarLivrosExternos(
  busca: string,
): Promise<LivroExterno[]> {
  const consulta = busca.trim();
  if (!consulta) return [];

  const url =
    `https://openlibrary.org/search.json?q=${encodeURIComponent(consulta)}` +
    `&limit=10&fields=title,author_name,first_publish_year,publisher,cover_i`;

  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error("Open Library indisponível");

  const dados: unknown = await resposta.json();
  if (!isRecord(dados) || !Array.isArray(dados.docs)) {
    throw new Error("Resposta inválida da Open Library");
  }

  const documentos: unknown[] = dados.docs;
  return documentos.map((item) => {
    const doc = isRecord(item) ? item : {};
    const autores = Array.isArray(doc.author_name)
      ? doc.author_name.filter(
          (autor: unknown): autor is string => typeof autor === "string",
        )
      : [];
    const editoras = Array.isArray(doc.publisher)
      ? doc.publisher.filter(
          (editora: unknown): editora is string => typeof editora === "string",
        )
      : [];
    const coverId = typeof doc.cover_i === "number" ? doc.cover_i : null;

    return {
      titulo:
        typeof doc.title === "string" ? doc.title : "Título desconhecido",
      autor: autores[0] ?? "Autor desconhecido",
      ano:
        typeof doc.first_publish_year === "number"
          ? doc.first_publish_year
          : null,
      editora: editoras[0] ?? "Não informada",
      capa: coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : null,
    };
  });
}
