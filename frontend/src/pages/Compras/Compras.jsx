import { useEffect, useMemo, useState } from "react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControlLabel, MenuItem, Paper, Stack, Switch,
  Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, Tabs, TextField, Typography,
} from "@mui/material";

import api from "../../services/api";
import { buscarDepartamentos } from "../../services/departamentoService";

const filtrosIniciais = { busca: "", data_inicio: "", data_fim: "", departamento_id: "" };
const tamanhoPagina = 25;
const moedaBR = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const quantidadeBR = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });

const moeda = (valor) => valor == null ? "—" : moedaBR.format(valor);
const quantidade = (valor) => valor == null ? "—" : quantidadeBR.format(valor);
const dataBR = (valor) => valor ? valor.split("-").reverse().join("/") : "—";

function empresa(linha) {
  if (linha.loja) return [linha.loja, linha.unidade].filter(Boolean).join(" · ");
  return linha.empresa_codigo == null ? "Sem empresa informada" : `Empresa ${linha.empresa_codigo}`;
}

function DetalhesNota({ entradaId, fechar }) {
  const [consulta, setConsulta] = useState(null);

  useEffect(() => {
    const controle = new AbortController();

    api.get(`/compras/notas/${entradaId}`, { signal: controle.signal })
      .then(({ data }) => setConsulta({ nota: data }))
      .catch(() => {
        if (!controle.signal.aborted) setConsulta({ erro: true });
      });

    return () => controle.abort();
  }, [entradaId]);

  const nota = consulta?.nota;
  return (
    <Dialog open onClose={fechar} fullWidth maxWidth="md">
      <DialogTitle>{nota ? `Nota fiscal ${nota.nota || "sem número"}` : "Nota fiscal"}</DialogTitle>
      <DialogContent dividers>
        {!consulta && <CircularProgress size={24} aria-label="Carregando nota fiscal" />}
        {consulta?.erro && <Alert severity="error">Não foi possível carregar a nota fiscal.</Alert>}
        {nota && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {empresa(nota)} · {nota.fornecedor || "Sem fornecedor informado"} · {dataBR(nota.data)}
            </Typography>
            <Typography fontWeight={650}>Valor de todos os itens registrados: {moeda(nota.valor)}</Typography>
            {nota.itens.length === 0 ? (
              <Typography variant="body2">Esta nota não tem itens registrados.</Typography>
            ) : (
              <TableContainer>
                <Table size="small" aria-label="Itens da nota fiscal">
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Custo unitário</TableCell>
                      <TableCell align="right">Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nota.itens.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.codigo || "—"}</TableCell>
                        <TableCell>{item.produto || "—"}</TableCell>
                        <TableCell align="right">{quantidade(item.quantidade)}</TableCell>
                        <TableCell align="right">{moeda(item.custo)}</TableCell>
                        <TableCell align="right">{moeda(item.valor)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions><Button onClick={fechar}>Fechar</Button></DialogActions>
    </Dialog>
  );
}

function colunasDaVisao(visao, abrirNota, abrirDepartamento) {
  const valor = { nome: "Valor no recorte", numero: true, render: (linha) => moeda(linha.valor) };
  const notas = { nome: "Notas", numero: true, render: (linha) => quantidade(linha.notas) };
  const itens = { nome: "Itens", numero: true, render: (linha) => quantidade(linha.itens) };
  const colunaEmpresa = { nome: "Empresa", render: empresa };
  switch (visao) {
    case "produtos":
      return [
        { nome: "Código", render: (linha) => linha.codigo || "—" },
        { nome: "Produto", render: (linha) => linha.produto || "—" },
        { nome: "Quantidade", numero: true, render: (linha) => quantidade(linha.quantidade) },
        { nome: "Custo médio", numero: true, render: (linha) => moeda(linha.custo_medio) },
        valor,
      ];
    case "empresas":
      return [
        colunaEmpresa,
        notas,
        { nome: "Fornecedores", numero: true, render: (linha) => quantidade(linha.fornecedores) },
        valor,
      ];
    case "departamentos":
      return [
        { nome: "Departamento", render: (linha) => (
          <Button
            size="small"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => abrirDepartamento(linha.departamento_id ?? 0)}
            sx={{ textTransform: "none", textAlign: "left" }}
          >
            {linha.departamento || "Sem departamento"}
          </Button>
        ) },
        { nome: "Produtos", numero: true, render: (linha) => quantidade(linha.produtos) },
        valor,
      ];
    case "compradores":
      return [{ nome: "Comprador", render: (linha) => linha.comprador }, notas, itens, valor];
    default:
      return [
        { nome: "Nota fiscal", render: (linha) => (
          <Button
            size="small"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => abrirNota(linha.entrada_id)}
            sx={{ textTransform: "none", whiteSpace: "nowrap" }}
          >
            {linha.nota || "Ver nota"}
          </Button>
        ) },
        { nome: "Entrada", render: (linha) => dataBR(linha.data) },
        colunaEmpresa,
        { nome: "Fornecedor", render: (linha) => linha.fornecedor || "—" },
        itens,
        valor,
      ];
  }
}

export default function Compras() {
  const [loja, setLoja] = useState(() => JSON.parse(localStorage.getItem("lojaSelecionada")));
  const [todasLojas, setTodasLojas] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [falhaDepartamentos, setFalhaDepartamentos] = useState(false);
  const [campos, setCampos] = useState(filtrosIniciais);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [visao, setVisao] = useState("notas");
  const [pagina, setPagina] = useState(0);
  const [consulta, setConsulta] = useState(null);
  const [notaAberta, setNotaAberta] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  const lojaId = todasLojas ? undefined : loja?.id;

  useEffect(() => {
    function atualizarLoja(evento) {
      setLoja(evento.detail);
      setTodasLojas(false);
      setPagina(0);
      setNotaAberta(null);
    }
    window.addEventListener("lojaSelecionadaAlterada", atualizarLoja);
    return () => window.removeEventListener("lojaSelecionadaAlterada", atualizarLoja);
  }, []);

  useEffect(() => {
    let ativa = true;
    buscarDepartamentos()
      .then((dados) => { if (ativa) setDepartamentos(dados); })
      .catch(() => { if (ativa) setFalhaDepartamentos(true); });
    return () => { ativa = false; };
  }, []);

  const requisicao = useMemo(() => ({
    tentativa,
    params: {
      visao,
      pagina: pagina + 1,
      por_pagina: tamanhoPagina,
      loja_id: lojaId,
      departamento_id: filtros.departamento_id === "" ? undefined : filtros.departamento_id,
      busca: filtros.busca.trim() || undefined,
      data_inicio: filtros.data_inicio || undefined,
      data_fim: filtros.data_fim || undefined,
    },
  }), [tentativa, visao, pagina, lojaId, filtros]);

  useEffect(() => {
    const controle = new AbortController();
    api.get("/compras", { params: requisicao.params, signal: controle.signal })
      .then(({ data }) => setConsulta({ requisicao, data }))
      .catch((falha) => {
        if (controle.signal.aborted) return;
        const detalhe = falha.response?.data?.detail;
        setConsulta({
          requisicao,
          erro: typeof detalhe === "string" ? detalhe : "Não foi possível consultar as compras.",
        });
      });
    return () => controle.abort();
  }, [requisicao]);

  const resposta = consulta?.requisicao === requisicao ? consulta : null;
  const dados = resposta?.data;
  const dataInvalida = campos.data_inicio && campos.data_fim && campos.data_inicio > campos.data_fim;

  function alterarCampo(campo, valor) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }));
  }

  function aplicarFiltros(evento) {
    evento.preventDefault();
    if (dataInvalida) return;
    setFiltros(campos);
    setPagina(0);
  }

  function abrirDepartamento(id) {
    alterarCampo("departamento_id", id);
    setFiltros((atuais) => ({ ...atuais, departamento_id: id }));
    setVisao("produtos");
    setPagina(0);
  }

  const colunas = colunasDaVisao(visao, setNotaAberta, abrirDepartamento);

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 1360, mx: "auto" }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack component="form" spacing={2} onSubmit={aplicarFiltros}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ sm: 2 }} alignItems={{ sm: "center" }}>
            <FormControlLabel
              control={<Switch checked={todasLojas} onChange={(_, marcado) => {
                setTodasLojas(marcado);
                setPagina(0);
              }} />}
              label="Todas as lojas"
            />
            <Typography variant="body2" color="text.secondary">
              {!todasLojas && (loja ? empresa({ loja: loja.nome, unidade: loja.unidade }) : "Todas as lojas até selecionar uma no menu lateral")}
            </Typography>
          </Stack>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "2fr 1.3fr 1fr 1fr" },
            gap: 1.5,
          }}>
            <TextField
              label="Produto, nota ou fornecedor"
              size="small"
              value={campos.busca}
              onChange={(evento) => alterarCampo("busca", evento.target.value)}
              slotProps={{ htmlInput: { maxLength: 120 } }}
            />
            <TextField
              select
              label="Departamento"
              size="small"
              value={campos.departamento_id}
              onChange={(evento) => alterarCampo("departamento_id", evento.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value={0}>Sem departamento</MenuItem>
              {departamentos.map((departamento) => (
                <MenuItem key={departamento.id} value={departamento.id}>{departamento.descricao}</MenuItem>
              ))}
            </TextField>
            <TextField
              type="date" size="small" label="Data inicial" error={Boolean(dataInvalida)}
              slotProps={{ inputLabel: { shrink: true } }}
              value={campos.data_inicio}
              onChange={(evento) => alterarCampo("data_inicio", evento.target.value)}
            />
            <TextField
              type="date" size="small" label="Data final" error={Boolean(dataInvalida)}
              slotProps={{ inputLabel: { shrink: true } }}
              value={campos.data_fim}
              onChange={(evento) => alterarCampo("data_fim", evento.target.value)}
            />
          </Box>
          {dataInvalida && <Alert severity="warning">A data final deve ser igual ou posterior à inicial.</Alert>}
          {falhaDepartamentos && <Alert severity="warning">Não foi possível carregar os departamentos.</Alert>}
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button type="submit" variant="contained" startIcon={<SearchRoundedIcon />} disabled={Boolean(dataInvalida)}>
              Aplicar filtros
            </Button>
            <Button onClick={() => {
              setCampos(filtrosIniciais);
              setFiltros(filtrosIniciais);
              setPagina(0);
            }}>
              Limpar filtros
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {dados && (
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} useFlexGap flexWrap="wrap">
          <Chip label={`Valor comprado: ${moeda(dados.resumo.valor)}`} color="primary" />
          <Chip label={`${quantidade(dados.resumo.notas)} notas`} variant="outlined" />
          <Chip label={`${quantidade(dados.resumo.produtos)} produtos`} variant="outlined" />
          <Chip label={`${quantidade(dados.resumo.fornecedores)} fornecedores`} variant="outlined" />
          {(dados.periodo.inicio || dados.periodo.fim) && (
            <Chip
              label={dados.periodo.inicio && dados.periodo.fim
                ? `${dataBR(dados.periodo.inicio)} a ${dataBR(dados.periodo.fim)}`
                : dados.periodo.inicio ? `Desde ${dataBR(dados.periodo.inicio)}` : `Até ${dataBR(dados.periodo.fim)}`}
              variant="outlined"
            />
          )}
        </Stack>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, minWidth: 0 }}>
        <Tabs
          value={visao}
          onChange={(_, aba) => { setVisao(aba); setPagina(0); }}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Visões de compras"
          sx={{ px: 1, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab value="produtos" label="Produtos" />
          <Tab value="notas" label="Notas fiscais" />
          <Tab value="empresas" label="Empresas" />
          <Tab value="departamentos" label="Departamentos" />
          <Tab value="compradores" label="Compradores" />
        </Tabs>
        {visao === "compradores" && (
          <Alert severity="info" sx={{ m: 2 }}>
            O relatório de entradas usado na importação não informa o comprador. As compras aparecem em “Sem comprador informado”.
          </Alert>
        )}
        {!resposta && <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress size={24} aria-label="Carregando compras" /></Box>}
        {resposta?.erro && (
          <Alert
            severity="error"
            sx={{ m: 2 }}
            action={<Button color="inherit" size="small" onClick={() => setTentativa((atual) => atual + 1)}>Tentar novamente</Button>}
          >
            {resposta.erro}
          </Alert>
        )}
        {dados?.total === 0 && (
          <Typography sx={{ p: 3 }} color="text.secondary">Nenhuma compra encontrada para os filtros selecionados.</Typography>
        )}
        {dados?.total > 0 && (
          <>
            <TableContainer>
              <Table size="small" aria-label="Resultado da consulta de compras">
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow>
                    {colunas.map(({ nome, numero }) => (
                      <TableCell key={nome} align={numero ? "right" : "left"} sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>
                        {nome}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dados.registros.map((linha, posicao) => (
                    <TableRow key={posicao} hover>
                      {colunas.map(({ nome, numero, render }) => (
                        <TableCell
                          key={nome}
                          align={numero ? "right" : "left"}
                          sx={numero ? { whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } : undefined}
                        >
                          {render(linha)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {dados.total > tamanhoPagina && (
              <TablePagination
                component="div"
                count={dados.total}
                page={pagina}
                rowsPerPage={tamanhoPagina}
                rowsPerPageOptions={[]}
                onPageChange={(_, proxima) => setPagina(proxima)}
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                getItemAriaLabel={(tipo) => tipo === "previous" ? "Página anterior" : "Próxima página"}
              />
            )}
          </>
        )}
      </Paper>
      {notaAberta != null && <DetalhesNota key={notaAberta} entradaId={notaAberta} fechar={() => setNotaAberta(null)} />}
    </Stack>
  );
}
