import api from "./api";

export async function buscarComprasMes(lojaId) {
  const { data } = await api.get(
    "/dashboard/compras-mes",
    {
      params: { loja_id: lojaId },
    }
  );
  return data;
}

export async function buscarTopFornecedores(lojaId) {
  const { data } = await api.get(
    "/dashboard/top-fornecedores",
    {
      params: { loja_id: lojaId },
    }
  );
  return data;
}

export async function buscarComprasDepartamento(lojaId) {
  const { data } = await api.get(
    "/dashboard/compras-departamento",
    {
      params: { loja_id: lojaId },
    }
  );
  return data;
}