// Funções de data usadas nas telas de empréstimo, devolução e renovação.
// Trabalham sempre com texto "yyyy-mm-dd" para evitar erro de fuso horário.

// "2026-11-05T00:00:00.000Z" -> "2026-11-05"
export function soData(valor: string) {
  return valor.slice(0, 10);
}

// "2026-11-05" -> "05/11/2026"
export function formatarData(valor?: string | null) {
  if (!valor) return "—";
  const [ano, mes, dia] = soData(valor).split("-");
  return `${dia}/${mes}/${ano}`;
}

function paraUTC(iso: string) {
  const [ano, mes, dia] = soData(iso).split("-").map(Number);
  return Date.UTC(ano, mes - 1, dia);
}

// Data de hoje no horário do navegador, em "yyyy-mm-dd"
export function hojeISO() {
  const hoje = new Date();
  const dois = (n: number) => String(n).padStart(2, "0");
  return `${hoje.getFullYear()}-${dois(hoje.getMonth() + 1)}-${dois(hoje.getDate())}`;
}

export function somarDias(iso: string, dias: number) {
  return new Date(paraUTC(iso) + dias * 86_400_000).toISOString().slice(0, 10);
}

// Dias de atraso entre a data prevista e a data de entrega (0 se estiver no prazo)
export function diasDeAtraso(prevista: string, ate: string = hojeISO()) {
  return Math.max(0, Math.floor((paraUTC(ate) - paraUTC(prevista)) / 86_400_000));
}
