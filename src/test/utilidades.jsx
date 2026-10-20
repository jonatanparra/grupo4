/* =========================================================
   Utilidades compartidas por las pruebas.
   ========================================================= */
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { TiendaProvider } from "../context/TiendaContext";
import { crearServicios } from "../data/servicios";

/**
 * Mock de localStorage en memoria. Así cada prueba trabaja con su propia
 * "base de datos" sin tocar el almacenamiento real del navegador.
 */
export function crearAlmacenamientoFalso(datosIniciales = {}) {
  const datos = new Map(Object.entries(datosIniciales));
  return {
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => datos.set(clave, String(valor)),
    removeItem: (clave) => datos.delete(clave),
    clear: () => datos.clear(),
  };
}

/** Servicios de datos sobre un almacenamiento falso, con valores iniciales opcionales. */
export function crearServiciosPrueba({ carrito, sesion } = {}) {
  const iniciales = {};
  if (carrito) iniciales.glitch_carrito = JSON.stringify(carrito);
  if (sesion) iniciales.glitch_sesion = JSON.stringify(sesion);
  return crearServicios(crearAlmacenamientoFalso(iniciales));
}

/** Muestra la ruta actual para comprobar redirecciones en las pruebas. */
function RutaActual() {
  const { pathname } = useLocation();
  return <div data-testid="ruta-actual">{pathname}</div>;
}

/**
 * Renderiza un componente dentro del router y del contexto de la tienda.
 * - ruta: URL inicial (ej: "/producto/GS-001").
 * - patron: patrón de la ruta (ej: "/producto/:codigo") para que funcione useParams.
 * - servicios: servicios de datos (por defecto, sobre un almacenamiento falso).
 */
export function renderConTienda(ui, { ruta = "/", patron = "*", servicios = crearServiciosPrueba() } = {}) {
  const resultado = render(
    <MemoryRouter initialEntries={[ruta]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TiendaProvider servicios={servicios}>
        <Routes>
          <Route path={patron} element={ui} />
          <Route path="*" element={<RutaActual />} />
        </Routes>
        <RutaActualOculta />
      </TiendaProvider>
    </MemoryRouter>
  );
  return { ...resultado, servicios };
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

export const USUARIO_CLIENTE = {
  run: "203344112",
  nombre: "Javiera",
  apellidos: "Contreras Díaz",
  correo: "javiera.contreras@profesor.duoc.cl",
  tipo: "Cliente",
  region: "nuble",
  comuna: "chillan",
  direccion: "Camino Real 789",
};

export const USUARIO_ADMIN = {
  run: "191102207",
  nombre: "Camila",
  apellidos: "Rojas Muñoz",
  correo: "camila.rojas@duoc.cl",
  tipo: "Administrador",
  region: "metropolitana",
  comuna: "santiago",
  direccion: "Av. Siempre Viva 123",
};
