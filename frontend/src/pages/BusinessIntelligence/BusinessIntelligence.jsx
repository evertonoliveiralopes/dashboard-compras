import { useEffect, useState } from "react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import {
  Alert, Autocomplete, Box, Button, Chip, FormControlLabel, Paper, Stack,
  Switch, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, TextField, Typography,
} from "@mui/material";

import api from "../../services/api";
import { buscarDepartamentos } from "../../services/departamentoService";

const perguntas = [
  "Que produtos preciso comprar hoje?",
  "Que fornecedor teve aumento de preço?",
  "Que loja possui ruptura?",
  "Qual o valor do estoque parado há mais de 90 dias?",
];

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const quantidade = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });
const percentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const formatarData = (data) => data.split("-").reverse().join("/");
const camposProduto = [
  { chave: "loja", titulo: "Loja" },
  { chave: "codigo", titulo: "Código" },
  { chave: "produto", titulo: "Produto" },
];
const colunas = {
  comprar: [
    ...camposProduto,
    { chave: "saldo", titulo: "Saldo", formato: quantidade.format },
    { chave: "media_diaria", titulo: "Venda por dia", formato: quantidade.format },
    { chave: "cobertura", titulo: "Cobertura (dias)", formato: quantidade.format },
  ],
  fornecedor: [
    { chave: "fornecedor", titulo: "Fornecedor" },
    ...camposProduto,
    { chave: "custo_anterior", titulo: "Custo anterior", formato: moeda.format },
    { chave: "data_anterior", titulo: "Data anterior", formato: formatarData },
    { chave: "custo_atual", titulo: "Custo atual", formato: moeda.format },
    { chave: "data_atual", titulo: "Data atual", formato: formatarData },
    { chave: "variacao", titulo: "Aumento", formato: (valor) => percentual.format(valor) + "%" },
  ],
  ruptura: [
    { chave: "loja", titulo: "Loja" },
    { chave: "quantidade", titulo: "Produtos em ruptura", formato: quantidade.format },
  ],
  parado: [
    ...camposProduto,
    { chave: "saldo", titulo: "Saldo", formato: quantidade.format },
    { chave: "ultima_venda", titulo: "Última venda", formato: formatarData },
    { chave: "valor", titulo: "Valor a custo", formato: moeda.format },
  ],
};

