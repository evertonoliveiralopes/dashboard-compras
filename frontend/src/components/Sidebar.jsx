import SettingsIcon from "@mui/icons-material/Settings";

<ListItemButton
    component={Link}
    to="/configuracao-alertas"
>
    <ListItemIcon>
        <SettingsIcon />
    </ListItemIcon>

    <ListItemText
        primary="Configuração de Alertas"
    />
</ListItemButton>