import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const dados = [
  {
    arquivo: "Produtos.csv",
    data: "30/07/2026 14:25",
    status: "Sucesso",
  },
  {
    arquivo: "Fornecedores.csv",
    data: "30/07/2026 13:48",
    status: "Sucesso",
  },
  {
    arquivo: "Entradas.xlsx",
    data: "29/07/2026 17:10",
    status: "Sucesso",
  },
];

export default function UltimasImportacoes() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
      }}
    >
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Últimas Importações
      </Typography>

      <List>
        {dados.map((item, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={item.arquivo}
              secondary={`${item.data} • ${item.status}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}