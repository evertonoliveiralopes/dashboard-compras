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
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 260;

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const titulos = {
    "/dashboard": "Dashboard",
    "/produtos": "Produtos",
    "/configuracao-alertas": "Configuração de Alertas",
  };

  const tituloPagina = titulos[location.pathname] || "Compra360";

  return (
    <Box sx={{ display: "flex" }}>
      {/* Menu lateral */}
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
            onClick={() => navigate("/dashboard")}
          />

          <MenuItem
            icon={<ShoppingCartIcon />}
            text="Compras"
          />

          <MenuItem
            icon={<Inventory2Icon />}
            text="Produtos"
            onClick={() => navigate("/produtos")}
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
            onClick={() => navigate("/configuracao-alertas")}
          />
        </List>
      </Drawer>

      {/* Área principal */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          elevation={0}
          color="inherit"
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" fontWeight="600">
              {tituloPagina}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography>
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
            p: 3,
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