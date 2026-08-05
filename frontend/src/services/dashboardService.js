import api from "./api";

export async function buscarIndicadores() {
  const response = await api.get("/dashboard/indicadores");

  return response.data;
}
export async function buscarUltimasImportacoes() {
  const { data } = await api.get("/dashboard/ultimas-importacoes");
  return data;
}