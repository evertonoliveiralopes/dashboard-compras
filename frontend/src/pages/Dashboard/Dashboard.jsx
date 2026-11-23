import { useEffect, useState } from "react";
import { Alert, Box, MenuItem, Stack, TextField, Typography } from "@mui/material";

import DashboardGrid from "../../components/dashboard/DashboardGrid";
import { formatarIntervalo } from "../../components/dashboard/formatacao";
import { buscarIndicadores } from "../../services/dashboardService";

const periodos = [
  { valor: "mes", rotulo: "Este mês" },
  { valor: "3_meses", rotulo: "3 meses" },
  { valor: "6_meses", rotulo: "6 meses" },
  { valor: "12_meses", rotulo: "12 meses" },
  { valor: "personalizado", rotulo: "Personalizado" },
];

export default function Dashboard() {
  const [lojaId, setLojaId] = useState(() => JSON.parse(localStorage.getItem("lojaSelecionada"))?.id);
  const [periodo, setPeriodo] = useState("mes");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [consulta, setConsulta] = useState(null);
  const personalizado = periodo === "personalizado";
  const datasInvertidas = Boolean(dataInicio && dataFim && dataInicio > dataFim);
  const periodoPronto = !personalizado || Boolean(dataInicio && dataFim && !datasInvertidas);
  const filtros = JSON.stringify([lojaId, periodo, dataInicio, dataFim]);

  useEffect(() => {
    const atualizarLoja = (evento) => setLojaId(evento.detail?.id);
    window.addEventListener("lojaSelecionadaAlterada", atualizarLoja);
    return () => window.removeEventListener("lojaSelecionadaAlterada", atualizarLoja);
  }, []);

  useEffect(() => {
    if (!lojaId || !periodoPronto) return;
    const controller = new AbortController();
    buscarIndicadores(lojaId, periodo, dataInicio, dataFim, controller.signal).then((indicadores) => {
      if (!controller.signal.aborted) setConsulta({ filtros, indicadores });
    }).catch(() => {
      if (!controller.signal.aborted) setConsulta({ filtros, erro: true });
    });
    return () => controller.abort();
  }, [lojaId, periodo, dataInicio, dataFim, filtros, periodoPronto]);

  const resultado = consulta?.filtros === filtros ? consulta : null;
  const datas = resultado?.indicadores?.periodo;
  const intervalo = periodoPronto && datas ? formatarIntervalo(datas.data_inicio, datas.data_fim) : "";

  return (
    <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ mx: "auto", maxWidth: 1640 }}>
      <Box component="header" sx={{ display: "flex", alignItems: { xs: "stretch", md: "center" },
        flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", gap: 1.5 }}>
        <Box>
          <Typography component="h1" variant="h4" sx={{ color: "#142742", fontSize: { xs: 25, md: 30 }, letterSpacing: "-0.035em" }}>
            Visão do comprador
          </Typography>
          {intervalo && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{intervalo}</Typography>}
        </Box>
        {lojaId && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, "& .MuiInputBase-root": { bgcolor: "background.paper" } }}>
            <TextField select size="small" label="Período" value={periodo} onChange={(evento) => setPeriodo(evento.target.value)}
              sx={{ minWidth: 160, flex: { xs: 1, md: "initial" } }}>
              {periodos.map(({ valor, rotulo }) => <MenuItem key={valor} value={valor}>{rotulo}</MenuItem>)}
            </TextField>
            {personalizado && (
              <>
                <TextField size="small" type="date" label="Data inicial" value={dataInicio}
                  onChange={(evento) => setDataInicio(evento.target.value)}
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: dataFim || undefined } }}
                  sx={{ flex: { xs: 1, md: "initial" }, minWidth: 145 }} />
                <TextField size="small" type="date" label="Data final" value={dataFim} error={datasInvertidas}
                  onChange={(evento) => setDataFim(evento.target.value)}
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: dataInicio || undefined } }}
                  sx={{ flex: { xs: 1, md: "initial" }, minWidth: 145 }} />
              </>
            )}
          </Box>
        )}
      </Box>
      {lojaId ? (
        <>
          {!periodoPronto && <Alert severity={datasInvertidas ? "warning" : "info"}>
            {datasInvertidas ? "A data final precisa ser igual ou posterior à inicial." : "Selecione as duas datas para consultar o período."}
          </Alert>}
          {resultado?.erro && <Alert severity="error">Não foi possível carregar os indicadores do período.</Alert>}
          <DashboardGrid indicadores={periodoPronto ? resultado?.indicadores : null}
            carregando={periodoPronto && !resultado} lojaId={lojaId} periodo={periodo}
            dataInicio={dataInicio} dataFim={dataFim} periodoPronto={periodoPronto} />
        </>
      ) : <Alert severity="info">Selecione uma loja no menu lateral para consultar o Dashboard.</Alert>}
    </Stack>
  );
}
