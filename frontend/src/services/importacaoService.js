import api from "./api";

export async function importarProdutos(arquivo, lojaId) {
  const formData = new FormData();

  formData.append("arquivo", arquivo);

  const response = await api.post(
    "/produtos/importar",
    formData,
    {
      params: { loja_id: lojaId },
    }
  );

  return response.data;
}

export async function importarDepartamentos(arquivo) {
  const formData = new FormData();

  formData.append("arquivo", arquivo);

  const response = await api.post(
    "/departamentos/importar",
    formData
  );

  return response.data;
}

export async function importarFornecedores(arquivo) {
  const formData = new FormData();

  formData.append("arquivo", arquivo);

  const response = await api.post(
    "/fornecedores/importar",
    formData
  );

  return response.data;
}

export async function importarEntradas(arquivo, lojaId) {
  const formData = new FormData();

  formData.append("arquivo", arquivo);

  const response = await api.post(
    "/entradas/importar",
    formData,
    {
      params: { loja_id: lojaId },
    }
  );

  return response.data;
}

export async function importarVendas(arquivo, lojaId) {
  const formData = new FormData();

  formData.append("arquivo", arquivo);

  const response = await api.post(
    "/vendas/importar",
    formData,
    {
      params: { loja_id: lojaId },
    }
  );

  return response.data;
}