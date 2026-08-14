import { useEffect, useState } from "react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardGrid from "../../components/dashboard/DashboardGrid";

import { Typography } from "@mui/material";

import { buscarIndicadores } from "../../services/dashboardService";

export default function Dashboard() {
  const [indicadores, setIndicadores] = useState({
    compras: 0,
    produtos: 0,
    fornecedores: 0,
    estoque: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarIndicadores();

        console.log("Indicadores:", dados);

        setIndicadores(dados);
      } catch (erro) {
        console.error("Erro ao buscar indicadores:", erro);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) {
    return (
      <Typography>
        Carregando Dashboard...
      </Typography>
    );
  }

  return (
    <>
      <DashboardHeader />

      <DashboardGrid indicadores={indicadores} />
    </>
  );
}