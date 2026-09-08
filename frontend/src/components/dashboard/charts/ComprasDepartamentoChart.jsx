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

import { buscarComprasDepartamento } from "../../../services/dashboardChartService";


export default function ComprasDepartamentoChart() {
  const lojaSelecionada = JSON.parse(
    localStorage.getItem("lojaSelecionada")
  );

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function carregarDados() {
      try {
        const response = await buscarComprasDepartamento(
          lojaSelecionada?.id
        );

        console.log(
          "Compras por departamento:",
          response
        );

        setDados(response);

      } catch (erro) {
        console.error(
          "Erro ao carregar departamentos:",
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
        Compras por Departamento
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
            Nenhum departamento encontrado.
          </Typography>
        </Box>

      ) : (

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <BarChart
            data={dados}
            layout="vertical"
            margin={{
              left: 40,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />


            <XAxis
              type="number"
            />


            <YAxis
              type="category"
              dataKey="departamento"
              width={150}
            />


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