import api from "./api";

export async function importarProdutos(arquivo) {
  const formData = new FormData();

  formData.append("arquivo", arquivo);

  const response = await api.post(
    "/produtos/importar",
    formData
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

export async function importarEntradas(arquivo) {
  const formData = new FormData();

  formData.append("arquivo", arquivo);

  const response = await api.post(
    "/entradas/importar",
    formData
  );

  return response.data;
}

export async function importarVendas(arquivo) {
  const formData = new FormData();

  formData.append("arquivo", arquivo);

  const response = await api.post(
    "/vendas/importar",
    formData
  );

  return response.data;
}