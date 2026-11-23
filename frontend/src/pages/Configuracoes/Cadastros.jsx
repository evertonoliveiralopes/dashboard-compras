import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  FormControlLabel, LinearProgress, MenuItem, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";

import {
  buscarEmpresas, buscarUsuarios, salvarEmpresa, salvarPermissao, salvarUsuario,
} from "../../services/configuracaoGeralService";

const secoes = {
  empresas: { titulo: "Empresas cadastradas", acao: "Nova empresa", entidade: "empresa", buscar: buscarEmpresas },
  usuarios: { titulo: "Usuários cadastrados", acao: "Novo usuário", entidade: "usuário", buscar: buscarUsuarios },
  permissoes: { titulo: "Permissões por usuário", entidade: "perfil", buscar: buscarUsuarios },
};

const nomePerfil = (administrador) => administrador ? "Administrador" : "Operador";

function mensagemErro(erro, padrao) {
  const detalhe = erro.response?.data?.detail;
  return typeof detalhe === "string" ? detalhe : padrao;
}

function atualizarSelecaoEmpresa(empresa) {
  const atual = JSON.parse(localStorage.getItem("lojaSelecionada"));
  if (atual?.id === empresa.id) {
    const selecionada = empresa.ativo ? empresa : null;
    localStorage.setItem("lojaSelecionada", JSON.stringify(selecionada));
    window.dispatchEvent(new CustomEvent("lojaSelecionadaAlterada", { detail: selecionada }));
  }
  window.dispatchEvent(new Event("lojasCadastradasAlteradas"));
}

