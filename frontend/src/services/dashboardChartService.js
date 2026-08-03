import api from "./api";

export async function buscarComprasMes() {
  const { data } = await api.get("/dashboard/compras-mes");
  return data;
}

export async function buscarTopFornecedores() {
  const { data } = await api.get("/dashboard/top-fornecedores");
  return data;
}

export async function buscarComprasDepartamento() {
  const { data } = await api.get("/dashboard/compras-departamento");
  return data;
}