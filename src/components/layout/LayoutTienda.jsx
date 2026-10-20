import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Encabezado from "./Encabezado";
import PiePagina from "./PiePagina";

/** Estructura común de la tienda pública: encabezado + contenido de la ruta + pie. */
export default function LayoutTienda() {
  const { pathname } = useLocation();

  // Al cambiar de página, vuelve al inicio (como una navegación tradicional).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Encabezado />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <PiePagina />
    </div>
  );
}
