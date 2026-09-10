import { useEffect, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import { buscarFornecedores } from "../../services/fornecedorService";

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);

  const [busca, setBusca] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarFornecedores(
    filtros = {
      busca,
      cnpj,
      ativo: statusSelecionado,
    }
  ) {
    try {
      setCarregando(true);
      setErro("");

      const dados = await buscarFornecedores({
        busca: filtros.busca,
        cnpj: filtros.cnpj,
        ativo: filtros.ativo,
      });

      setFornecedores(dados.items);
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);

      setErro(
        "Não foi possível carregar os fornecedores."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarFornecedores();
  }, []);

  function handleBuscar() {
    carregarFornecedores();
  }

  function handleLimpar() {
    const filtros = {
      busca: "",
      cnpj: "",
      ativo: "",
    };

    setBusca("");
    setCnpj("");
    setStatusSelecionado("");

    carregarFornecedores(filtros);
  }

  return (
    <Box>

      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
        }}
      >

        <Typography
          variant="h6"
          sx={{ mb: 2 }}
        >
          Fornecedores
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >

          <TextField
            fullWidth
            size="small"
            label="Buscar fornecedor"
            placeholder="Código, razão social ou nome fantasia"
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleBuscar();
              }
            }}
            sx={{
              flex: { sm: 2 },
              minWidth: { xs: "100%", sm: 300 },
            }}
          />

          <TextField
            fullWidth
            size="small"
            label="CNPJ"
            placeholder="Digite o CNPJ"
            value={cnpj}
            onChange={(event) =>
              setCnpj(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleBuscar();
              }
            }}
            sx={{
              flex: { sm: 1 },
              minWidth: { xs: "100%", sm: 220 },
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: 180 },
              flex: { sm: 1 },
            }}
          >
            <InputLabel>Status</InputLabel>

            <Select
              value={statusSelecionado}
              label="Status"
              onChange={(event) =>
                setStatusSelecionado(event.target.value)
              }
            >
              <MenuItem value="">
                Todos
              </MenuItem>

              <MenuItem value="true">
                Ativos
              </MenuItem>

              <MenuItem value="false">
                Inativos
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleBuscar}
            disabled={carregando}
            sx={{
              minHeight: 40,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Buscar
          </Button>

          <Button
            variant="outlined"
            onClick={handleLimpar}
            disabled={carregando}
            sx={{
              minHeight: 40,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Limpar
          </Button>

        </Box>

        {carregando && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 3,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {erro && (
          <Typography
            color="error"
            sx={{ mt: 2 }}
          >
            {erro}
          </Typography>
        )}

        {!carregando && !erro && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              sx={{ mb: 2 }}
            >
              Fornecedores encontrados: {fornecedores.length}
            </Typography>

            <Box
              sx={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <Box
                component="table"
                sx={{
                  width: "100%",
                  minWidth: 1100,
                  borderCollapse: "collapse",
                }}
              >
                <Box component="thead">
                  <Box component="tr">
                    {[
                      "Código",
                      "Razão Social",
                      "Nome Fantasia",
                      "CNPJ",
                      "Telefone",
                      "E-mail",
                      "Status",
                    ].map((coluna) => (
                      <Box
                        component="th"
                        key={coluna}
                        sx={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}
                      >
                        {coluna}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box component="tbody">
                  {fornecedores.map((fornecedor) => (
                    <Box
                      component="tr"
                      key={fornecedor.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <Box
                        component="td"
                        sx={{
                          padding: "12px",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fornecedor.codigo}
                      </Box>

                      <Box
                        component="td"
                        sx={{
                          padding: "12px",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fornecedor.razao_social}
                      </Box>

                      <Box
                        component="td"
                        sx={{
                          padding: "12px",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fornecedor.nome_fantasia || "-"}
                      </Box>

                      <Box
                        component="td"
                        sx={{
                          padding: "12px",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fornecedor.cnpj || "-"}
                      </Box>

                      <Box
                        component="td"
                        sx={{
                          padding: "12px",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fornecedor.telefone || "-"}
                      </Box>

                      <Box
                        component="td"
                        sx={{
                          padding: "12px",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fornecedor.email || "-"}
                      </Box>

                      <Box
                        component="td"
                        sx={{
                          padding: "12px",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fornecedor.ativo ? "Ativo" : "Inativo"}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        )}

      </Paper>

    </Box>
  );
}
