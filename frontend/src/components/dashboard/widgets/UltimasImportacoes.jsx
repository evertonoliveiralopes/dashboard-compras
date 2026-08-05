import { useEffect, useState } from "react";

import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Chip,
  Stack,
} from "@mui/material";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CategoryIcon from "@mui/icons-material/Category";

import { buscarUltimasImportacoes } from "../../../services/dashboardService";

export default function UltimasImportacoes() {

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function carregarDados() {

      try {

        const response = await buscarUltimasImportacoes();

        console.log("Últimas importações:", response);

        setDados(response);

      } catch (erro) {

        console.error(
          "Erro ao buscar importações:",
          erro
        );

      } finally {

        setLoading(false);

      }

    }

    carregarDados();

  }, []);

  function obterIcone(tipo) {

    switch (tipo?.toLowerCase()) {

      case "produtos":
        return <Inventory2Icon color="primary" />;

      case "fornecedores":
        return <LocalShippingIcon color="success" />;

      case "entradas":
        return <ReceiptLongIcon color="warning" />;

      case "departamentos":
        return <CategoryIcon color="secondary" />;

      default:
        return <ReceiptLongIcon />;

    }

  }

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 250,
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        mb={2}
      >
        Últimas Importações
      </Typography>

      {dados.length === 0 ? (

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Typography color="text.secondary">
            Nenhuma importação encontrada.
          </Typography>
        </Box>

      ) : (

        <List>

          {dados.map((item) => (

            <ListItem
              key={item.id}
              divider
            >

              <Box
                sx={{
                  mr: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {obterIcone(item.tipo)}
              </Box>

              <ListItemText
                primary={
                  <Typography fontWeight="bold">
                    {item.tipo}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2">
                      {item.arquivo}
                    </Typography>

                    <Typography
                      variant="caption"
                      display="block"
                    >
                      {item.registros.toLocaleString("pt-BR")} registros
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {new Date(item.criado_em).toLocaleString("pt-BR")}
                    </Typography>
                  </>
                }
              />

              <Stack>
                <Chip
                  label={item.status}
                  color={item.status === "SUCESSO" ? "success" : "error"}
                  size="small"
                />
              </Stack>

            </ListItem>

          ))}

        </List>

      )}

    </Paper>
  );

}