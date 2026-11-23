import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { buscarUsuarioAtual } from "../../../services/authService";
import { buscarAlertas } from "../../../services/dashboardService";

const categorias = [
  {
    tipo: "SEM_ESTOQUE",
    titulo: "Estoque abaixo do mínimo",
    cor: "warning",
  },
  {
    tipo: "SEM_CUSTO",
    titulo: "Produtos sem custo",
    cor: "error",
  },
  {
    tipo: "SEM_COMPRA",
    titulo: "Produtos sem compras registradas",
    cor: "info",
  },
  {
    tipo: "SEM_VENDA",
    titulo: "Produtos sem vendas",
    cor: "warning",
  },
];

function lerComposicoes(chave) {
  const itens = JSON.parse(localStorage.getItem(chave));
  return Array.isArray(itens) ? itens.filter((item) =>
    typeof item?.codigo === "string" && item.codigo.length > 0 && item.codigo.length <= 30
    && typeof item.produto === "string"
  ) : [];
}

export default function AlertasWidget({ lojaId }) {
  const [preferencias, setPreferencias] = useState(null);
  const [consulta, setConsulta] = useState(null);
  const [listaAberta, setListaAberta] = useState(false);
  const [grupoAberto, setGrupoAberto] = useState(undefined);
  const [erroPreferencias, setErroPreferencias] = useState("");

  useEffect(() => {
    let ativo = true;

    let chave;

    async function carregarPreferencias() {
      try {
        const usuario = await buscarUsuarioAtual();
        if (!ativo) return;
        chave = `compra360:alertas:composicoes:${usuario.id}`;
        setPreferencias({ chave, itens: lerComposicoes(chave) });
      } catch {
        if (ativo) {
          setPreferencias({ chave: null, itens: [] });
          setErroPreferencias("Não foi possível carregar as marcações de composição neste navegador.");
        }
      }
    }

    carregarPreferencias();

    function sincronizarPreferencias(evento) {
      if (chave && (evento.key === chave || evento.key === null)) {
        try {
          setPreferencias({ chave, itens: lerComposicoes(chave) });
          setErroPreferencias("");
        } catch {
          setErroPreferencias("Não foi possível recarregar as marcações de composição neste navegador.");
        }
      }
    }

    window.addEventListener("storage", sincronizarPreferencias);

    return () => {
      ativo = false;
      window.removeEventListener("storage", sincronizarPreferencias);
    };
  }, []);

  useEffect(() => {
    if (!preferencias) return;

    const controller = new AbortController();
    const codigos = preferencias.itens.map((item) => item.codigo);

    buscarAlertas(lojaId, codigos, controller.signal).then((dados) => {
      if (!controller.signal.aborted) {
        setConsulta({ lojaId, preferencias, alertas: Array.isArray(dados) ? dados : [] });
      }
    }).catch((erro) => {
      if (!controller.signal.aborted) {
        console.error("Erro ao buscar alertas:", erro);
        setConsulta({ lojaId, preferencias, erro: true });
      }
    });

    return () => controller.abort();
  }, [lojaId, preferencias]);

  const resultadoLoja = consulta?.lojaId === lojaId ? consulta : null;
  const carregando = !resultadoLoja || resultadoLoja.preferencias !== preferencias;
  const itensComposicao = preferencias?.itens ?? [];
  const codigosComposicao = new Set(itensComposicao.map((item) => item.codigo));
  const alertas = resultadoLoja?.alertas?.filter((item) => !codigosComposicao.has(item.codigo_produto));
  const grupos = categorias.map((categoria) => ({
    ...categoria, itens: alertas?.filter((alerta) => alerta.tipo === categoria.tipo) ?? [],
  })).filter((categoria) => categoria.itens.length > 0);
  const grupoExpandido = grupoAberto === null || grupos.some(({ tipo }) => tipo === grupoAberto)
    ? grupoAberto : grupos[0]?.tipo;
  const listaLimitada = grupos.some(({ itens }) => itens.length === 10);

  function salvarComposicao(item, marcado) {
    const { chave } = preferencias;
    try {
      const itens = lerComposicoes(chave).filter(({ codigo }) => codigo !== item.codigo);
      if (marcado) itens.push(item);
      itens.sort((a, b) => a.produto.localeCompare(b.produto, "pt-BR"));
      localStorage.setItem(chave, JSON.stringify(itens));
      setPreferencias({ chave, itens });
      setErroPreferencias("");
    } catch {
      setErroPreferencias("Não foi possível salvar a marcação de composição neste navegador.");
    }
  }

  return (
    <Paper
      component="section"
      aria-labelledby="titulo-alertas-dashboard"
      variant="outlined"
      sx={{
        p: { xs: 1.75, sm: 2 },
        minWidth: 0,
        borderRadius: 2.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          mb: 1.75,
        }}
      >
        <Typography component="h2" id="titulo-alertas-dashboard" variant="h6" fontWeight={700} color="#142742">
          Alertas e atenção
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          {preferencias?.chave && (
            <Button size="small" onClick={() => setListaAberta(true)}>
              Itens de composição ({itensComposicao.length})
            </Button>
          )}
          {alertas && (
            <Chip
              label={`${alertas.length} ${alertas.length === 1 ? "alerta" : "alertas"}${listaLimitada ? " exibidos" : ""}`}
              color={alertas.length > 0 ? "warning" : "success"}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </Box>

      {erroPreferencias && !listaAberta && (
        <Alert severity="error" sx={{ mb: 1.5 }}>{erroPreferencias}</Alert>
      )}
      {carregando && !alertas ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
          }}
        >
          <CircularProgress size={28} />
        </Box>
      ) : resultadoLoja?.erro ? (
        <Alert severity="error">
          Não foi possível carregar os alertas.
        </Alert>
      ) : (
        <Box>
          {carregando && <LinearProgress aria-label="Atualizando alertas" sx={{ mb: 1.5 }} />}
          {!grupos.length && (
            <Typography variant="body2" color="text.secondary">Nenhum alerta para a loja e os departamentos monitorados.</Typography>
          )}
          {grupos.map(({ tipo, titulo, cor, itens }) => (
              <Accordion
                key={tipo}
                disableGutters
                elevation={0}
                expanded={grupoExpandido === tipo}
                onChange={(_, aberto) => setGrupoAberto(aberto ? tipo : null)}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "12px !important",
                  mb: 1,
                  "&:before": {
                    display: "none",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ minHeight: 42, px: 1.5, "& .MuiAccordionSummary-content": { my: 0.75 } }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <Typography
                      fontWeight="medium"
                      sx={{ flexGrow: 1 }}
                    >
                      {titulo}
                    </Typography>

                    <Chip
                      size="small"
                      label={itens.length}
                      color={cor}
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 1.25, pt: 0.25, pb: 1.25 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.75,
                        maxHeight: 216,
                        overflowY: "auto",
                      }}
                    >
                      {itens.map((alerta, index) => (
                        <Box
                          key={`${alerta.tipo}-${alerta.codigo_produto}-${index}`}
                          sx={{
                            p: 1,
                            borderRadius: 1.25,
                            bgcolor: "#F5F7FA",
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 0.75,
                          }}
                        >
                          <Box sx={{ flex: "1 1 13rem", minWidth: 0, overflowWrap: "anywhere" }}>
                            <Typography variant="body2" fontWeight="medium">
                              {alerta.codigo_produto} - {alerta.produto}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {alerta.detalhe}
                            </Typography>
                          </Box>
                          {preferencias?.chave && alerta.codigo_produto && (
                            <Button size="small"
                              aria-label={`Marcar ${alerta.codigo_produto} como composição`}
                              onClick={() => salvarComposicao({ codigo: alerta.codigo_produto, produto: alerta.produto }, true)}>
                              Marcar como composição
                            </Button>
                          )}
                        </Box>
                      ))}
                    </Box>
                </AccordionDetails>
              </Accordion>
          ))}
        </Box>
      )}
      <Dialog open={listaAberta} onClose={() => setListaAberta(false)} fullWidth maxWidth="sm"
        aria-labelledby="titulo-itens-composicao">
        <DialogTitle id="titulo-itens-composicao">Itens de composição</DialogTitle>
        <DialogContent dividers>
          {erroPreferencias && <Alert severity="error" sx={{ mb: 1.5 }}>{erroPreferencias}</Alert>}
          {itensComposicao.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Os itens marcados nos alertas aparecem aqui.</Typography>
          ) : (
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
              {itensComposicao.map((item) => (
                <Box component="li" key={item.codigo} sx={{ display: "flex", flexWrap: "wrap", gap: 1,
                  alignItems: "center", justifyContent: "space-between", py: 1, borderBottom: 1, borderColor: "divider" }}>
                  <Typography variant="body2">{item.codigo} - {item.produto}</Typography>
                  <Button size="small" aria-label={`Remover marcação de ${item.codigo}`} onClick={() => salvarComposicao(item, false)}>
                    Remover marcação
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setListaAberta(false)}>Fechar</Button></DialogActions>
      </Dialog>
    </Paper>
  );
}
