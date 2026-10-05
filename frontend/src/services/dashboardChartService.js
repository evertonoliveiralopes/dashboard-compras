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

export async function buscarTopFornecedores(
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
    "/dashboard/top-fornecedores",
    { params }
  );

  return data;
}

export async function buscarComprasDepartamento(
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
    "/dashboard/compras-departamento",
    { params }
  );

  return data;
}