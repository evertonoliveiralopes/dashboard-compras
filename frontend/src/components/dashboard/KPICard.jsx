import { Box, Paper, Skeleton, Stack, Typography } from "@mui/material";

export default function KPICard({ titulo, valor, icone, detalhe, principal = false, carregando = false }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.75, sm: 2 }, minWidth: 0, borderRadius: 2.5,
      bgcolor: principal ? "#F7FAFF" : "background.paper", borderColor: principal ? "#C8DCF5" : "divider" }}>
      <Stack spacing={1} sx={{ height: "100%" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box aria-hidden="true" sx={{ display: "grid", placeItems: "center", flexShrink: 0, width: 29, height: 29,
            borderRadius: 1.25, bgcolor: principal ? "#E3EEFC" : "#EFF3F7", color: principal ? "primary.main" : "#50637D" }}>
            {icone}
          </Box>
          <Typography variant="body2" component="h2" fontWeight={650} color="text.secondary">{titulo}</Typography>
        </Stack>
        {carregando ? <Skeleton width="75%" height={34} /> : (
          <Typography component="p" sx={{ color: "#142742", fontWeight: 700, fontSize: { xs: 23, md: 24, xl: 28 },
            letterSpacing: "-0.025em", lineHeight: 1.22, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>
            {valor}
          </Typography>
        )}
        {carregando ? <Skeleton width="55%" /> : (
          <Typography variant="caption" component="p" color="text.secondary">{detalhe}</Typography>
        )}
      </Stack>
    </Paper>
  );
}
