// Regra da multa por atraso, num lugar só.
// Isto é uma ESTIMATIVA mostrada nas telas: o valor oficial é calculado
// e gravado pelo backend quando a devolução é registrada.

// Valor cobrado por dia de atraso (em reais). Troque pelo valor real da biblioteca.
export const VALOR_MULTA_POR_DIA = 1;

export function estimarMulta(diasAtraso: number) {
  return Math.max(0, diasAtraso) * VALOR_MULTA_POR_DIA;
}