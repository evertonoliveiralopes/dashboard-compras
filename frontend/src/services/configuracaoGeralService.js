import api from "./api";

export async function buscarEmpresas(signal) {
  const { data } = await api.get("/configuracoes/empresas", { signal });
  return data;
}

export async function buscarUsuarios(signal) {
  const { data } = await api.get("/configuracoes/usuarios", { signal });
  return data;
}

export async function salvarEmpresa(id, dados) {
  const rota = "/configuracoes/empresas";
  const resposta = id ? await api.put(rota + "/" + id, dados) : await api.post(rota, dados);
  return resposta.data;
}

export async function salvarUsuario(id, dados) {
  const rota = "/configuracoes/usuarios";
  const resposta = id ? await api.put(rota + "/" + id, dados) : await api.post(rota, dados);
  return resposta.data;
}

export async function salvarPermissao(id, administrador) {
  const { data } = await api.put("/configuracoes/usuarios/" + id + "/permissao", { administrador });
  return data;
}
