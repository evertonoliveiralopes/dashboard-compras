import api from "./api";

export async function buscarProdutos({
  busca = "",
  departamento = "",
  status = "",
  offset = 0,
  limit = 50,
  lojaId = null,
} = {}) {
  const params = {
    offset,
    limit,
  };

  if (lojaId) {
    params.loja_id = lojaId;
  }

  if (busca) {
    params.busca = busca;
  }

  if (departamento) {
    params.departamento = departamento;
  }

  if (status !== "") {
    params.status = status;
  }

  const response = await api.get("/produtos", {
    params,
  });

  return response.data;
}