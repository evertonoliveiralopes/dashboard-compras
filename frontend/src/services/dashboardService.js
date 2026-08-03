import api from "./api";

export async function buscarIndicadores() {
  const response = await api.get("/dashboard/indicadores");

  return response.data;
}