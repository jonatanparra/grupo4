import { REGIONES } from "../data/datos";

/** Formatea un número como pesos chilenos: 13990 → "$13.990". */
export function formatoCLP(valor) {
  return Number(valor || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

/** true si el producto tiene un descuento vigente. */
export function tieneOferta(producto) {
  return Number(producto?.descuento) > 0;
}

/** Precio final aplicando el descuento de oferta (redondeado a pesos). */
export function precioFinal(producto) {
  if (!tieneOferta(producto)) return producto.precio;
  return Math.round(producto.precio * (1 - producto.descuento / 100));
}

/** true si el stock está en o bajo el nivel crítico. */
export function esStockCritico(producto) {
  return producto.stockCritico !== null && producto.stockCritico !== undefined && producto.stock <= producto.stockCritico;
}

export function nombreRegion(regionId) {
  return REGIONES.find((r) => r.id === regionId)?.nombre || regionId || "—";
}

export function nombreComuna(regionId, comunaId) {
  const region = REGIONES.find((r) => r.id === regionId);
  return region?.comunas.find((c) => c.id === comunaId)?.nombre || comunaId || "—";
}

export function formatoFecha(iso) {
  return new Date(iso).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
}

/** Estados de boleta que corresponden a una venta concretada (se cobró y no se anuló). */
export const ESTADOS_VENTA = ["Pagado", "Enviado", "Entregado"];

export function esVentaConcretada(orden) {
  return ESTADOS_VENTA.includes(orden.estado);
}
