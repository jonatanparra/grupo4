/* =========================================================
   Utilidades compartidas por las pruebas.
   ========================================================= */
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { TiendaProvider, useTienda } from "../context/TiendaContext";
import { crearApiFalsa } from "./apiFalsa";
import { USUARIOS } from "./datosPrueba";

export { crearApiFalsa, crearAlmacenamientoFalso } from "./apiFalsa";

/** Muestra la ruta actual para comprobar redirecciones en las pruebas. */
function RutaActual() {
  const { pathname } = useLocation();
  return <div data-testid="ruta-actual">{pathname}</div>;
}

/** Siempre presente (fuera de Routes) para leer la ruta después de navegar. */
function RutaActualOculta() {
  const { pathname } = useLocation();
  return (
    <span hidden data-testid="ubicacion">
      {pathname}
    </span>
  );
}

/** Expone el estado del contexto para saber cuándo terminó de cargar. */
function Sonda({ sonda }) {
  sonda.contexto = useTienda();
  return null;
}

/**
 * Espera (reintentando) hasta que la condición se cumpla. En Jasmine un expect fallido
 * no lanza excepción, por eso waitFor(() => expect(...)) no reintenta: aquí se lanza a mano.
 */
export function esperarQue(condicion, descripcion = "la condición") {
  return waitFor(() => {
    if (!condicion()) throw new Error(`No se cumplió: ${descripcion}`);
  });
}

/** Espera a que el contexto termine de pedir catálogo, sesión y datos del rol a la API. */
export async function esperarCarga(sonda) {
  await waitFor(() => {
    const c = sonda.contexto;
    if (!c || c.catalogo.cargando || c.verificandoSesion || c.datosRol.cargando) throw new Error("La tienda aún está cargando");
  });
}

/**
 * Renderiza un componente dentro del router y del contexto de la tienda, y espera a que
 * terminen las peticiones iniciales a la API (falsa).
 * - ruta: URL inicial (ej: "/producto/GS-001").
 * - patron: patrón de la ruta (ej: "/producto/:codigo") para que funcione useParams.
 * - api: API simulada (por defecto, una nueva con los datos de prueba).
 */
export async function renderConTienda(ui, { ruta = "/", patron = "*", api = crearApiFalsa() } = {}) {
  const sonda = {};
  const resultado = render(
    <MemoryRouter initialEntries={[ruta]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TiendaProvider api={api}>
        <Sonda sonda={sonda} />
        <Routes>
          <Route path={patron} element={ui} />
          <Route path="*" element={<RutaActual />} />
        </Routes>
        <RutaActualOculta />
      </TiendaProvider>
    </MemoryRouter>
  );
  await esperarCarga(sonda);
  return { ...resultado, api, sonda };
}

const sinContrasena = ({ contrasena, ...usuario }) => usuario;

export const USUARIO_ADMIN = sinContrasena(USUARIOS[0]);
export const USUARIO_VENDEDOR = sinContrasena(USUARIOS[1]);
export const USUARIO_CLIENTE = sinContrasena(USUARIOS[2]);
