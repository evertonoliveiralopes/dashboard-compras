import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import SelecaoLoja from "../pages/SelecaoLoja/SelecaoLoja";
import Dashboard from "../pages/Dashboard/Dashboard";

import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
            path="/dashboard"
            element={
                <PrivateRoute>
                    <Dashboard />
                </PrivateRoute>
            }
        />

      <Route
        path="/lojas"
        element={
          <PrivateRoute>
            <SelecaoLoja />
          </PrivateRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}