import { Box, Typography } from "@mui/material";

import SeletorLoja from "./SeletorLoja";

export default function DashboardHeader({
  lojaSelecionada,
  onChangeLoja,
}) {
  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight="bold">
          Dashboard Executivo
        </Typography>

        <Typography color="text.secondary">
          {lojaSelecionada?.nome} • {lojaSelecionada?.unidade}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <SeletorLoja
          lojaSelecionada={lojaSelecionada}
          onChange={onChangeLoja}
        />

        <Typography
          color="text.secondary"
          sx={{
            display: { xs: "none", md: "block" },
          }}
        >
          Compra360 v1.0
        </Typography>
      </Box>
    </Box>
  );
}
