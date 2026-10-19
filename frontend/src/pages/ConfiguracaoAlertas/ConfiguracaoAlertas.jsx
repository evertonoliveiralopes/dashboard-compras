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

import { buscarConfiguracoesAlertas, salvarConfiguracoesAlertas, buscarTiposAlertas, salvarTiposAlertas,} from "../../services/configAlertaService";
import { useEffect, useState } from "react";
import { buscarDepartamentos } from "../../services/departamentoService";

import { buscarUsuarioAtual } from "../../services/authService";

export default function ConfiguracaoAlertas() {
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentosSelecionados, setDepartamentosSelecionados] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [tiposAlertas, setTiposAlertas] = useState({  
    alteracao_preco: true,  
    estoque_minimo: false,  
    sem_movimentacao: true,
    sem_movimentacao: true,
    percentual_alteracao_preco: 10,
    quantidade_minima_estoque: 20,
    dias_sem_venda: 30,
  });

 useEffect(() => {
    async function carregarTela() {
      try {
        const usuarioAtual = await buscarUsuarioAtual();

        setUsuario(usuarioAtual);

        const [listaDepartamentos, configuracoes, configuracaoTipos,] =
          await Promise.all([
            buscarDepartamentos(),
            buscarConfiguracoesAlertas(),
            buscarTiposAlertas(),
          ]);

        setDepartamentos(listaDepartamentos);
        setTiposAlertas(configuracaoTipos);

        const selecionados = configuracoes
          .filter((item) => item.ativo)
          .map((item) => item.departamento_id);

        setDepartamentosSelecionados(selecionados);

      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    }

    carregarTela();
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

  async function salvarConfiguracoes() {
    try {
      const percentual = Number(tiposAlertas.percentual_alteracao_preco);
      const estoque = Number(tiposAlertas.quantidade_minima_estoque);
      const dias = Number(tiposAlertas.dias_sem_venda);

      if (
        tiposAlertas.percentual_alteracao_preco === "" ||
        !Number.isFinite(percentual) ||
        percentual < 0 ||
        percentual > 100
      ) {
        alert("Informe uma variação de preço entre 0% e 100%.");
        return;
      }

      if (
        tiposAlertas.quantidade_minima_estoque === "" ||
        !Number.isFinite(estoque) ||
        estoque < 0
      ) {
        alert("Informe uma quantidade mínima de estoque válida.");
        return;
      }

      if (
        tiposAlertas.dias_sem_venda === "" ||
        !Number.isInteger(dias) ||
        dias < 1
      ) {
        alert("Informe um número inteiro de dias sem venda, a partir de 1.");
        return;
      }
      const payload = departamentos.map((departamento) => ({
        departamento_id: departamento.id,
        ativo: departamentosSelecionados.includes(
          departamento.id
        ),
      }));

      await salvarConfiguracoesAlertas(
        payload
      );

      await salvarTiposAlertas(
        tiposAlertas
      );

      alert("Configurações salvas com sucesso!");

    } catch (error) {
      console.error(error);
      alert("Erro ao salvar configurações.");
    }
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
                  control={<Switch
                              checked={tiposAlertas.alteracao_preco}
                              onChange={(event) =>
                                setTiposAlertas({
                                  ...tiposAlertas,
                                  alteracao_preco: event.target.checked,
                                })
                              }
                            />}
                  label="Alteração de preço de compra"
                  sx={{ m: 0 }}
                />

                <TextField
                  size="small"
                  label="Variação mínima (%)"
                  type="number"
                  value={tiposAlertas.percentual_alteracao_preco ?? ""}
                  onChange={(event) =>
                    setTiposAlertas((anterior) => ({
                      ...anterior,
                      percentual_alteracao_preco: event.target.value,
                    }))
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: 100,
                      step: 0.01,
                    },
                  }}
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
                  control={<Switch
                              checked={tiposAlertas.estoque_minimo}
                              onChange={(event) =>
                                setTiposAlertas({
                                  ...tiposAlertas,
                                  estoque_minimo: event.target.checked,
                                })
                              }
                            />}
                  label="Estoque abaixo do mínimo"
                  sx={{ m: 0 }}
                />

                <TextField
                  size="small"
                  label="Quantidade mínima"
                  type="number"
                  value={tiposAlertas.quantidade_minima_estoque ?? ""}
                  onChange={(event) =>
                    setTiposAlertas((anterior) => ({
                      ...anterior,
                      quantidade_minima_estoque: event.target.value,
                    }))
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: 0.001,
                    },
                  }}
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
                  control={<Switch
                              checked={tiposAlertas.sem_movimentacao}
                              onChange={(event) =>
                                setTiposAlertas({
                                  ...tiposAlertas,
                                  sem_movimentacao: event.target.checked,
                                })
                              }
                            />}
                  label="Produto sem movimentação"
                  sx={{ m: 0 }}
                />

                <TextField
                  size="small"
                  label="Dias sem venda"
                  type="number"
                  value={tiposAlertas.dias_sem_venda ?? ""}
                  onChange={(event) =>
                    setTiposAlertas((anterior) => ({
                      ...anterior,
                      dias_sem_venda: event.target.value,
                    }))
                  }
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      step: 1,
                    },
                  }}
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
        onClick={salvarConfiguracoes}
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