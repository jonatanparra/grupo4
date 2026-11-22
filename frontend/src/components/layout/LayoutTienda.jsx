import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTienda } from "../../context/TiendaContext";
import Encabezado from "./Encabezado";
import PiePagina from "./PiePagina";
import Cargando from "../common/Cargando";
import ErrorConexion from "../common/ErrorConexion";

/**
 * Estructura común de la tienda pública: encabezado + contenido de la ruta + pie.
 * Mientras llega el catálogo desde la API muestra un indicador de carga.
 */
export default function LayoutTienda() {
  const { pathname } = useLocation();
  const { catalogo, cargarCatalogo } = useTienda();

  // Al cambiar de página, vuelve al inicio (como una navegación tradicional).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Encabezado />
      <main className="flex-grow-1">
        {catalogo.cargando ? (
          <Cargando mensaje="Cargando la tienda..." />
        ) : catalogo.error ? (
          <ErrorConexion mensaje={catalogo.error} onReintentar={cargarCatalogo} />
        ) : (
          <Outlet />
        )}
      </main>
      <PiePagina />
    </div>
  );
}
