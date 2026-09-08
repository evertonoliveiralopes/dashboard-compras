import { useState } from "react";

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import FileUploadIcon from "@mui/icons-material/FileUpload";

import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 260;

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = useMediaQuery("(max-width:600px)");
  const [mobileOpen, setMobileOpen] = useState(false);

  const titulos = {
    "/dashboard": "Dashboard",
    "/produtos": "Produtos",
    "/importacoes": "Importações",
    "/configuracao-alertas": "Configuração de Alertas",
  };

  const tituloPagina = titulos[location.pathname] || "Compra360";

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleNavigate = (path) => {
    navigate(path);

    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const menu = (
    <>
      <Toolbar>
        <Typography variant="h6" fontWeight="bold">
          Compra360
        </Typography>
      </Toolbar>

      <Divider />

      <List>
        <MenuItem
          icon={<DashboardIcon />}
          text="Dashboard"
          onClick={() => handleNavigate("/dashboard")}
        />

        <MenuItem
          icon={<ShoppingCartIcon />}
          text="Compras"
        />

        <MenuItem
          icon={<Inventory2Icon />}
          text="Produtos"
          onClick={() => handleNavigate("/produtos")}
        />

        <MenuItem
          icon={<FileUploadIcon />}
          text="Importações"
          onClick={() => handleNavigate("/importacoes")}
        />

        <MenuItem
          icon={<LocalShippingIcon />}
          text="Fornecedores"
        />

        <MenuItem
          icon={<AnalyticsIcon />}
          text="Business Intelligence"
        />

        <MenuItem
          icon={<PsychologyIcon />}
          text="Radar do Comprador"
        />

        <MenuItem
          icon={<SettingsIcon />}
          text="Configurações"
          onClick={() => handleNavigate("/configuracao-alertas")}
        />
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Menu lateral */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: "80vw",
              maxWidth: 300,
              boxSizing: "border-box",
            },
          }}
        >
          {menu}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {menu}
        </Drawer>
      )}

      {/* Área principal */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="static"
          elevation={0}
          color="inherit"
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: { xs: 1.5, sm: 3 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                minWidth: 0,
              }}
            >
              {isMobile && (
                <IconButton
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 1 }}
                  aria-label="abrir menu"
                >
                  <MenuIcon />
                </IconButton>
              )}

              <Typography
                variant="h6"
                fontWeight="600"
                noWrap
              >
                {tituloPagina}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 2 },
              }}
            >
              <Typography
                sx={{
                  display: { xs: "none", sm: "block" },
                }}
              >
                Administrador
              </Typography>

              <IconButton>
                <Avatar>
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            p: { xs: 1.5, sm: 3 },
            bgcolor: "#F5F7FA",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

function MenuItem({ icon, text, onClick }) {
  return (
    <ListItemButton onClick={onClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItemButton>
  );
}