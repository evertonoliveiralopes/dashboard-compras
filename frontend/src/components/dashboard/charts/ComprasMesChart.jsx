import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  Paper,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";

import { buscarComprasMes } from "../../../services/dashboardChartService";

const NOMES_MESES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function formatarPeriodo(ano, mes) {
  const nomeMes = NOMES_MESES[Number(mes) - 1];
  const anoCurto = String(ano).slice(-2);

  return `${nomeMes}/${anoCurto}`;
}

export default function ComprasMesChart({
  lojaId,
  periodo,
  dataInicio,
  dataFim, 
}) {

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const response = await buscarComprasMes(
          lojaId,
          periodo,
          dataInicio,
          dataFim
        );

        console.log("Compras por mês:", response);

        setDados(
          response.map((item) => ({
            ...item,
            periodo: formatarPeriodo(
              item.ano,
              item.mes
            ),
          }))
        );
      } catch (erro) {
        console.error("Erro ao carregar gráfico:", erro);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [
    lojaId,
    periodo,
    dataInicio,
    dataFim,
  ]);

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          mt: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 320,
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        mt: 4,
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        mb={3}
      >
        Evolução das Compras
      </Typography>

      {dados.length === 0 ? (
        <Box
          sx={{
            height: 320,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography color="text.secondary">
            Nenhum dado encontrado.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={320}
        >
          <LineChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="periodo" />

            <YAxis
              tickFormatter={(value) =>
                value.toLocaleString("pt-BR")
              }
            />

            <Tooltip
              formatter={(value) =>
                value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              }
            />

            <Line
              type="monotone"
              dataKey="valor"
              stroke="#1565C0"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}