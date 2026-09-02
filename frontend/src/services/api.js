import axios from "axios";

const api = axios.create({
  baseURL: "https://compra360-backend-56786735553.southamerica-east1.run.app",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;