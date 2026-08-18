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
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import { buscarProdutos } from "../../services/produtoService";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);

  const [busca, setBusca] = useState("");

  const [carregando, setCarregando] = useState(false);

  const [erro, setErro] = useState("");

  async function carregarProdutos() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await buscarProdutos({
        busca,
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
    carregarProdutos();
  }, []);

  function handleBuscar() {
    carregarProdutos();
  }

  return (
    <Box>

      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ mb: 3 }}
      >
        Produtos
      </Typography>

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