function Resposta({ resultado }) {
  const [pagina, setPagina] = useState(0);
  if (resultado.mensagem) {
    return <Alert severity="info">{resultado.mensagem}</Alert>;
  }

  const campos = colunas[resultado.tipo];
  const itens = resultado.itens;
  const porPagina = 15;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
      <Stack spacing={2}>
        <div>
          <Typography variant="h6" fontWeight={700}>{resultado.titulo}</Typography>
          <Typography variant="body2" color="text.secondary">{resultado.criterio}</Typography>
        </div>
        {resultado.valor_total != null && (
          <div>
            <Typography variant="body2" color="text.secondary">Total apurado a custo</Typography>
            <Typography fontWeight={700} variant="h5">
              {moeda.format(resultado.valor_total)}
            </Typography>
          </div>
        )}
        {resultado.fontes.filter((fonte) => fonte.fim).map((fonte) => (
          <Typography key={fonte.loja} variant="body2" color="text.secondary">
            {fonte.loja} · {fonte.inicio
              ? `Vendas de ${formatarData(fonte.inicio)} a ${formatarData(fonte.fim)}`
              : `Última entrada em ${formatarData(fonte.fim)}`}
          </Typography>
        ))}
        {resultado.avisos.map((aviso) => <Alert key={aviso} severity="warning">{aviso}</Alert>)}
        {itens.length > 0 ? (
          <>
            <TableContainer>
              <Table size="small" aria-label={resultado.titulo}>
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow>
                    {campos.map(({ chave, titulo }) => (
                      <TableCell key={chave} sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>
                        {titulo}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itens.slice(pagina * porPagina, (pagina + 1) * porPagina).map((item, indice) => (
                    <TableRow key={pagina * porPagina + indice} hover>
                      {campos.map(({ chave, formato }) => (
                        <TableCell key={chave}>
                          {item[chave] == null ? "—" : formato ? formato(item[chave]) : item[chave]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {itens.length > porPagina && (
              <TablePagination
                component="div"
                count={itens.length}
                page={pagina}
                rowsPerPage={porPagina}
                rowsPerPageOptions={[]}
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                getItemAriaLabel={(tipo) => tipo === "previous" ? "Página anterior" : "Próxima página"}
                onPageChange={(_, proxima) => setPagina(proxima)}
              />
            )}
          </>
        ) : resultado.lojas_consultadas > 0 && (
          <Typography variant="body2">Nenhuma ocorrência encontrada nos dados disponíveis.</Typography>
        )}
      </Stack>
    </Paper>
  );
}

function Consulta({ loja, departamentos }) {
  const [pergunta, setPergunta] = useState("");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    if (carregando || !pergunta.trim()) return;

    setCarregando(true);
    setResultado(null);
    setErro(null);
    try {
      const { data } = await api.post("/ia/perguntar", {
        pergunta: pergunta.trim(),
        loja_id: loja?.id ?? null,
        departamento_ids: departamentos.map(({ id }) => id),
      });
      setResultado(data);
    } catch (falha) {
      const detalhe = falha.response?.data?.detail;
      setErro(typeof detalhe === "string" ? detalhe : "Não foi possível consultar o Compra360.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack component="form" spacing={2} onSubmit={enviar}>
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            {perguntas.map((texto) => (
              <Chip key={texto} label={texto} variant="outlined" onClick={() => setPergunta(texto)} />
            ))}
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Pergunte à Gira"
              fullWidth
              value={pergunta}
              onChange={(evento) => setPergunta(evento.target.value)}
              slotProps={{ htmlInput: { maxLength: 400 } }}
            />
            <Button
              type="submit"
              variant="contained"
              loading={carregando}
              disabled={!pergunta.trim()}
              endIcon={<SendOutlinedIcon />}
              sx={{ px: 3 }}
            >
              Perguntar
            </Button>
          </Stack>
        </Stack>
      </Paper>
      {erro && <Alert severity="error">{erro}</Alert>}
      {resultado && <Resposta resultado={resultado} />}
    </Stack>
  );
}

export default function BusinessIntelligence() {
  const [loja, setLoja] = useState(() => JSON.parse(localStorage.getItem("lojaSelecionada")));
  const [todasLojas, setTodasLojas] = useState(false);
  const [opcoes, setOpcoes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [erroDepartamentos, setErroDepartamentos] = useState(false);

  useEffect(() => {
    function atualizarLoja(evento) {
      setLoja(evento.detail);
      setTodasLojas(false);
    }
    window.addEventListener("lojaSelecionadaAlterada", atualizarLoja);
    return () => window.removeEventListener("lojaSelecionadaAlterada", atualizarLoja);
  }, []);

  useEffect(() => {
    buscarDepartamentos().then(setOpcoes).catch(() => setErroDepartamentos(true));
  }, []);

  const lojaConsulta = todasLojas ? null : loja;
  const chaveConsulta = [lojaConsulta?.id, ...departamentos.map(({ id }) => id)].join(",");

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 1320, mx: "auto" }}>
      <Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <AutoAwesomeOutlinedIcon color="primary" />
          <Typography component="h1" variant="h5" fontWeight={700}>Gira • IA do Compra360</Typography>
        </Stack>
        <Typography sx={{ mt: 1 }} color="text.secondary">
          Consulte compras, fornecedores e estoque com os dados importados.
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <FormControlLabel
            control={<Switch checked={todasLojas} onChange={(_, marcado) => setTodasLojas(marcado)} />}
            label="Todas as lojas"
          />
          {!todasLojas && (
            <Typography variant="body2" color="text.secondary">
              {loja?.nome ?? "Selecione uma loja no menu lateral."}
            </Typography>
          )}
          <Autocomplete
            multiple
            size="small"
            options={opcoes}
            value={departamentos}
            onChange={(_, selecao) => setDepartamentos(selecao)}
            getOptionLabel={(opcao) => opcao.descricao}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            sx={{ flex: 1, minWidth: { sm: 220 } }}
            renderInput={(params) => (
              <TextField {...params} label="Departamentos" placeholder={departamentos.length ? "" : "Todos"} />
            )}
          />
        </Stack>
        {erroDepartamentos && (
          <Alert severity="warning" sx={{ mt: 2 }}>Não foi possível carregar os departamentos.</Alert>
        )}
      </Paper>
      {(todasLojas || loja) && (
        <Consulta key={chaveConsulta} loja={lojaConsulta} departamentos={departamentos} />
      )}
    </Stack>
  );
}
