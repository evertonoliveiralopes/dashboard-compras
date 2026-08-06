import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import SelecaoLoja from "../pages/SelecaoLoja/SelecaoLoja";
import Dashboard from "../pages/Dashboard/Dashboard";
import ConfiguracaoAlertas from "../pages/ConfiguracaoAlertas/ConfiguracaoAlertas";
import MainLayout from "../layouts/MainLayout";

import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
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
        path="/configuracao-alertas"
        element={
          <PrivateRoute>
            <MainLayout>
              <ConfiguracaoAlertas />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
      <Route
        path="/configuracao-alertas"
        element={<ConfiguracaoAlertas />}
      />

    </Routes>

    
  );
}