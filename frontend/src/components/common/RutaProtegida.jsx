import { Navigate, useLocation } from "react-router-dom";
import { useTienda } from "../../context/TiendaContext";
import Cargando from "./Cargando";
import EstadoVacio from "./EstadoVacio";

/**
 * Restringe una interfaz a usuarios con sesión y con alguno de los roles permitidos.
 * - Mientras el backend confirma la sesión (recarga de página) muestra "Verificando sesión".
 * - Sin sesión → login (y después vuelve a la página que pidió).
 * - Con sesión pero sin el rol → "Acceso denegado".
 * Es una ayuda de interfaz: la protección real está en el backend, que rechaza
 * con 401/403 cualquier petición sin token o sin el rol adecuado.
 */
export default function RutaProtegida({ roles, children }) {
  const { usuarioActual, verificandoSesion } = useTienda();
  const ubicacion = useLocation();

  if (verificandoSesion) return <Cargando mensaje="Verificando sesión..." />;
  if (!usuarioActual) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  if (roles && !roles.includes(usuarioActual.tipo)) {
    return (
      <div className="container py-5">
        <EstadoVacio titulo="Acceso denegado" mensaje={`Tu perfil (${usuarioActual.tipo}) no tiene permisos para ver esta sección.`} enlace="/" textoEnlace="Volver a la tienda" />
      </div>
    );
  }
  return children;
}
