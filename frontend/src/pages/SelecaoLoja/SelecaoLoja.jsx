import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  Button,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import StoreIcon from "@mui/icons-material/Store";
import logo from "../../assets/images/compra360-logo.png";
import { buscarLojas } from "../../services/lojaService";





export default function SelecaoLoja() {
  const navigate = useNavigate();

  const [lojas, setLojas] = useState([]);
  const [lojaSelecionada, setLojaSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarLojas() {
      try {
        const dados = await buscarLojas();
        setLojas(dados);
      } catch (erro) {
        console.error("Erro ao carregar lojas:", erro);
      } finally {
        setLoading(false);
      }
    }

    carregarLojas();
  }, []);

  const continuar = () => {
    if (!lojaSelecionada) return;

    localStorage.setItem(
      "lojaSelecionada",
      JSON.stringify(lojaSelecionada)
    );

    navigate("/dashboard");

    // Próxima etapa:
    // navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F5F7FA",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 700,
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            mb: 5,
          }}
        >
          <img
            src={logo}
            alt="Compra360"
            style={{
              width: 280,
              maxWidth: "100%",
            }}
          />

          <Typography
            variant="h5"
            sx={{
              mt: 3,
              fontWeight: 600,
            }}
          >
            Selecione a empresa
          </Typography>

          <Typography
            color="text.secondary"
          >
            Escolha a loja para iniciar o sistema.
          </Typography>
        </Box>

        <Stack spacing={2}>
          {loading ? (
            <Typography
              color="text.secondary"
              textAlign="center"
            >
              Carregando lojas...
            </Typography>
          ) : (
            lojas.map((loja) => (
            <Card
              key={loja.id}
              elevation={0}
              sx={{
                border:
                  lojaSelecionada?.id === loja.id
                    ? "2px solid #1565C0"
                    : "1px solid #E0E0E0",

                borderRadius: 3,

                transition: ".25s",

                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea
                onClick={() =>
                  setLojaSelecionada(loja)
                }
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    alignItems: "center",
                    p: 3,
                  }}
                >
                  <StoreIcon
                    sx={{
                      fontSize: 40,
                      color: "#1565C0",
                    }}
                  />

                  <Box>
                    <Typography
                      fontWeight={700}
                    >
                      {loja.nome}
                    </Typography>

                    <Typography
                      color="text.secondary"
                    >
                      {loja.unidade}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Código: {loja.codigo}
                    </Typography>
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
            ))
          )}
        </Stack>

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{
            mt: 4,
            height: 52,
            borderRadius: 3,
          }}
          disabled={!lojaSelecionada}
          onClick={continuar}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );
}