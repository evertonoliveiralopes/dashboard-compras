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

const drawerWidth = 260;

export default function MainLayout({ children }) {
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
          <MenuItem icon={<DashboardIcon />} text="Dashboard" />
          <MenuItem icon={<ShoppingCartIcon />} text="Compras" />
          <MenuItem icon={<Inventory2Icon />} text="Produtos" />
          <MenuItem icon={<LocalShippingIcon />} text="Fornecedores" />
          <MenuItem icon={<AnalyticsIcon />} text="Business Intelligence" />
          <MenuItem icon={<PsychologyIcon />} text="Radar do Comprador" />
          <MenuItem icon={<SettingsIcon />} text="Configurações" />
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
            <Typography variant="h6">
              Dashboard
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

function MenuItem({ icon, text }) {
  return (
    <ListItemButton>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItemButton>
  );
}