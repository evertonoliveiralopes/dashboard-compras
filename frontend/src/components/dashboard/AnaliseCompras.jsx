import { useEffect, useState } from "react";
import { Alert, Box, Paper, Skeleton, Stack, Tab, Tabs, Typography } from "@mui/material";

import ComprasMesChart from "./charts/ComprasMesChart";
import { moedaBR } from "./formatacao";
import { buscarComprasDepartamento, buscarComprasMes, buscarTopFornecedores } from "../../services/dashboardChartService";

const abas = [
  { id: "fornecedores", titulo: "Fornecedores", campo: "fornecedor", buscar: buscarTopFornecedores },
  { id: "departamentos", titulo: "Departamentos", campo: "departamento", buscar: buscarComprasDepartamento },
  { id: "evolucao", titulo: "Evolução", buscar: buscarComprasMes },
];

function RankingCompras({ itens, campo }) {
  const maiorValor = Math.max(1, ...itens.map((item) => Math.abs(item.valor)));
  return (
    <Stack component="ol" spacing={1.5} sx={{ m: 0, p: 0, listStyle: "none", maxHeight: 322, overflowY: "auto" }}>
      {itens.map((item, indice) => (
        <Box component="li" key={item[campo] + "-" + indice} sx={{ minWidth: 0 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) max-content", alignItems: "start", gap: 1, mb: 0.5 }}>
            <Typography variant="body2" title={item[campo]} sx={{ overflowWrap: "anywhere", lineHeight: 1.4 }}>
              {item[campo]}
            </Typography>
            <Typography variant="body2" color="#142742" fontWeight={700} sx={{ fontVariantNumeric: "tabular-nums" }}>
              {moedaBR(item.valor)}
            </Typography>
          </Box>
          <Box aria-hidden="true" sx={{ height: 4, borderRadius: 5, overflow: "hidden", bgcolor: "#ECF1F7" }}>
            <Box sx={{ height: "100%", width: (Math.abs(item.valor) / maiorValor * 100) + "%",
              borderRadius: 5, bgcolor: item.valor < 0 ? "#C58232" : "#4788D2" }} />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

function AnaliseDoPeriodo({ aba, lojaId, periodo, dataInicio, dataFim }) {
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    aba.buscar(lojaId, periodo, dataInicio, dataFim, controller.signal).then((itens) => {
      if (!controller.signal.aborted) setResultado({ itens });
    }).catch(() => {
      if (!controller.signal.aborted) setResultado({ erro: true });
    });
    return () => controller.abort();
  }, [aba, lojaId, periodo, dataInicio, dataFim]);

  if (!resultado) return <Stack aria-label="Carregando análise de compras" spacing={1}>
    <Skeleton width="91%" /><Skeleton width="70%" /><Skeleton width="83%" />
  </Stack>;
  if (resultado.erro) return <Alert severity="error">Não foi possível carregar esta análise.</Alert>;
  if (!resultado.itens.length) {
    return <Typography variant="body2" color="text.secondary">Nenhum registro para esta análise no período.</Typography>;
  }
  return aba.campo ? <RankingCompras itens={resultado.itens} campo={aba.campo} /> : <ComprasMesChart itens={resultado.itens} />;
}

export default function AnaliseCompras({ lojaId, periodo, dataInicio, dataFim, periodoPronto }) {
  const [indice, setIndice] = useState(0);
  const aba = abas[indice];
  const chave = JSON.stringify([aba.id, lojaId, periodo, dataInicio, dataFim]);

  return (
    <Paper component="section" aria-labelledby="titulo-analise-compras" variant="outlined"
      sx={{ borderRadius: 2.5, p: { xs: 1.75, sm: 2 }, minWidth: 0 }}>
      <Typography component="h2" id="titulo-analise-compras" variant="h6" color="#142742" fontWeight={700}>
        Análise de compras
      </Typography>
      <Tabs value={indice} onChange={(_, valor) => setIndice(valor)} variant="fullWidth" aria-label="Análises de compras"
        sx={{ mt: 0.75, mb: 1.75, minHeight: 40, borderBottom: 1, borderColor: "divider", "& .MuiTab-root": {
          minHeight: 40, minWidth: 0, px: { xs: 0.25, sm: 1 }, fontSize: { xs: "0.73rem", sm: "0.8125rem" },
        } }}>
        {abas.map(({ id, titulo }) => <Tab key={id} id={"analise-aba-" + id} aria-controls={"analise-painel-" + id} label={titulo} />)}
      </Tabs>
      <Box role="tabpanel" id={"analise-painel-" + aba.id} aria-labelledby={"analise-aba-" + aba.id} tabIndex={0}>
        {periodoPronto ? <AnaliseDoPeriodo key={chave} aba={aba} lojaId={lojaId}
          periodo={periodo} dataInicio={dataInicio} dataFim={dataFim} />
          : <Typography variant="body2" color="text.secondary">Selecione um período para consultar os gastos.</Typography>}
      </Box>
    </Paper>
  );
}
