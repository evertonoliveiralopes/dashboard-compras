import api from "./api";

export async function buscarFornecedores({
  busca = "",
  cnpj = "",
  ativo = "",
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

  if (cnpj) {
    params.cnpj = cnpj;
  }

  if (ativo !== "") {
    params.ativo = ativo;
  }

  const response = await api.get("/fornecedores", {
    params,
  });

  return response.data;
}
