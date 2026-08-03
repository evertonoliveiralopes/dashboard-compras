import { Paper, Typography } from "@mui/material";

export default function AlertasWidget() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        height: "100%",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        mb={2}
      >
        Alertas
      </Typography>

      <Typography color="text.secondary">
        Nenhum alerta encontrado.
      </Typography>
    </Paper>
  );
}