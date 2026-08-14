import api from "./api";

export async function buscarDepartamentos() {
  const response = await api.get("/vendas/departamentos");

  return response.data;
}