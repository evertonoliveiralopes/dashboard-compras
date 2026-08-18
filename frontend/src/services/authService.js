import api from "./api";

export async function login(email, senha) {
  const response = await api.post("/auth/login", {
    email,
    senha,
  });

  return response.data;
}

export async function buscarUsuarioAtual() {
  const response = await api.get("/auth/me");

  return response.data;
}