import api from "./api";

export async function buscarIndicadores(
  lojaId,
  periodo = "mes",
  dataInicio = null,
  dataFim = null
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
    { params }
  );

  return response.data;
}
export async function buscarUltimasImportacoes() {
  const { data } = await api.get("/dashboard/ultimas-importacoes");
  return data;
}