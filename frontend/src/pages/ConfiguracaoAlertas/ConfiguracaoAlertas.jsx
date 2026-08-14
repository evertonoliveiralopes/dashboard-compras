import {
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControlLabel,
  Switch,
  Checkbox,
  TextField,
  Button,
  Divider,
  Box,
} from "@mui/material";

import { useEffect, useState } from "react";
import { buscarDepartamentos } from "../../services/departamentoService";

export default function ConfiguracaoAlertas() {
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentosSelecionados, setDepartamentosSelecionados] =
    useState([]);

  useEffect(() => {
    async function carregarDepartamentos() {
      try {
        const dados = await buscarDepartamentos();
        setDepartamentos(dados);
      } catch (error) {
        console.error("Erro ao carregar departamentos:", error);
      }
    }

    carregarDepartamentos();
  }, []);

  function selecionarDepartamento(departamentoId) {
    if (departamentosSelecionados.includes(departamentoId)) {
      setDepartamentosSelecionados(
        departamentosSelecionados.filter(
          (id) => id !== departamentoId
        )
      );
    } else {
      setDepartamentosSelecionados([
        ...departamentosSelecionados,
        departamentoId,
      ]);
    }
  }

  function selecionarTodos() {
    setDepartamentosSelecionados(
      departamentos.map((departamento) => departamento.id)
    );
  }

  function limparSelecao() {
    setDepartamentosSelecionados([]);
  }

  // Divide os departamentos em 4 colunas
  const colunas = [[], [], [], []];

  departamentos.forEach((departamento, index) => {
    colunas[index % 4].push(departamento);
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
      >
        Configuração de Alertas
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 1, mb: 3 }}
      >
        Defina quais indicadores o Compra360 deve monitorar.
      </Typography>

      <Grid container spacing={3}>

        {/* TIPOS DE ALERTA */}
        <Grid size={{ xs: 12 }}>
          <Card
            elevation={1}
            sx={{
              height: "100%",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>

              <Typography
                variant="h6"
                fontWeight="bold"
              >
                Tipos de Alertas
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* ALTERAÇÃO DE PREÇO */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Alteração de preço de compra"
                  sx={{ m: 0 }}
                />

                <TextField
                  size="small"
                  label="Variação mínima (%)"
                  defaultValue="10"
                  sx={{
                    width: 180,
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* ESTOQUE */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={<Switch />}
                  label="Estoque abaixo do mínimo"
                  sx={{ m: 0 }}
                />

                <TextField
                  size="small"
                  label="Quantidade mínima"
                  defaultValue="20"
                  sx={{
                    width: 180,
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* SEM MOVIMENTAÇÃO */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Produto sem movimentação"
                  sx={{ m: 0 }}
                />

                <TextField
                  size="small"
                  label="Dias sem venda"
                  defaultValue="30"
                  sx={{
                    width: 180,
                  }}
                />
              </Box>

            </CardContent>
          </Card>
        </Grid>

        {/* DEPARTAMENTOS */}
        <Grid size={{ xs: 12 }}>
          <Card
            elevation={1}
            sx={{
              height: "100%",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                  >
                    Departamentos Monitorados
                  </Typography>

                  <Typography
                    color="text.secondary"
                    variant="body2"
                    sx={{ mt: 0.5 }}
                  >
                    Escolha onde os alertas serão aplicados.
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    whiteSpace: "nowrap",
                    mt: 0.5,
                  }}
                >
                  {departamentosSelecionados.length} de{" "}
                  {departamentos.length}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* AÇÕES */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={selecionarTodos}
                >
                  Selecionar todos
                </Button>

                <Button
                  size="small"
                  variant="text"
                  onClick={limparSelecao}
                >
                  Limpar seleção
                </Button>
              </Box>

              {/* COLUNAS */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1fr 1fr",
                    lg: "repeat(4, 1fr)",
                  },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                {colunas.map((coluna, colunaIndex) => (
                  <Box
                    key={colunaIndex}
                    sx={{
                      p: 1,
                      minWidth: 0,
                      borderRight:
                        colunaIndex < 3
                          ? {
                              xs: "none",
                              lg: "1px solid",
                            }
                          : "none",
                      borderColor: "divider",
                    }}
                  >
                    {coluna.map((departamento) => (
                      <FormControlLabel
                        key={departamento.id}
                        control={
                          <Checkbox
                            size="small"
                            checked={departamentosSelecionados.includes(
                              departamento.id
                            )}
                            onChange={() =>
                              selecionarDepartamento(
                                departamento.id
                              )
                            }
                          />
                        }
                        label={departamento.descricao}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          m: 0,
                          width: "100%",

                          "& .MuiFormControlLabel-label": {
                            fontSize: "0.82rem",
                            lineHeight: 1.25,
                            paddingTop: "6px",
                          },
                        }}
                      />
                    ))}
                  </Box>
                ))}
              </Box>

            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* SALVAR */}
      <Button
        variant="contained"
        sx={{
          mt: 3,
          px: 3,
          borderRadius: 2,
        }}
      >
        Salvar Configurações
      </Button>
    </Paper>
  );
}