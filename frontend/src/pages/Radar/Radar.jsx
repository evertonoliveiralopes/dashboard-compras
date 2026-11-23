import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  Alert, Box, Button, Chip, LinearProgress, MenuItem, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow,
  TextField, Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import api from "../../services/api";

const quantidade = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const dataImportacao = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" });
const horaConsulta = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", timeStyle: "short" });
const formatarData = (data) => data.split("-").reverse().join("/");
const normalizarBusca = (texto) => texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const saldo = { chave: "saldo", titulo: "Estoque atual", formato: quantidade.format };
const media = { chave: "media_diaria", titulo: "Venda por dia", formato: quantidade.format };
const categorias = {
  ruptura: {
    titulo: "Ruptura",
    criterio: "Produtos ativos com saldo zero ou negativo e vendas no período analisado.",
    cor: "error",
    Icone: WarningAmberRoundedIcon,
    resumo: (item) => `${quantidade.format(item.saldo)} em estoque`,
    colunas: [saldo, media],
  },
  reposicao: {
    titulo: "Reposição prioritária",
    criterio: "Produtos ativos com saldo positivo e cobertura de até 7 dias pela média diária de vendas.",
    cor: "warning",
    Icone: ShoppingCartOutlinedIcon,
    resumo: (item) => `${quantidade.format(item.cobertura)} dias de cobertura`,
    colunas: [saldo, media, { chave: "cobertura", titulo: "Cobertura (dias)", formato: quantidade.format }],
  },
  parado: {
    titulo: "Estoque parado",
    criterio: "Produtos ativos com saldo positivo cuja última venda conhecida foi há mais de 90 dias na data de referência.",
    cor: "primary",
    Icone: Inventory2OutlinedIcon,
    chavesResumo: ["saldo", "valor"],
    colunas: [
      saldo,
      { chave: "ultima_venda", titulo: "Última venda", formato: formatarData },
      { chave: "valor", titulo: "Valor a custo", formato: moeda.format },
    ],
  },
  aumentos: {
    titulo: "Aumentos de custo",
    criterio: "Compara as duas últimas entradas com custo positivo de cada produto por fornecedor.",
    cor: "secondary",
    Icone: TrendingUpIcon,
    chavesResumo: ["custo_anterior", "custo_atual", "variacao"],
    colunas: [
      { chave: "fornecedor", titulo: "Fornecedor" },
      { chave: "custo_anterior", titulo: "De", formato: moeda.format, data: "data_anterior" },
      { chave: "custo_atual", titulo: "Por", formato: moeda.format, data: "data_atual" },
      { chave: "variacao", titulo: "Aumento", formato: (valor) => `+${percentual.format(valor)}%` },
    ],
  },
};

const porPagina = 15;

function mensagemSemItens(itens, categoria, temBusca) {
  if (itens === null) {
    return categoria === categorias.aumentos
      ? "Sem duas entradas com custo positivo para comparar."
      : "Estoque e vendas são necessários para calcular este indicador.";
  }
  return temBusca ? "Nenhum resultado para a busca." : "Nenhuma ocorrência para os departamentos exibidos.";
}

