import api from "./api";

export async function buscarProdutos({
  busca = "",
  departamento = "",
  offset = 0,
  limit = 50,
} = {}) {
  const params = {
    offset,
    limit,
  };

  if (busca) {
    params.busca = busca;
  }

  if (departamento) {
    params.departamento = departamento;
  }

  const response = await api.get("/produtos", {
    params,
  });

  return response.data;
}