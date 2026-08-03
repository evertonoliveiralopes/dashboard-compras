import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1565C0",
    },

    secondary: {
      main: "#00ACC1",
    },

    success: {
      main: "#2E7D32",
    },

    warning: {
      main: "#F9A825",
    },

    error: {
      main: "#D32F2F",
    },

    background: {
      default: "#F4F7FB",
      paper: "#FFFFFF",
    },
  },

  typography: {
    fontFamily: "Roboto, Arial, sans-serif",

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 600,
    },

    h6: {
      fontWeight: 600,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 10,
  },
});

export default theme;