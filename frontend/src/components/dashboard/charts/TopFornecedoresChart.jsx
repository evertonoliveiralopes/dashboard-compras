import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
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

import { buscarTopFornecedores } from "../../../services/dashboardChartService";


export default function TopFornecedoresChart() {
  const lojaSelecionada = JSON.parse(
    localStorage.getItem("lojaSelecionada")
  );

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const response = await buscarTopFornecedores(
          lojaSelecionada?.id
        );

        console.log("Top fornecedores:", response);

        setDados(response);

      } catch (erro) {
        console.error(
          "Erro ao carregar fornecedores:",
          erro
        );
      } finally {
        setLoading(false);
      }
    }

    carregarDados();

  }, []);


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
        Top Fornecedores por Compras
      </Typography>


      {dados.length === 0 ? (

        <Box
          sx={{
            height: 320,
            display: "flex",
            justifyContent: "center",
            alignAlignItems: "center",
          }}
        >
          <Typography color="text.secondary">
            Nenhum fornecedor encontrado.
          </Typography>
        </Box>

      ) : (

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <BarChart
            data={dados}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="fornecedor"
            />

            <YAxis />

            <Tooltip
              formatter={(value) =>
                value.toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  }
                )
              }
            />


            <Bar
              dataKey="valor"
              fill="#1565C0"
            />

          </BarChart>

        </ResponsiveContainer>

      )}

    </Paper>
  );
}