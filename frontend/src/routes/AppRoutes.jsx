import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/login/Login";
import SelecaoLoja from "../pages/SelecaoLoja/SelecaoLoja";
import Dashboard from "../pages/Dashboard/Dashboard";
import Compras from "../pages/Compras/Compras";
import Radar from "../pages/Radar/Radar";
import BusinessIntelligence from "../pages/BusinessIntelligence/BusinessIntelligence";
import Configuracoes from "../pages/Configuracoes/Configuracoes";
import MainLayout from "../layouts/MainLayout";
import Produtos from "../pages/Produtos/Produtos";
import Fornecedores from "../pages/Fornecedores/Fornecedores";
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


      <Route
        path="/compras"
        element={
          <PrivateRoute>
            <MainLayout>
              <Compras />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/business-intelligence"
        element={
          <PrivateRoute>
            <MainLayout>
              <BusinessIntelligence />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/radar"
        element={
          <PrivateRoute>
            <MainLayout>
              <Radar />
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Configuração de Alertas */}
      <Route
        path="/configuracoes/:secao?"
        element={
          <PrivateRoute>
            <MainLayout>
              <Configuracoes />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route path="/configuracao-alertas" element={<Navigate to="/configuracoes/alertas" replace />} />
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
      {/* Fornecedores */}
      <Route
        path="/fornecedores"
        element={
          <PrivateRoute>
            <MainLayout>
              <Fornecedores />
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
