import api from "./api";

export async function buscarComprasMes(
  lojaId,
  periodo,
  dataInicio = null,
  dataFim = null
) {
  const params = {
    loja_id: lojaId,
    periodo,
  };

  if (periodo === "personalizado") {
    params.data_inicio = dataInicio;
    params.data_fim = dataFim;
  }

  const { data } = await api.get(
    "/dashboard/compras-mes",
    { params }
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