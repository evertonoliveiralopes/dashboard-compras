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
  Chip,
  TablePagination,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import { buscarProdutos } from "../../services/produtoService";
import { buscarDepartamentos } from "../../services/departamentoService";

export default function Produtos() {
  const [lojaSelecionada, setLojaSelecionada] = useState(() => {
    const loja = localStorage.getItem("lojaSelecionada");

    return loja ? JSON.parse(loja) : null;
  });

  const [produtos, setProdutos] = useState([]);

  const [busca, setBusca] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [erro, setErro] = useState("");
  const [ordem, setOrdem] = useState("asc");
  const [colunaOrdenacao, setColunaOrdenacao] = useState("descricao");
  const [pagina, setPagina] = useState(0);
  const [linhasPorPagina, setLinhasPorPagina] = useState(50);
  const [totalProdutos, setTotalProdutos] = useState(0);

  useEffect(() => {
    const atualizarLoja = (evento) => {
      setLojaSelecionada(evento.detail);
    };

    window.addEventListener(
      "lojaSelecionadaAlterada",
      atualizarLoja
    );

    return () => {
      window.removeEventListener(
        "lojaSelecionadaAlterada",
        atualizarLoja
      );
    };
  }, []);

  async function carregarProdutos(
    filtros = {
      busca,
      departamento: departamentoSelecionado,
      status: statusSelecionado,
    },
    novaPagina = pagina,
    novoLimite = linhasPorPagina
  ) {
    try {
      setCarregando(true);
      setErro("");

      const dados = await buscarProdutos({
        busca: filtros.busca,
        departamento: filtros.departamento,
        status: filtros.status,
        offset: novaPagina * novoLimite,
        limit: novoLimite,
        lojaId: lojaSelecionada?.id,
      });

      setProdutos(dados.items);
      setTotalProdutos(dados.total);
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
  }, []);

  useEffect(() => {
    if (lojaSelecionada?.id) {
      setPagina(0);
      carregarProdutos(
        {
          busca,
          departamento: departamentoSelecionado,
          status: statusSelecionado,
        },
        0,
        linhasPorPagina
      );
    }
  }, [lojaSelecionada]);

  function handleBuscar() {
    setPagina(0);
    carregarProdutos();
  }
  function obterDescricaoDepartamento(codigo) {
    const departamento = departamentos.find(
      (item) => String(item.codigo) === String(codigo)
    );

    return departamento?.descricao || codigo;
  }

  function ordenarProdutos(lista) {
    return [...lista].sort((a, b) => {
      let valorA = a[colunaOrdenacao];
      let valorB = b[colunaOrdenacao];

      if (colunaOrdenacao === "departamento") {
        const departamentoA = departamentos.find(
          (item) =>
            String(item.codigo) === String(a.departamento)
        );

        const departamentoB = departamentos.find(
          (item) =>
            String(item.codigo) === String(b.departamento)
        );

        valorA = departamentoA?.descricao || "";
        valorB = departamentoB?.descricao || "";
      }

      if (
        colunaOrdenacao === "custo" ||
        colunaOrdenacao === "preco_venda" ||
        colunaOrdenacao === "estoque" ||
        colunaOrdenacao === "estoque_trocas"
      ) {
        valorA = Number(valorA);
        valorB = Number(valorB);
      }

      if (typeof valorA === "string") {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      if (valorA < valorB) {
        return ordem === "asc" ? -1 : 1;
      }

      if (valorA > valorB) {
        return ordem === "asc" ? 1 : -1;
      }

      return 0;
    });
  }

  function alterarOrdenacao(coluna) {
    if (colunaOrdenacao === coluna) {
      setOrdem(
        ordem === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setColunaOrdenacao(coluna);
      setOrdem("asc");
    }
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
            flexWrap: "wrap",
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
            sx={{ minWidth: { xs: "100%", sm: 250 }, flex: { sm: 1 }, }}
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
                  value={departamento.codigo}
                >
                  {departamento.descricao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 180 }, flex: { sm: 1 }, }}
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
                Todos os status
              </MenuItem>

              <MenuItem value="0">
                Liberado para venda
              </MenuItem>

              <MenuItem value="1">
                Bloqueado para compra
              </MenuItem>

              <MenuItem value="2">
                Bloqueado para venda PDV
              </MenuItem>

              <MenuItem value="3">
                Produto excluído
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleBuscar}
            sx={{
              height: 40,
              minWidth: { xs: 0, sm: 120 }, flex: { xs: 1, sm: "initial" }, 
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
              setPagina(0);

              carregarProdutos(
                {
                  busca: "",
                  departamento: "",
                  status: "",
                },
                0,
                linhasPorPagina
              );
            }}
            sx={{
              height: 40,
              minWidth: { xs: 0, sm: 120 }, flex: { xs: 1, sm: "initial" },
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

                <TableCell
                  onClick={() => alterarOrdenacao("codigo")}
                  sx={{ cursor: "pointer" }}
                >
                  <strong>
                    Código{" "}
                    {colunaOrdenacao === "codigo" &&
                      (ordem === "asc" ? "↑" : "↓")}
                  </strong>
                </TableCell>

                <TableCell
                  onClick={() => alterarOrdenacao("descricao")}
                  sx={{ cursor: "pointer" }}
                >
                  <strong>
                    Descrição{" "}
                    {colunaOrdenacao === "descricao" &&
                      (ordem === "asc" ? "↑" : "↓")}
                  </strong>
                </TableCell>

                <TableCell
                  onClick={() => alterarOrdenacao("departamento")}
                  sx={{ cursor: "pointer" }}
                >
                  <strong>
                    Departamento{" "}
                    {colunaOrdenacao === "departamento" &&
                      (ordem === "asc" ? "↑" : "↓")}
                  </strong>
                </TableCell>

                <TableCell
                  align="right"
                  onClick={() => alterarOrdenacao("custo")}
                  sx={{ cursor: "pointer" }}
                >
                  <strong>
                    Custo{" "}
                    {colunaOrdenacao === "custo" &&
                      (ordem === "asc" ? "↑" : "↓")}
                  </strong>
                </TableCell>

                <TableCell
                  align="right"
                  onClick={() => alterarOrdenacao("preco_venda")}
                  sx={{ cursor: "pointer" }}
                >
                  <strong>
                    Preço Venda{" "}
                    {colunaOrdenacao === "preco_venda" &&
                      (ordem === "asc" ? "↑" : "↓")}
                  </strong>
                </TableCell>

                <TableCell
                  align="right"
                  onClick={() => alterarOrdenacao("estoque")}
                  sx={{ cursor: "pointer" }}
                >
                  <strong>
                    Estoque{" "}
                    {colunaOrdenacao === "estoque" &&
                      (ordem === "asc" ? "↑" : "↓")}
                  </strong>
                </TableCell>

                <TableCell
                  align="right"
                  onClick={() => alterarOrdenacao("estoque_trocas")}
                  sx={{ cursor: "pointer" }}
                >
                  <strong>
                    Estoque Trocas{" "}
                    {colunaOrdenacao === "estoque_trocas" &&
                      (ordem === "asc" ? "↑" : "↓")}
                  </strong>
                </TableCell>

                <TableCell
                  align="center"
                  onClick={() => alterarOrdenacao("status")}
                  sx={{ cursor: "pointer" }}
                >
                  <strong>
                    Status{" "}
                    {colunaOrdenacao === "status" &&
                      (ordem === "asc" ? "↑" : "↓")}
                  </strong>
                </TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {carregando ? (

                <TableRow>

                  <TableCell
                    colSpan={8}
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
                    colSpan={8}
                    align="center"
                  >

                    Nenhum produto encontrado.

                  </TableCell>

                </TableRow>

              ) : (

                ordenarProdutos(produtos).map((produto) => (

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
                      {obterDescricaoDepartamento(produto.departamento)}
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
                    <TableCell align="right">
                      {Number(
                        produto.estoque_trocas
                      ).toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 3,
                        }
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={
                          produto.status === 0
                            ? "Liberado para venda"
                            : produto.status === 1
                            ? "Bloqueado para compra"
                            : produto.status === 2
                            ? "Bloqueado para venda/PDV"
                            : produto.status === 3
                            ? "Produto excluído"
                            : "Status desconhecido"
                        }
                        size="small"
                        color={
                          produto.status === 0
                            ? "success"
                            : produto.status === 3
                            ? "error"
                            : "warning"
                        }
                      />
                    </TableCell>

                  </TableRow>

                ))

              )}

            </TableBody>

          </Table>

        </TableContainer>
        <TablePagination
          component="div"
          count={totalProdutos}
          page={pagina}
          onPageChange={(event, novaPagina) => {
            setPagina(novaPagina);

            carregarProdutos(
              {
                busca,
                departamento: departamentoSelecionado,
                status: statusSelecionado,
              },
              novaPagina,
              linhasPorPagina
            );
          }}
          rowsPerPage={linhasPorPagina}
          onRowsPerPageChange={(event) => {
            const novoLimite = parseInt(event.target.value, 10);

            setLinhasPorPagina(novoLimite);
            setPagina(0);

            carregarProdutos(
              {
                busca,
                departamento: departamentoSelecionado,
                status: statusSelecionado,
              },
              0,
              novoLimite
            );
          }}
          rowsPerPageOptions={[25, 50, 100]}
          labelRowsPerPage="Produtos por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </Paper>

    </Box>
  );
}