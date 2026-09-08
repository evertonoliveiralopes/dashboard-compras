import { Grid, Box } from "@mui/material";

import KPICard from "./KPICard";

import ComprasMesChart from "./charts/ComprasMesChart";
import TopFornecedoresChart from "./charts/TopFornecedoresChart";
import ComprasDepartamentoChart from "./charts/ComprasDepartamentoChart";

import AlertasWidget from "./widgets/AlertasWidget";
import UltimasImportacoes from "./widgets/UltimasImportacoes";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaidIcon from "@mui/icons-material/Paid";


export default function DashboardGrid({ indicadores, lojaId }) {
  return (
    <>
      {/* KPIs */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <KPICard
            titulo="Compras"
            valor={indicadores.compras.toLocaleString("pt-BR")}
            icone={<ShoppingCartIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <KPICard
            titulo="Produtos"
            valor={indicadores.produtos.toLocaleString("pt-BR")}
            icone={<Inventory2Icon fontSize="large" />}
            cor="#2E7D32"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <KPICard
            titulo="Fornecedores"
            valor={indicadores.fornecedores.toLocaleString("pt-BR")}
            icone={<LocalShippingIcon fontSize="large" />}
            cor="#EF6C00"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <KPICard
            titulo="Valor em Estoque"
            valor={indicadores.estoque.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            icone={<PaidIcon fontSize="large" />}
            cor="#7B1FA2"
          />
        </Grid>
      </Grid>

      {/* Gráfico principal */}
      <Box sx={{ mt: 4 }}>
        <ComprasMesChart lojaId={lojaId} />
      </Box>

      {/* Segunda linha */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TopFornecedoresChart lojaId={lojaId} />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <AlertasWidget />
        </Grid>
      </Grid>
      
      {/* Terceira linha */}
        <Grid container spacing={3} sx={{ mt: 1 }}>

          <Grid size={{ xs: 12 }}>
            <ComprasDepartamentoChart lojaId={lojaId} />
          </Grid>

        </Grid>

      {/* quarta linha */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <UltimasImportacoes />
        </Grid>
      </Grid>
    </>
  );
}