import api from "./api";

export async function buscarIndicadores(lojaId) {
  const response = await api.get(
    "/dashboard/indicadores",
    {
      params: { loja_id: lojaId },
    }
  );

  return response.data;
}
export async function buscarUltimasImportacoes() {
  const { data } = await api.get("/dashboard/ultimas-importacoes");
  return data;
}