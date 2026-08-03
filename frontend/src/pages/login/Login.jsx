import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import { login } from "../../services/authService";
import logo from "../../assets/images/compra360-logo.png";
import ilustracao from "../../assets/images/ilustracao-compra360.png";
import {
  Box,
  Button,
  Card,
  TextField,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setErro("");
      setLoading(true);

      const resposta = await login(email, senha);

      localStorage.setItem(
        "token",
        resposta.access_token
      );

      navigate("/lojas");

    } catch (error) {

      setErro("E-mail ou senha inválidos.");

    } finally {

      setLoading(false);

    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${ilustracao})`,
        
        // 👇 AQUI ESTÁ A MÁGICA PARA DIMINUIR A IMAGEM
        backgroundSize: "80", // Tente também "80%", ou "100% auto" se quiser testar tamanhos
        backgroundPosition: "right center", // Alinha a ilustração à direita
        backgroundColor: "#ffffff", // Adicione a cor exata do fundo da sua imagem aqui
        backgroundRepeat: "no-repeat",
        
        alignItems: "center",
        justifyContent: "flex-start", 
        px: { xs: 2, sm: 6, md: 12, lg: 16 }, 
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* CONTAINER ESQUERDO: Agora ele é mais largo para o logo poder crescer livremente */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 800, // Limite geral aumentado para comportar um logo grande
          zIndex: 1, 
        }}
      >
        {/* Logotipo */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <img
            src={logo}
            alt="Compra360"
            style={{
              width: "100%",
              // 👇 AQUI VOCÊ CONTROLA O TAMANHO DO LOGO!
              // Você pode aumentar esse valor (ex: 500px, 600px) conforme a sua necessidade.
              maxWidth: "600px", 
              height: "auto",
              display: "block",
            }}
          />
        </Box>

        {/* Card do Formulário de Login - O limite de 400px fica apenas para o formulário agora */}
        <Card
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 400, // Mantém o formulário compacto, independente do tamanho do logo
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0px 15px 35px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="E-mail"
              variant="outlined"
              margin="normal"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  backgroundColor: "#FFFFFF",
                },
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              margin="normal"
              required
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  backgroundColor: "#FFFFFF",
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="alternar visibilidade da senha"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {erro && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
              >
                {erro}
              </Alert>
            )}  

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 3,
                height: 50,
                borderRadius: 2.5,
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                backgroundColor: "#0B2559",
                "&:hover": {
                  backgroundColor: "#07183B",
                },
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Link
                href="#"
                underline="hover"
                variant="body2"
                sx={{ color: "#64748B", fontWeight: 500 }}
              >
                Esqueceu a senha?
              </Link>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}