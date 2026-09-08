import api from "./api";

export async function buscarLojas() {
  const { data } = await api.get("/vendas/lojas");
  return data;
}