function FormularioCadastro({ tipo, registro, usuarioId, fechar, aoSalvar }) {
  const empresa = tipo === "empresas";
  const permissao = tipo === "permissoes";
  const novo = !registro.id;
  const propriaConta = !empresa && registro.id === usuarioId;
  const [campos, setCampos] = useState({ nome: "", codigo: "", unidade: "", email: "", senha: "", ativo: true, ...registro });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function alterar(campo, valor) {
    setCampos((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const comum = { nome: campos.nome.trim(), ativo: campos.ativo };
      let salvo;
      if (empresa) {
        salvo = await salvarEmpresa(registro.id, {
          ...comum, unidade: campos.unidade.trim(), ...(novo && { codigo: campos.codigo.trim() }),
        });
      } else if (permissao) {
        salvo = await salvarPermissao(registro.id, campos.administrador);
      } else {
        salvo = await salvarUsuario(registro.id, {
          ...comum, email: campos.email.trim(), ...(novo && { senha: campos.senha }),
        });
      }
      aoSalvar(salvo);
    } catch (falha) {
      setErro(mensagemErro(falha, "Confira os campos e tente salvar novamente."));
    } finally {
      setSalvando(false);
    }
  }

  const titulo = permissao ? "Alterar perfil" : novo ? secoes[tipo].acao : "Editar " + secoes[tipo].entidade;

  return (
    <Dialog open onClose={salvando ? undefined : fechar}
      fullWidth maxWidth="xs" aria-labelledby="titulo-edicao-cadastro">
      <Box component="form" onSubmit={enviar}>
        <DialogTitle id="titulo-edicao-cadastro">{titulo}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {erro && <Alert severity="error">{erro}</Alert>}
            {permissao ? (
              <>
                <Typography variant="body2" color="text.secondary">{registro.nome}</Typography>
                <TextField select label="Perfil de acesso" value={campos.administrador ? "admin" : "operador"}
                  onChange={(evento) => alterar("administrador", evento.target.value === "admin")} disabled={salvando}>
                  <MenuItem value="operador">Operador</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </TextField>
              </>
            ) : (
              <>
                {empresa && <TextField label="Código da empresa" value={campos.codigo} required
                  disabled={!novo || salvando} onChange={(evento) => alterar("codigo", evento.target.value)}
                  slotProps={{ htmlInput: { maxLength: 10 } }} />}
                <TextField label={empresa ? "Nome da empresa" : "Nome"} value={campos.nome} required disabled={salvando}
                  onChange={(evento) => alterar("nome", evento.target.value)}
                  slotProps={{ htmlInput: { maxLength: empresa ? 100 : 150 } }} />
                {empresa ? (
                  <TextField label="Unidade" value={campos.unidade} required disabled={salvando}
                    onChange={(evento) => alterar("unidade", evento.target.value)}
                    slotProps={{ htmlInput: { maxLength: 100 } }} />
                ) : (
                  <TextField label="E-mail" type="email" value={campos.email} required disabled={salvando}
                    onChange={(evento) => alterar("email", evento.target.value)}
                    slotProps={{ htmlInput: { maxLength: 150 } }} />
                )}
                {!empresa && novo && (
                  <TextField label="Senha inicial" type="password" autoComplete="new-password" value={campos.senha}
                    required disabled={salvando} helperText="Mínimo de 8 caracteres."
                    slotProps={{ htmlInput: { minLength: 8, maxLength: 72 } }}
                    onChange={(evento) => alterar("senha", evento.target.value)} />
                )}
                <FormControlLabel label={empresa ? "Empresa ativa" : "Usuário ativo"} control={
                  <Switch checked={campos.ativo} disabled={propriaConta || salvando}
                    onChange={(evento) => alterar("ativo", evento.target.checked)} />
                } />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={fechar} disabled={salvando}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function Cadastros({ tipo, usuarioId }) {
  const secao = secoes[tipo];
  const empresa = tipo === "empresas";
  const permissao = tipo === "permissoes";
  const [consulta, setConsulta] = useState(null);
  const [edicao, setEdicao] = useState(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    secao.buscar(controller.signal).then((itens) => {
      if (!controller.signal.aborted) setConsulta({ itens });
    }).catch((erro) => {
      if (!controller.signal.aborted) setConsulta({ erro: mensagemErro(erro, "Não foi possível carregar os cadastros.") });
    });
    return () => controller.abort();
  }, [secao]);

  function atualizarLista(salvo) {
    const itens = consulta.itens.filter((item) => item.id !== salvo.id).concat(salvo);
    itens.sort(empresa ? (a, b) => a.id - b.id : (a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    setConsulta({ itens });
    setEdicao(null);
    setMensagem(permissao ? "Perfil atualizado." : "Cadastro salvo.");
    if (empresa) atualizarSelecaoEmpresa(salvo);
  }

  return (
    <Stack spacing={2}>
      {permissao && (
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
            <Typography fontWeight={700}>Administrador</Typography>
            <Typography variant="body2" color="text.secondary">Gerencia empresas, contas de usuários e perfis de acesso.</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
            <Typography fontWeight={700}>Operador</Typography>
            <Typography variant="body2" color="text.secondary">Acessa as áreas operacionais e configura os próprios alertas.</Typography>
          </Paper>
        </Box>
      )}
      <Paper component="section" variant="outlined" sx={{ borderRadius: 2.5, p: { xs: 1.5, sm: 2.5 } }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
            <Typography component="h2" variant="h6" fontWeight={700} color="#142742">{secao.titulo}</Typography>
            {secao.acao && consulta?.itens && (
              <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setEdicao({})}>{secao.acao}</Button>
            )}
          </Box>
          {!consulta && <LinearProgress aria-label="Carregando cadastros" />}
          {consulta?.erro && <Alert severity="error">{consulta.erro}</Alert>}
          {mensagem && <Alert severity="success" onClose={() => setMensagem("")}>{mensagem}</Alert>}
          {consulta?.itens?.length === 0 && <Typography variant="body2" color="text.secondary">Nenhum cadastro encontrado.</Typography>}
          {consulta?.itens?.length > 0 && (
            <Stack component="ul" divider={<Divider component="li" />} sx={{ m: 0, p: 0, listStyle: "none" }}>
              {consulta.itens.map((item) => (
                <Box component="li" key={item.id} sx={{ py: 1.5, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.25 }}>
                  <Box sx={{ flex: "1 1 220px", minWidth: 0, overflowWrap: "anywhere" }}>
                    <Typography variant="body2" fontWeight={700}>{item.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {empresa ? item.codigo + " · " + item.unidade : item.email}
                    </Typography>
                  </Box>
                  <Chip size="small" variant="outlined" color={item.ativo ? "success" : "default"}
                    label={empresa ? (item.ativo ? "Ativa" : "Inativa") : (item.ativo ? "Ativo" : "Inativo")} />
                  {!empresa && <Chip size="small" label={nomePerfil(item.administrador)} color={item.administrador ? "primary" : "default"} />}
                  <Button size="small" disabled={permissao && item.id === usuarioId}
                    aria-label={(permissao ? "Alterar perfil de " : "Editar ") + item.nome}
                    onClick={() => setEdicao(item)}>
                    {permissao ? "Alterar perfil" : "Editar"}
                  </Button>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>
      {edicao && <FormularioCadastro tipo={tipo} registro={edicao} usuarioId={usuarioId}
        fechar={() => setEdicao(null)} aoSalvar={atualizarLista} />}
    </Stack>
  );
}
