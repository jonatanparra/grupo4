/* =========================================================
   GLITCH STORE — Datos de referencia de la interfaz
   Regiones/comunas y reglas que el frontend usa para validar y
   mostrar montos antes de enviar al backend. Los productos,
   categorías, usuarios y boletas viven en la base de datos Oracle
   y se obtienen desde la API REST (ver src/api).
   Las reglas de cupones y envío son las mismas del backend
   (CalculadoraCompra.java), que es quien calcula el total real.
   ========================================================= */

// ---------- Regiones y comunas ----------
export const REGIONES = [
  {
    id: "metropolitana",
    nombre: "Región Metropolitana de Santiago",
    comunas: [
      { id: "santiago", nombre: "Santiago" },
      { id: "providencia", nombre: "Providencia" },
      { id: "las-condes", nombre: "Las Condes" },
      { id: "nunoa", nombre: "Ñuñoa" },
      { id: "maipu", nombre: "Maipú" },
    ],
  },
  {
    id: "araucania",
    nombre: "Región de la Araucanía",
    comunas: [
      { id: "temuco", nombre: "Temuco" },
      { id: "villarrica", nombre: "Villarrica" },
      { id: "pucon", nombre: "Pucón" },
      { id: "angol", nombre: "Angol" },
    ],
  },
  {
    id: "nuble",
    nombre: "Región de Ñuble",
    comunas: [
      { id: "chillan", nombre: "Chillán" },
      { id: "san-carlos", nombre: "San Carlos" },
      { id: "bulnes", nombre: "Bulnes" },
    ],
  },
];

// Dominios de correo permitidos en todo el sitio
export const DOMINIOS_CORREO_PERMITIDOS = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

// Cupones de descuento válidos (código → porcentaje)
export const CUPONES = { GLITCH10: 10, DUOC15: 15 };

// Despacho: costo fijo y monto desde el cual es gratis
export const COSTO_ENVIO = 3990;
export const ENVIO_GRATIS_DESDE = 50000;

export const TIPOS_USUARIO = ["Administrador", "Vendedor", "Cliente"];