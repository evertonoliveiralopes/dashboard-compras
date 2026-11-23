import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import RadarIcon from "@mui/icons-material/Radar";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import simboloCompra360 from "../assets/images/compra360-simbolo.png";
import SeletorLoja from "../components/dashboard/SeletorLoja";
import MenuConta from "../components/conta/MenuConta";
import { AuthContext } from "../context/AuthContext";
import { buscarUsuarioAtual, encerrarSessao } from "../services/authService";
import "./MainLayout.css";

const PREFERENCIA_MENU = "compra360:menu-recolhido";
const paginas = [
  { path: "/dashboard", label: "Dashboard", icon: SpaceDashboardOutlinedIcon },
  { path: "/compras", label: "Compras", icon: ShoppingCartOutlinedIcon, exibirTitulo: true },
  { path: "/produtos", label: "Produtos", icon: Inventory2OutlinedIcon, exibirTitulo: true },
  { path: "/importacoes", label: "Importações", icon: UploadFileOutlinedIcon },
  { path: "/fornecedores", label: "Fornecedores", icon: LocalShippingOutlinedIcon },
  { path: "/business-intelligence", label: "Gira", icon: AutoGraphOutlinedIcon },
  { path: "/radar", label: "Radar do Comprador", icon: RadarIcon, exibirTitulo: true },
  { path: "/configuracoes", label: "Configurações", icon: SettingsOutlinedIcon },
];

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuRecolhido, setMenuRecolhido] = useState(() => localStorage.getItem(PREFERENCIA_MENU) === "1");
  const [sessao, setSessao] = useState(null);
  const [lojaSelecionada, setLojaSelecionada] = useState(() => JSON.parse(localStorage.getItem("lojaSelecionada")));

  const compacto = !isMobile && menuRecolhido;
  const largura = compacto ? 72 : 248;
  const pagina = paginas.find(({ path }) => pathname === path || pathname.startsWith(path + "/"));
  const titulo = pagina?.label || "Compra360";
  const acaoMenu = compacto ? "Expandir menu lateral" : "Recolher menu lateral";

  useEffect(() => {
    let ativo = true;
    buscarUsuarioAtual().then((usuario) => {
      if (ativo) setSessao({ usuario });
    }).catch(() => {
      if (ativo) setSessao({ erro: true });
    });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    const atualizarLoja = (evento) => setLojaSelecionada(evento.detail);
    window.addEventListener("lojaSelecionadaAlterada", atualizarLoja);
    return () => window.removeEventListener("lojaSelecionadaAlterada", atualizarLoja);
  }, []);

  function alterarLoja(loja) {
    localStorage.setItem("lojaSelecionada", JSON.stringify(loja));
    window.dispatchEvent(new CustomEvent("lojaSelecionadaAlterada", { detail: loja }));
  }

  function recolherOuExpandir() {
    setMenuRecolhido(!menuRecolhido);
    localStorage.setItem(PREFERENCIA_MENU, menuRecolhido ? "0" : "1");
  }

  function sairDaConta(trocaUsuario) {
    encerrarSessao();
    navigate("/", { replace: true, state: { trocaUsuario } });
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ width: isMobile ? 0 : largura, flexShrink: 0 }}
        slotProps={{
          paper: {
            id: "menu-lateral-compra360",
            className: compacto ? "compra-sidebar compra-sidebar--compacta" : "compra-sidebar",
            sx: { width: isMobile ? "min(288px, 88vw)" : largura },
          },
        }}
      >
        <Box className="compra-sidebar-marca">
          <Box className="compra-sidebar-logotipo">
            <img src={simboloCompra360} alt={compacto ? "Compra360" : ""} width="38" height="38" />
            {!compacto && <span>Compra<span className="compra-sidebar-marca-number">360</span></span>}
          </Box>
          {isMobile ? (
            <IconButton className="compra-sidebar-toggle" aria-label="Fechar menu lateral" onClick={() => setMobileOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : (
            <Tooltip title={acaoMenu} placement="right">
              <IconButton className="compra-sidebar-toggle" aria-label={acaoMenu} aria-expanded={!compacto}
                aria-controls="menu-lateral-compra360" onClick={recolherOuExpandir}>
                {compacto ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box component="nav" className="compra-sidebar-nav" aria-label="Menu principal">
          <List disablePadding>
            {paginas.map(({ path, label, icon: Icon }) => (
              <Box component="li" className="compra-sidebar-item" key={path}>
                <Tooltip title={compacto ? label : ""} placement="right">
                  <ListItemButton component={NavLink} to={path} aria-label={label} className="compra-sidebar-link"
                    onClick={() => setMobileOpen(false)}>
                    <ListItemIcon><Icon /></ListItemIcon>
                    {!compacto && <ListItemText primary={label} />}
                  </ListItemButton>
                </Tooltip>
              </Box>
            ))}
          </List>
        </Box>

        <Box className="compra-sidebar-controles">
          <SeletorLoja lojaSelecionada={lojaSelecionada} onChange={alterarLoja} lateral compacto={compacto} />
          <MenuConta key={sessao?.usuario?.id} usuario={sessao?.usuario} encerrar={sairDaConta} compacto={compacto} />
        </Box>
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, bgcolor: "background.default" }}>
        {isMobile && (
          <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Toolbar variant="dense" sx={{ gap: 1, minHeight: 52 }}>
              <IconButton edge="start" aria-label="Abrir menu lateral" aria-expanded={mobileOpen}
                aria-controls={mobileOpen ? "menu-lateral-compra360" : undefined} onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Typography fontWeight={700} noWrap>{titulo}</Typography>
            </Toolbar>
          </AppBar>
        )}
        <Box component="main" sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>
          {!isMobile && pagina?.exibirTitulo && (
            <Typography component="h1" variant="h5" sx={{ mb: 2, color: "#142742", fontWeight: 700 }}>{titulo}</Typography>
          )}
          <AuthContext.Provider value={sessao}>{children}</AuthContext.Provider>
        </Box>
      </Box>
    </Box>
  );
}
