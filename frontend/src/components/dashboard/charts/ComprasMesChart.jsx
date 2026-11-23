import { Box, Typography } from "@mui/material";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { moedaBR } from "../formatacao";

const nomeMes = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit", timeZone: "UTC" });
const escalaBR = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

export default function ComprasMesChart({ itens }) {
  const dados = itens.map((item) => ({
    ...item, mesLabel: nomeMes.format(new Date(Date.UTC(item.ano, item.mes - 1, 1))),
  }));

  if (dados.length === 1) {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 1.5,
        bgcolor: "#F4F7FB", p: 1.5, borderRadius: 1.5 }}>
        <Box>
          <Typography variant="body2" fontWeight={700} sx={{ textTransform: "capitalize" }}>{dados[0].mesLabel}</Typography>
          <Typography variant="caption" color="text.secondary">Um mês com registros no período</Typography>
        </Box>
        <Typography variant="subtitle1" fontWeight={700} color="#142742">{moedaBR(dados[0].valor)}</Typography>
      </Box>
    );
  }

  return (
    <Box role="group" aria-label="Evolução mensal do valor comprado" sx={{ minWidth: 0 }}>
      <ResponsiveContainer width="100%" height={220} minWidth={0} initialDimension={{ width: 320, height: 220 }}>
        <AreaChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 2 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="#E4EBF4" />
          <XAxis dataKey="mesLabel" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#53647A" }} tickMargin={8} />
          <YAxis width={58} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#53647A" }}
            tickFormatter={(valor) => escalaBR.format(valor)} />
          <Tooltip formatter={(valor) => [moedaBR(valor), "Compras"]} />
          <Area dataKey="valor" type="monotone" stroke="#286DBC" strokeWidth={2} fill="#E8F2FF" dot={{ r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
