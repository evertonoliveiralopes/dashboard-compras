import { useRef, useState } from "react";
import {
  Alert, Avatar, Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, ListItemIcon, Menu, MenuItem, Stack, Tooltip, Typography,
} from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SwitchAccountOutlinedIcon from "@mui/icons-material/SwitchAccountOutlined";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];
const LIMITE_FOTO = 8 * 1024 * 1024;

function lerFoto(chave) {
  if (!chave) return "";
  try {
    return localStorage.getItem(chave) || "";
  } catch {
    return "";
  }
}

async function prepararFoto(arquivo) {
  const origem = URL.createObjectURL(arquivo);
  try {
    const imagem = new Image();
    imagem.src = origem;
    await imagem.decode();
    const lado = Math.min(imagem.naturalWidth, imagem.naturalHeight);
    const tamanho = Math.min(lado, 256);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = tamanho;
    const desenho = canvas.getContext("2d");
    desenho.fillStyle = "#F4F7FB";
    desenho.fillRect(0, 0, tamanho, tamanho);
    desenho.drawImage(imagem, (imagem.naturalWidth - lado) / 2, (imagem.naturalHeight - lado) / 2,
      lado, lado, 0, 0, tamanho, tamanho);
    return canvas.toDataURL("image/jpeg", 0.88);
  } finally {
    URL.revokeObjectURL(origem);
  }
}

function AvatarConta({ foto, nome, tamanho }) {
  const iniciais = nome?.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
  return (
    <Avatar alt={foto ? "Foto de perfil" : undefined} src={foto || undefined}
      sx={{ width: tamanho, height: tamanho, bgcolor: "#E5F0FC", color: "#174D91", fontWeight: 700 }}>
      {iniciais || <AccountCircleOutlinedIcon fontSize="inherit" />}
    </Avatar>
  );
}

export default function MenuConta({ usuario, encerrar, compacto = false }) {
  const chaveFoto = usuario ? "compra360:foto-perfil:" + usuario.id : null;
  const [foto, setFoto] = useState(() => lerFoto(chaveFoto));
  const [ancora, setAncora] = useState(null);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const arquivoRef = useRef(null);
  const papel = usuario?.administrador ? "Administrador" : "Operador";

  function abrirPerfil() {
    setAncora(null);
    setAviso(null);
    setPerfilAberto(true);
  }

  async function trocarFoto(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;

    if (!TIPOS_FOTO.includes(arquivo.type) || arquivo.size > LIMITE_FOTO) {
      setAviso({ tipo: "error", texto: "Selecione uma imagem JPG, PNG ou WebP de até 8 MB." });
      return;
    }

    setProcessando(true);
    setAviso(null);
    try {
      const novaFoto = await prepararFoto(arquivo);
      localStorage.setItem(chaveFoto, novaFoto);
      setFoto(novaFoto);
      setAviso({ tipo: "success", texto: "Foto de perfil atualizada." });
    } catch {
      setAviso({ tipo: "error", texto: "Não foi possível salvar esta imagem. Tente outro arquivo." });
    } finally {
      setProcessando(false);
    }
  }

  function removerFoto() {
    try {
      localStorage.removeItem(chaveFoto);
      setFoto("");
      setAviso({ tipo: "success", texto: "Foto de perfil removida." });
    } catch {
      setAviso({ tipo: "error", texto: "Não foi possível remover a foto de perfil." });
    }
  }

  return (
    <>
      <Tooltip title={compacto ? usuario?.nome || "Menu da conta" : ""} placement="right">
        <ButtonBase id="botao-menu-conta" aria-label="Menu da conta" aria-haspopup="menu"
          aria-controls={ancora ? "menu-conta" : undefined} aria-expanded={ancora ? true : undefined}
          onClick={(evento) => setAncora(evento.currentTarget)} className="compra-sidebar-controle compra-sidebar-conta">
          <AvatarConta foto={foto} nome={usuario?.nome} tamanho={32} />
          {!compacto && (
            <>
              <Box className="compra-sidebar-identidade">
                <Typography component="span" className="compra-sidebar-identidade-nome" noWrap title={usuario?.nome}>
                  {usuario?.nome || "Minha conta"}
                </Typography>
                {usuario && <Typography component="span" className="compra-sidebar-identidade-detalhe" noWrap>
                  {papel}
                </Typography>}
              </Box>
              <UnfoldMoreIcon fontSize="small" className="compra-sidebar-conta-seta" />
            </>
          )}
        </ButtonBase>
      </Tooltip>
      <Menu anchorEl={ancora} open={Boolean(ancora)} onClose={() => setAncora(null)}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ list: { id: "menu-conta", "aria-labelledby": "botao-menu-conta" }, paper: {
          sx: { width: 288, maxWidth: "calc(100vw - 32px)", borderRadius: 2.5, mb: 0.75 },
        } }}>
        {usuario && <Box component="li" role="presentation" sx={{ px: 2, py: 1.25, overflowWrap: "anywhere" }}>
          <Typography fontWeight={700}>{usuario.nome}</Typography>
          <Typography variant="body2" color="text.secondary">{usuario.email}</Typography>
          <Typography variant="caption" color="primary.main">{papel}</Typography>
        </Box>}
        {usuario && <Divider />}
        {usuario && <MenuItem onClick={abrirPerfil}>
          <ListItemIcon><AccountCircleOutlinedIcon fontSize="small" /></ListItemIcon>
          Meu perfil
        </MenuItem>}
        <MenuItem onClick={() => encerrar(true)}>
          <ListItemIcon><SwitchAccountOutlinedIcon fontSize="small" /></ListItemIcon>
          Trocar de usuário
        </MenuItem>
        <MenuItem onClick={() => encerrar(false)}>
          <ListItemIcon><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
          Sair
        </MenuItem>
      </Menu>

      {usuario && (
        <Dialog open={perfilAberto} onClose={processando ? undefined : () => setPerfilAberto(false)}
          aria-labelledby="titulo-meu-perfil" fullWidth maxWidth="xs">
          <DialogTitle id="titulo-meu-perfil">Meu perfil</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AvatarConta foto={foto} nome={usuario.nome} tamanho={72} />
                <Box sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                  <Typography fontWeight={700}>{usuario.nome}</Typography>
                  <Typography variant="body2" color="text.secondary">{usuario.email}</Typography>
                  <Typography variant="caption" color="primary.main">{papel}</Typography>
                </Box>
              </Box>
              {aviso && <Alert severity={aviso.tipo}>{aviso.texto}</Alert>}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Button variant="outlined" startIcon={<AddAPhotoOutlinedIcon />} disabled={processando}
                  onClick={() => arquivoRef.current?.click()}>
                  {processando ? "Salvando foto…" : foto ? "Alterar foto" : "Adicionar foto"}
                </Button>
                {foto && <Button onClick={removerFoto} disabled={processando}>Remover foto</Button>}
                <input ref={arquivoRef} type="file" hidden accept={TIPOS_FOTO.join(",")}
                  aria-label="Selecionar foto de perfil" onChange={trocarFoto} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                JPG, PNG ou WebP de até 8 MB. A foto fica salva neste navegador.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPerfilAberto(false)} disabled={processando}>Fechar</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
