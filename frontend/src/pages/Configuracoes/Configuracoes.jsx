import { useContext } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Alert, Box, ButtonBase, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";

import { AuthContext } from "../../context/AuthContext";
import ConfiguracaoAlertas from "../ConfiguracaoAlertas/ConfiguracaoAlertas";
import Cadastros from "./Cadastros";

const secoes = [
  { id: "empresas", titulo: "Empresas", icone: ApartmentOutlinedIcon, administrativo: true },
  { id: "usuarios", titulo: "Usuários", icone: GroupsOutlinedIcon, administrativo: true },
  { id: "permissoes", titulo: "Permissões", icone: AdminPanelSettingsOutlinedIcon, administrativo: true },
  { id: "alertas", titulo: "Alertas", icone: NotificationsOutlinedIcon, administrativo: false },
];

export default function Configuracoes() {
  const sessao = useContext(AuthContext);
  const { secao } = useParams();
  if (!sessao) return <LinearProgress aria-label="Carregando configurações" />;
  if (sessao.erro) return <Alert severity="error">Não foi possível confirmar o seu perfil de acesso.</Alert>;

  const { usuario } = sessao;
  const visiveis = secoes.filter(({ administrativo }) => !administrativo || usuario.administrador);
  const ativa = secao ?? visiveis[0].id;

  if (!secoes.some(({ id }) => id === ativa)) return <Navigate to="/configuracoes" replace />;

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 1480, mx: "auto" }}>
      <Typography component="h1" variant="h4" sx={{ color: "#142742", fontSize: { xs: 25, md: 30 }, letterSpacing: "-0.035em" }}>
        Configurações gerais
      </Typography>
      <Box component="nav" aria-label="Seções de configurações" sx={{
        display: "grid", gap: 1.25,
        gridTemplateColumns: { xs: "repeat(auto-fit, minmax(min(100%, 138px), 1fr))", lg: "repeat(" + visiveis.length + ", minmax(0, 1fr))" },
      }}>
        {visiveis.map(({ id, titulo, icone: Icone }) => (
          <Paper key={id} variant="outlined" sx={{ borderRadius: 2.5, overflow: "hidden",
            borderColor: ativa === id ? "#9DBFE9" : "divider", bgcolor: ativa === id ? "#EDF5FF" : "background.paper" }}>
            <ButtonBase component={Link} to={"/configuracoes/" + id} aria-current={ativa === id ? "page" : undefined}
              sx={{ width: "100%", minHeight: 64, px: { xs: 1.25, sm: 2 }, py: 1, gap: 1.25,
                justifyContent: "flex-start", textAlign: "left", color: ativa === id ? "#174D91" : "#263F5A",
                "&:hover, &.Mui-focusVisible": { bgcolor: "#E9F2FD" } }}>
              <Icone fontSize="small" />
              <Typography variant="body2" fontWeight={700}>{titulo}</Typography>
            </ButtonBase>
          </Paper>
        ))}
      </Box>
      {!visiveis.some(({ id }) => id === ativa) ? (
        <Alert severity="warning">Somente administradores podem acessar esta seção.</Alert>
      ) : ativa === "alertas" ? <ConfiguracaoAlertas /> : <Cadastros key={ativa} tipo={ativa} usuarioId={usuario.id} />}
    </Stack>
  );
}
