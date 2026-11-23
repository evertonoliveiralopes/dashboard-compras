import api from "./api";

export async function buscarIndicadores(
  lojaId,
  periodo = "mes",
  dataInicio = null,
  dataFim = null,
  signal
) {
  const params = {
    loja_id: lojaId,
    periodo,
  };

  if (periodo === "personalizado") {
    params.data_inicio = dataInicio;
    params.data_fim = dataFim;
  }

  const response = await api.get(
    "/dashboard/indicadores",
    { params, signal }
  );

  return response.data;
}
export async function buscarUltimasImportacoes() {
  const { data } = await api.get("/dashboard/ultimas-importacoes");
  return data;
}
export async function buscarAlertas(lojaId, codigosComposicao = [], signal) {
  const config = { params: { loja_id: lojaId || undefined }, signal };
  const resposta = codigosComposicao.length > 0
    ? await api.post("/dashboard/alertas", codigosComposicao, config)
    : await api.get("/dashboard/alertas", config);
  return resposta.data;
}
