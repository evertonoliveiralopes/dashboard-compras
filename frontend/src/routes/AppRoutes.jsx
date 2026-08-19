import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import SelecaoLoja from "../pages/SelecaoLoja/SelecaoLoja";
import Dashboard from "../pages/Dashboard/Dashboard";
import ConfiguracaoAlertas from "../pages/ConfiguracaoAlertas/ConfiguracaoAlertas";
import MainLayout from "../layouts/MainLayout";
import Produtos from "../pages/Produtos/Produtos";
import Importacoes from "../pages/Importacoes/Importacoes";

import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Login */}
      <Route
        path="/"
        element={<Login />}
      />


      {/* Seleção de Loja */}
      <Route
        path="/lojas"
        element={
          <PrivateRoute>
            <SelecaoLoja />
          </PrivateRoute>
        }
      />


      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />


      {/* Configuração de Alertas */}
      <Route
        path="/configuracao-alertas"
        element={
          <PrivateRoute>
            <MainLayout>
              <ConfiguracaoAlertas />
            </MainLayout>
          </PrivateRoute>
        }
      />
      {/* Produtos */}
      <Route
        path="/produtos"
        element={
          <PrivateRoute>
            <MainLayout>
              <Produtos />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/importacoes"
        element={
          <PrivateRoute>
            <MainLayout>
              <Importacoes />
            </MainLayout>
          </PrivateRoute>
        }
      />
      
      {/* Rota não encontrada */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}