function ResumoCategoria({ itens, categoria, temBusca, abrir }) {
  const { Icone, titulo, cor, resumo, chavesResumo } = categoria;

  return (
    <Paper variant="outlined" sx={{ minWidth: 0, borderRadius: 3, overflow: "hidden" }}>
      <Stack direction="row" alignItems="center" gap={1} sx={(tema) => ({
        px: 2, py: 1.5, bgcolor: alpha(tema.palette[cor].main, 0.07),
      })}>
        <Icone color={cor} fontSize="small" />
        <Typography component="h2" fontWeight={700} sx={{ flex: 1 }}>{titulo}</Typography>
        <Chip size="small" color={cor} variant="outlined" label={itens === null ? "—" : quantidade.format(itens.length)} />
      </Stack>
      {itens?.length > 0 ? (
        <>
          {chavesResumo ? (
            <TabelaRadar itens={itens} categoria={categoria} temBusca={temBusca} compacto />
          ) : (
            <Box component="ul" sx={{ m: 0, px: 2, listStyle: "none" }}>
              {itens.slice(0, 4).map((item, indice) => (
                <Box component="li" key={`${item.codigo}-${indice}`} sx={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5,
                  py: 1.25, borderBottom: 1, borderColor: "divider",
                }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap title={item.produto}>{item.produto}</Typography>
                    <Typography variant="caption" color="text.secondary" component="div" noWrap>
                      {item.codigo}{item.fornecedor ? ` · ${item.fornecedor}` : ""}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ flexShrink: 0, textAlign: "right" }}>
                    {resumo(item)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          <Box sx={{ px: 1.25, py: 0.75 }}>
            <Button size="small" endIcon={<ChevronRightIcon />} onClick={abrir} aria-label={`Ver lista completa de ${titulo}`}>
              Ver lista completa
            </Button>
          </Box>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          {mensagemSemItens(itens, categoria, temBusca)}
        </Typography>
      )}
    </Paper>
  );
}

function TabelaRadar({ itens, categoria, temBusca, compacto = false }) {
  const [pagina, setPagina] = useState(0);

  if (!itens?.length) {
    return <Typography color="text.secondary">{mensagemSemItens(itens, categoria, temBusca)}</Typography>;
  }

  const colunas = compacto
    ? categoria.colunas.filter(({ chave }) => categoria.chavesResumo.includes(chave))
    : categoria.colunas;
  const paginaAtual = Math.min(pagina, Math.ceil(itens.length / porPagina) - 1);
  const inicio = compacto ? 0 : paginaAtual * porPagina;
  const fim = inicio + (compacto ? 4 : porPagina);
  return (
    <>
      <TableContainer>
        <Table size="small" aria-label={categoria.titulo}
          sx={compacto ? { "& .MuiTableCell-root": { px: 1 } } : { minWidth: 520 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Produto</TableCell>
              {colunas.map(({ chave, titulo, formato }) => (
                <TableCell key={chave} align={formato && chave !== "ultima_venda" ? "right" : "left"}
                  sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {titulo}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {itens.slice(inicio, fim).map((item, indice) => (
              <TableRow key={`${item.codigo}-${inicio + indice}`} hover>
                <TableCell component="th" scope="row" sx={{ minWidth: compacto ? 120 : 180, py: 1.25 }}>
                  <Typography variant="body2" fontWeight={600}>{item.produto}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.codigo}{compacto && item.fornecedor ? ` · ${item.fornecedor}` : ""}
                  </Typography>
                </TableCell>
                {colunas.map(({ chave, formato, data }) => (
                  <TableCell key={chave} align={formato && chave !== "ultima_venda" ? "right" : "left"}
                    sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: formato ? "nowrap" : "normal" }}>
                    {item[chave] == null ? "—" : formato ? formato(item[chave]) : item[chave]}
                    {!compacto && data && <Typography display="block" variant="caption" color="text.secondary">
                      {formatarData(item[data])}
                    </Typography>}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {!compacto && itens.length > porPagina && (
        <TablePagination component="div" count={itens.length} page={paginaAtual} rowsPerPage={porPagina}
          rowsPerPageOptions={[]} labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          getItemAriaLabel={(tipo) => tipo === "previous" ? "Página anterior" : "Próxima página"}
          onPageChange={(_, proxima) => setPagina(proxima)} />
      )}
    </>
  );
}

function RadarLoja({ lojaId }) {
  const [requisicao, setRequisicao] = useState({ departamento: "" });
  const [categoria, setCategoria] = useState(null);
  const [busca, setBusca] = useState("");
  const [consulta, setConsulta] = useState({ carregando: true });

  useEffect(() => {
    const controller = new AbortController();
    api.get("/radar", {
      params: { loja_id: lojaId, departamento: requisicao.departamento || undefined },
      signal: controller.signal,
    }).then(({ data }) => {
      if (controller.signal.aborted) return;
      if (data.filtro) {
        setConsulta({ dados: data, filtro: data.filtro, atualizadaEm: new Date() });
      } else {
        setConsulta({ erro: "Reinicie o servidor do Compra360 para carregar os departamentos monitorados." });
      }
    }).catch((erro) => {
      if (!controller.signal.aborted) setConsulta((anterior) => ({
        filtro: anterior.filtro,
        erro: erro.response?.status === 401 ? "Sua sessão expirou. Entre novamente no Compra360."
          : erro.response?.status === 404 ? "A loja selecionada não está disponível para o Radar."
          : "Não foi possível carregar o Radar desta loja.",
      }));
    });
    return () => controller.abort();
  }, [lojaId, requisicao]);

  const { dados, filtro, atualizadaEm, carregando } = consulta;
  const departamentos = filtro?.departamentos ?? [];
  const departamento = carregando && !dados ? requisicao.departamento : filtro?.departamento_aplicado ?? "";
  const semMonitorados = filtro?.monitoramento_configurado && departamentos.length === 0;
  const rotuloGeral = filtro?.monitoramento_configurado
    ? `Meus departamentos (${departamentos.length})`
    : "Todos os departamentos";
  const termo = normalizarBusca(busca.trim());
  const categoriaAtual = categorias[categoria];

  function ocorrencias(chave) {
    const itens = dados[chave];
    if (!termo || !itens) return itens;
    return itens.filter((item) => [item.codigo, item.produto, item.fornecedor].some(
      (valor) => valor && normalizarBusca(valor).includes(termo)
    ));
  }

  function atualizar() {
    setConsulta((anterior) => ({ ...anterior, erro: null, carregando: true }));
    setRequisicao({ departamento });
  }

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1.25}>
          {filtro && !semMonitorados && (
            <TextField select size="small" label="Departamento" value={departamento}
              sx={{ width: { xs: "100%", sm: 250 } }} disabled={carregando}
              slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
              onChange={(evento) => {
                setConsulta({ filtro, carregando: true });
                setRequisicao({ departamento: evento.target.value });
              }}>
              <MenuItem value="">{rotuloGeral}</MenuItem>
              {departamentos.map(({ codigo, descricao }) => (
                <MenuItem key={codigo} value={codigo}>{descricao}</MenuItem>
              ))}
            </TextField>
          )}
          {filtro && !semMonitorados && (
            <TextField size="small" type="search" label="Buscar ocorrências"
              placeholder="Produto, código ou fornecedor" value={busca}
              onChange={(evento) => setBusca(evento.target.value)} sx={{ flex: 1, maxWidth: { sm: 320 } }} />
          )}
          <Button size="small" startIcon={<RefreshIcon />} onClick={atualizar} disabled={carregando}
            sx={{ ml: { sm: "auto" }, alignSelf: { xs: "flex-start", sm: "center" } }}>
            Atualizar
          </Button>
        </Stack>
        {dados && (
          <Stack direction="row" flexWrap="wrap" columnGap={2} rowGap={0.5} alignItems="center" sx={{ mt: 1.25 }}>
            {atualizadaEm && <Typography variant="caption" color="text.secondary" role="status">
              Consultado às {horaConsulta.format(atualizadaEm)}
            </Typography>}
            {dados.vendas_fim && <Typography variant="caption" color="text.secondary">
              Vendas de {formatarData(dados.vendas_inicio)} a {formatarData(dados.vendas_fim)}
            </Typography>}
            {dados.importacao_produtos && <Typography variant="caption" color="text.secondary">
              Produtos importados em {dataImportacao.format(new Date(dados.importacao_produtos))}
            </Typography>}
            {dados.ultima_entrada && <Typography variant="caption" color="text.secondary">
              Última entrada com custo em {formatarData(dados.ultima_entrada)}
            </Typography>}
            {!semMonitorados && <Button size="small" component={Link} to="/configuracao-alertas" sx={{ p: 0 }}>
              {filtro.monitoramento_configurado ? "Editar departamentos monitorados" : "Configurar departamentos monitorados"}
            </Button>}
          </Stack>
        )}
      </Paper>

      {carregando && <LinearProgress aria-label="Carregando Radar" />}
      {consulta.erro && <Alert severity="error">{consulta.erro}</Alert>}
      {dados && semMonitorados && (
        <Alert severity="info" action={<Button component={Link} to="/configuracao-alertas" color="inherit" size="small">
          Abrir configurações
        </Button>}>
          Nenhum departamento está marcado em Departamentos Monitorados.
        </Alert>
      )}

      {dados && !semMonitorados && (
        <>
          {(!dados.estoque_importado || !dados.vendas_fim || dados.dias_vendas_registrados < dados.dias_vendas_referencia) && (
            <Alert severity="info">
              {!dados.estoque_importado && <div>A loja ainda não tem saldos de estoque importados.</div>}
              {!dados.vendas_fim && <div>A loja ainda não tem histórico de vendas importado.</div>}
              {dados.vendas_fim && dados.dias_vendas_registrados < dados.dias_vendas_referencia && <div>
                Há vendas registradas em {dados.dias_vendas_registrados} dos {dados.dias_vendas_referencia} dias de referência.
                A cobertura usa o intervalo disponível.
              </div>}
            </Alert>
          )}

          {categoriaAtual ? (
            <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}>
              <Stack spacing={1.5}>
                <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => setCategoria(null)}
                  sx={{ alignSelf: "flex-start" }} autoFocus>
                  Voltar à visão geral
                </Button>
                <Box>
                  <Typography variant="h6" component="h2">{categoriaAtual.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary">{categoriaAtual.criterio}</Typography>
                </Box>
                {categoria === "parado" && dados.valor_parado !== null && <Typography variant="body2">
                  Total a custo nos departamentos exibidos <strong>{moeda.format(dados.valor_parado)}</strong>
                </Typography>}
                {categoria === "parado" && (dados.sem_historico > 0 || dados.sem_custo > 0) && (
                  <Alert severity="info">
                    {dados.sem_historico > 0 && <div>{quantidade.format(dados.sem_historico)} produtos com estoque
                      e sem venda registrada para medir o tempo sem vendas.</div>}
                    {dados.sem_custo > 0 && <div>{quantidade.format(dados.sem_custo)} produtos sem custo positivo
                      ficaram fora do valor total.</div>}
                  </Alert>
                )}
                <TabelaRadar key={`${categoria}-${termo}`} itens={ocorrencias(categoria)} categoria={categoriaAtual} temBusca={Boolean(termo)} />
              </Stack>
            </Paper>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" } }}>
              {Object.entries(categorias).map(([chave, detalhes]) => (
                <ResumoCategoria key={chave} itens={ocorrencias(chave)} categoria={detalhes}
                  temBusca={Boolean(termo)} abrir={() => setCategoria(chave)} />
              ))}
            </Box>
          )}
        </>
      )}
    </Stack>
  );
}

export default function Radar() {
  const [lojaId, setLojaId] = useState(() => JSON.parse(localStorage.getItem("lojaSelecionada"))?.id);

  useEffect(() => {
    const atualizarLoja = (evento) => setLojaId(evento.detail?.id);
    window.addEventListener("lojaSelecionadaAlterada", atualizarLoja);
    return () => window.removeEventListener("lojaSelecionadaAlterada", atualizarLoja);
  }, []);

  return lojaId ? <RadarLoja key={lojaId} lojaId={lojaId} />
    : <Alert severity="info">Selecione uma loja no menu lateral para consultar o Radar do Comprador.</Alert>;
}
