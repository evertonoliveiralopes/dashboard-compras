import { Grid, Box } from "@mui/material";

import KPICard from "./KPICard";

import ComprasMesChart from "./charts/ComprasMesChart";
import TopFornecedoresChart from "./charts/TopFornecedoresChart";
import ComprasDepartamentoChart from "./charts/ComprasDepartamentoChart";

import AlertasWidget from "./widgets/AlertasWidget";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PaidIcon from "@mui/icons-material/Paid";


function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}


function formatarNumero(valor) {
  return Number(valor || 0).toLocaleString(
    "pt-BR",
    {
      maximumFractionDigits: 3,
    }
  );
}


function formatarVariacao(valor) {
  const numero = Number(valor || 0);

  const sinal = numero > 0 ? "+" : "";

  return `${sinal}${numero.toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}%`;
}


export default function DashboardGrid({
  indicadores,
  lojaId,
  periodo,
  dataInicio,
  dataFim,
}) {
  const variacaoCompras =
    Number(indicadores.variacao_compras || 0);

  const variacaoVendas =
    Number(indicadores.variacao_vendas || 0);

  return (
    <>
      {/* KPIs */}
      <Grid container spacing={3}>

        <Grid size={{ xs: 12, md: 6, lg: 2 }}>
          <KPICard
            titulo="Valor Comprado"
            valor={formatarMoeda(
              indicadores.valor_comprado
            )}
            icone={
              <ShoppingCartIcon
                fontSize="large"
              />
            }
          />
        </Grid>


        <Grid size={{ xs: 12, md: 6, lg: 2 }}>
          <KPICard
            titulo="Variação Compras"
            valor={formatarVariacao(
              variacaoCompras
            )}
            icone={
              variacaoCompras >= 0 ? (
                <TrendingUpIcon
                  fontSize="large"
                />
              ) : (
                <TrendingDownIcon
                  fontSize="large"
                />
              )
            }
            cor={
              variacaoCompras >= 0
                ? "#2E7D32"
                : "#C62828"
            }
          />
        </Grid>


        <Grid size={{ xs: 12, md: 6, lg: 2 }}>
          <KPICard
            titulo="Quantidade Vendida"
            valor={formatarNumero(
              indicadores.quantidade_vendida
            )}
            icone={
              <PointOfSaleIcon
                fontSize="large"
              />
            }
            cor="#1565C0"
          />
        </Grid>


        <Grid size={{ xs: 12, md: 6, lg: 2 }}>
          <KPICard
            titulo="Variação Vendas"
            valor={formatarVariacao(
              variacaoVendas
            )}
            icone={
              variacaoVendas >= 0 ? (
                <TrendingUpIcon
                  fontSize="large"
                />
              ) : (
                <TrendingDownIcon
                  fontSize="large"
                />
              )
            }
            cor={
              variacaoVendas >= 0
                ? "#2E7D32"
                : "#C62828"
            }
          />
        </Grid>


        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <KPICard
            titulo="Valor em Estoque"
            valor={formatarMoeda(
              indicadores.valor_estoque
            )}
            icone={
              <PaidIcon
                fontSize="large"
              />
            }
            cor="#7B1FA2"
          />
        </Grid>

      </Grid>


      {/* Gráfico principal */}
      <Box sx={{ mt: 4 }}>
        <ComprasMesChart
          lojaId={lojaId}
          periodo={periodo}
          dataInicio={dataInicio}
          dataFim={dataFim}
        />
      </Box>


      {/* Segunda linha */}
      <Grid
        container
        spacing={3}
        sx={{ mt: 1 }}
      >

        <Grid size={{ xs: 12, lg: 6 }}>
          <TopFornecedoresChart
            lojaId={lojaId}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <AlertasWidget />
        </Grid>

      </Grid>


      {/* Terceira linha */}
      <Grid
        container
        spacing={3}
        sx={{ mt: 1 }}
      >

        <Grid size={{ xs: 12 }}>
          <ComprasDepartamentoChart
            lojaId={lojaId}
          />
        </Grid>

      </Grid>
    </>
  );
}