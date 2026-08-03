import { Card, CardContent, Typography, Box } from "@mui/material";

export default function KPICard({
  titulo,
  valor,
  icone,
  cor = "#1565C0",
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        transition: ".25s",

        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 10px 30px rgba(0,0,0,.08)",
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {titulo}
          </Typography>

          <Typography
            variant="h5"
            fontWeight="bold"
          >
            {valor}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: 3,
            bgcolor: `${cor}15`,
            color: cor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icone}
        </Box>
      </CardContent>
    </Card>
  );
}