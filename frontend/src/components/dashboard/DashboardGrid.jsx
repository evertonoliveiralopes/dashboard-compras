import { Box, Typography } from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";

import AnaliseCompras from "./AnaliseCompras";
import KPICard from "./KPICard";
import AlertasWidget from "./widgets/AlertasWidget";
import { formatarIntervalo, moedaBR, numeroBR, percentualBR } from "./formatacao";

export default function DashboardGrid({ indicadores, carregando, lojaId, periodo, dataInicio, dataFim, periodoPronto }) {
  const comCompras = indicadores?.itens_comprados > 0;
  const comVendas = indicadores?.dias_vendas > 0;
  const comEstoque = indicadores?.produtos_estoque > 0;
  const comparavel = comCompras && indicadores.valor_comprado_anterior > 0;
  const datas = indicadores?.periodo;

  let detalheCompras = "Sem entradas no período";
  if (comparavel) {
    detalheCompras = (
      <>
        <Typography component="span" variant="inherit" fontWeight={700} color="#254E82">
          {percentualBR(indicadores.variacao_compras / 100)}
        </Typography>
        {" vs. " + formatarIntervalo(datas.data_inicio_anterior, datas.data_fim_anterior)}
      </>
    );
  } else if (comCompras) {
    detalheCompras = "Sem base de comparação no período anterior";
  }

  return (
    <>
      <Box component="section" aria-label="Indicadores da loja" sx={{ display: "grid", gap: 1.5,
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(3, minmax(0, 1fr))" } }}>
        <KPICard titulo="Compras no período" valor={comCompras ? moedaBR(indicadores.valor_comprado) : "—"}
          icone={<ShoppingCartOutlinedIcon fontSize="small" />} principal carregando={carregando}
          detalhe={indicadores ? detalheCompras : "Período sem consulta"} />
        <KPICard titulo="Estoque atual a custo" valor={comEstoque ? moedaBR(indicadores.valor_estoque) : "—"}
          icone={<Inventory2OutlinedIcon fontSize="small" />} carregando={carregando}
          detalhe={comEstoque ? numeroBR(indicadores.produtos_estoque) + " produtos com posição cadastrada" : indicadores ? "Sem posição de estoque" : "Dados indisponíveis"} />
        <KPICard titulo="Quantidade vendida" valor={comVendas ? numeroBR(indicadores.quantidade_vendida) : "—"}
          icone={<PointOfSaleOutlinedIcon fontSize="small" />} carregando={carregando}
          detalhe={comVendas
            ? numeroBR(indicadores.dias_vendas) + " de " + numeroBR(indicadores.dias_periodo) + " dias com registros"
            : indicadores ? "Sem registros de vendas no período" : "Período sem consulta"} />
      </Box>
      <Box sx={{ display: "grid", alignItems: "stretch", gap: 2,
        gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1.12fr) minmax(0, 1fr)" } }}>
        <AlertasWidget lojaId={lojaId} />
        <AnaliseCompras lojaId={lojaId} periodo={periodo} dataInicio={dataInicio} dataFim={dataFim} periodoPronto={periodoPronto} />
      </Box>
    </>
  );
}
