const resposta = await fetch("/api/relatorios", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    titulo: "Relatório de outubro",
    descricao: "Movimentação da biblioteca",
    periodo_inicio: "2026-10-01",
    periodo_fim: "2026-10-31",
    observacoes: "Revisar as devoluções em atraso.",
  }),
});

const resultado = await resposta.json();

if (!resposta.ok) {
  alert(resultado.mensagem);
} else {
  alert("Relatório foi efetuado com exito");
}