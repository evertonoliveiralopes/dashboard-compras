import api from "./api";

export async function buscarConfiguracoesAlertas() {
  const response = await api.get(
    "/config-alertas"
  );

  return response.data;
}

export async function salvarConfiguracoesAlertas(
  configuracoes
) {
  const response = await api.post(
    "/config-alertas",
    configuracoes
  );

  return response.data;
}