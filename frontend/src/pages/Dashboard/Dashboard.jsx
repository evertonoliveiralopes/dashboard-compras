import { useEffect, useState } from "react";

import DashboardGrid from "../../components/dashboard/DashboardGrid";

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import { buscarIndicadores } from "../../services/dashboardService";

export default function Dashboard() {
  const [lojaSelecionada, setLojaSelecionada] = useState(() => {
    const loja = localStorage.getItem("lojaSelecionada");

    return loja ? JSON.parse(loja) : null;
  });

  const [periodo, setPeriodo] = useState("mes");

  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);

  const [indicadores, setIndicadores] = useState({
    valor_comprado: 0,
    variacao_compras: 0,
    quantidade_vendida: 0,
    variacao_vendas: 0,
    valor_estoque: 0,
    periodo: null,
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
          lojaSelecionada?.id,
          periodo,
          dataInicio,
          dataFim
        );

        console.log("Indicadores:", dados);

        setIndicadores(dados);
      } catch (erro) {
        console.error(
          "Erro ao buscar indicadores:",
          erro
        );
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [
    lojaSelecionada,
    periodo,
    dataInicio,
    dataFim,
  ]);

  if (loading) {
    return (
      <Typography>
        Carregando Dashboard...
      </Typography>
    );
  }

  return (
    <>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <FormControl
          size="small"
          sx={{ minWidth: 180 }}
        >
          <InputLabel id="periodo-dashboard-label">
            Período
          </InputLabel>

          <Select
            labelId="periodo-dashboard-label"
            value={periodo}
            label="Período"
            onChange={(evento) => {
              setPeriodo(evento.target.value);
            }}
          >
            <MenuItem value="mes">
              Mês
            </MenuItem>

            <MenuItem value="3_meses">
              3 meses
            </MenuItem>

            <MenuItem value="6_meses">
              6 meses
            </MenuItem>

            <MenuItem value="12_meses">
              12 meses
            </MenuItem>

            <MenuItem value="personalizado">
              Personalizado
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      <DashboardGrid
        indicadores={indicadores}
        lojaId={lojaSelecionada?.id}
        periodo={periodo}
        dataInicio={dataInicio}
        dataFim={dataFim}
      />
    </>
  );
}