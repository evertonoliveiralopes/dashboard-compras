import { Fragment, useSyncExternalStore } from "react";
import { Navigate } from "react-router-dom";

function observarToken(notificar) {
  function verificar(evento) {
    if (evento.key === "token" || evento.key === null) notificar();
  }

  window.addEventListener("storage", verificar);
  return () => window.removeEventListener("storage", verificar);
}

function lerToken() {
  return localStorage.getItem("token");
}

export default function PrivateRoute({ children }) {
  const token = useSyncExternalStore(observarToken, lerToken);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Fragment key={token}>{children}</Fragment>;
}
