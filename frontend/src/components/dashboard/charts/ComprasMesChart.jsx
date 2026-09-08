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

export default function ComprasMesChart({ lojaId }) {

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const response = await buscarComprasMes(
          lojaId
        );

        console.log("Compras por mês:", response);

        setDados(response);
      } catch (erro) {
        console.error("Erro ao carregar gráfico:", erro);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [lojaId]);

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

            <XAxis dataKey="mes" />

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