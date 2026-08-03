import { Box, Typography } from "@mui/material";

export default function DashboardHeader() {
  const loja = JSON.parse(localStorage.getItem("lojaSelecionada"));

  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight="bold">
          Dashboard Executivo
        </Typography>

        <Typography color="text.secondary">
          {loja?.nome} • {loja?.unidade}
        </Typography>
      </Box>

      <Typography color="text.secondary">
        Compra360 v1.0
      </Typography>
    </Box>
  );
}