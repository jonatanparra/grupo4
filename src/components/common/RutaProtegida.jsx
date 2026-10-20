import { Navigate, useLocation } from "react-router-dom";
import { useTienda } from "../../context/TiendaContext";

/** Solo deja pasar a usuarios con sesión iniciada y con alguno de los roles permitidos. */
export default function RutaProtegida({ roles, children }) {
  const { usuarioActual } = useTienda();
  const ubicacion = useLocation();

  if (!usuarioActual) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  if (roles && !roles.includes(usuarioActual.tipo)) return <Navigate to="/" replace />;
  return children;
}
