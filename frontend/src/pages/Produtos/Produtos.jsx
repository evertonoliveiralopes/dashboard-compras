import { useEffect, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import { buscarProdutos } from "../../services/produtoService";
import { buscarDepartamentos } from "../../services/departamentoService";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);

  const [busca, setBusca] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [erro, setErro] = useState("");

  async function carregarProdutos(
    filtros = {
      busca,
      departamento: departamentoSelecionado,
      status: statusSelecionado,
    }
  ) {
    try {
      setCarregando(true);
      setErro("");

      const dados = await buscarProdutos({
        busca: filtros.busca,
        departamento: filtros.departamento,
        status: filtros.status,
        offset: 0,
        limit: 50,
      });

      setProdutos(dados);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);

      setErro(
        "Não foi possível carregar os produtos."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    async function carregarDepartamentos() {
      try {
        const dados = await buscarDepartamentos();
        setDepartamentos(dados);
      } catch (error) {
        console.error("Erro ao buscar departamentos:", error);
      }
    }

    carregarDepartamentos();
    carregarProdutos();
  }, []);

  function handleBuscar() {
    carregarProdutos();
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

        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >

          <TextField
            fullWidth
            size="small"
            label="Buscar produto"
            placeholder="Código ou descrição"
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleBuscar();
              }
            }}
          />

          <FormControl
            size="small"
            sx={{ minWidth: 250 }}
          >
            <InputLabel>Departamento</InputLabel>

            <Select
              value={departamentoSelecionado}
              label="Departamento"
              onChange={(event) =>
                setDepartamentoSelecionado(event.target.value)
              }
            >
              <MenuItem value="">
                Todos os departamentos
              </MenuItem>

              {departamentos.map((departamento) => (
                <MenuItem
                  key={departamento.id}
                  value={departamento.id}
                >
                  {departamento.descricao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: 180 }}
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

              <MenuItem value="1">
                Ativo
              </MenuItem>

              <MenuItem value="0">
                Inativo
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleBuscar}
            sx={{
              height: 40,
              minWidth: 120,
            }}
          >
            Buscar
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              setBusca("");
              setDepartamentoSelecionado("");
              setStatusSelecionado("");

              carregarProdutos({
                busca: "",
                departamento: "",
                status: "",
              });
            }}
            sx={{
              height: 40,
              minWidth: 120,
            }}
          >
            Limpar
          </Button>

        </Box>

      </Paper>

      {erro && (
        <Typography
          color="error"
          sx={{ mb: 2 }}
        >
          {erro}
        </Typography>
      )}

      <Paper elevation={2}>

        <TableContainer>

          <Table>

            <TableHead>

              <TableRow>

                <TableCell>
                  <strong>Código</strong>
                </TableCell>

                <TableCell>
                  <strong>Descrição</strong>
                </TableCell>

                <TableCell>
                  <strong>Departamento</strong>
                </TableCell>

                <TableCell align="right">
                  <strong>Custo</strong>
                </TableCell>

                <TableCell align="right">
                  <strong>Preço Venda</strong>
                </TableCell>

                <TableCell align="right">
                  <strong>Estoque</strong>
                </TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {carregando ? (

                <TableRow>

                  <TableCell
                    colSpan={6}
                    align="center"
                  >

                    <CircularProgress
                      size={28}
                    />

                  </TableCell>

                </TableRow>

              ) : produtos.length === 0 ? (

                <TableRow>

                  <TableCell
                    colSpan={6}
                    align="center"
                  >

                    Nenhum produto encontrado.

                  </TableCell>

                </TableRow>

              ) : (

                produtos.map((produto) => (

                  <TableRow
                    key={produto.id}
                    hover
                  >

                    <TableCell>
                      {produto.codigo}
                    </TableCell>

                    <TableCell>
                      {produto.descricao}
                    </TableCell>

                    <TableCell>
                      {produto.departamento}
                    </TableCell>

                    <TableCell align="right">
                      R${" "}
                      {Number(
                        produto.custo
                      ).toFixed(2)}
                    </TableCell>

                    <TableCell align="right">
                      R${" "}
                      {Number(
                        produto.preco_venda
                      ).toFixed(2)}
                    </TableCell>

                    <TableCell align="right">
                      {Number(
                        produto.estoque
                      ).toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 3,
                        }
                      )}
                    </TableCell>

                  </TableRow>

                ))

              )}

            </TableBody>

          </Table>

        </TableContainer>

      </Paper>

    </Box>
  );
}