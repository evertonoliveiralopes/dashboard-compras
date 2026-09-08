import { useEffect, useState } from "react";

import DashboardGrid from "../../components/dashboard/DashboardGrid";

import { Typography } from "@mui/material";

import { buscarIndicadores } from "../../services/dashboardService";

export default function Dashboard() {
  const [lojaSelecionada, setLojaSelecionada] = useState(() => {
    const loja = localStorage.getItem("lojaSelecionada");

    return loja ? JSON.parse(loja) : null;
  });

  const [indicadores, setIndicadores] = useState({
    compras: 0,
    produtos: 0,
    fornecedores: 0,
    estoque: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const atualizarLoja = (evento) => {
      setLojaSelecionada(evento.detail);
    };

    window.addEventListener(
      "lojaSelecionadaAlterada",
      atualizarLoja
    );

    return () => {
      window.removeEventListener(
        "lojaSelecionadaAlterada",
        atualizarLoja
      );
    };
  }, []);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);

        const dados = await buscarIndicadores(
          lojaSelecionada?.id
        );

        console.log("Indicadores:", dados);

        setIndicadores(dados);
      } catch (erro) {
        console.error("Erro ao buscar indicadores:", erro);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [lojaSelecionada]);

  if (loading) {
    return (
      <Typography>
        Carregando Dashboard...
      </Typography>
    );
  }

  return (
    <>
      <DashboardGrid
        indicadores={indicadores}
        lojaId={lojaSelecionada?.id}
      />
    </>
  );
}
