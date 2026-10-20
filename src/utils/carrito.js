/* =========================================================
   Lógica pura del carrito de compras.
   Reglas:
   - Cada línea se identifica por el código de producto.
   - La cantidad mínima por línea es 1; al bajar de 1 se elimina la línea.
   - La cantidad máxima por línea queda limitada al stock disponible.
   Las funciones NO modifican el carrito recibido: devuelven uno nuevo.
   ========================================================= */
import { CUPONES, COSTO_ENVIO, ENVIO_GRATIS_DESDE } from "../data/datos";
import { precioFinal } from "./formato";

export function agregarItem(carrito, producto, cantidad = 1) {
  if (!producto || producto.stock <= 0) return carrito;
  const existente = carrito.find((item) => item.codigo === producto.codigo);
  if (existente) {
    return carrito.map((item) =>
      item.codigo === producto.codigo ? { ...item, cantidad: Math.min(item.cantidad + cantidad, producto.stock) } : item
    );
  }
  return [...carrito, { codigo: producto.codigo, cantidad: Math.min(cantidad, producto.stock) }];
}

export function cambiarCantidad(carrito, producto, delta) {
  return carrito
    .map((item) => {
      if (item.codigo !== producto.codigo) return item;
      return { ...item, cantidad: Math.min(item.cantidad + delta, producto.stock) };
    })
    .filter((item) => item.cantidad >= 1);
}

export function quitarItem(carrito, codigo) {
  return carrito.filter((item) => item.codigo !== codigo);
}

export function contarItems(carrito) {
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}

/** Une cada línea del carrito con su producto (descarta productos que ya no existen). */
export function detalleCarrito(carrito, productos) {
  return carrito
    .map((item) => {
      const producto = productos.find((p) => p.codigo === item.codigo);
      if (!producto) return null;
      const precioUnitario = precioFinal(producto);
      return { ...item, producto, precioUnitario, totalLinea: precioUnitario * item.cantidad };
    })
    .filter(Boolean);
}

export function calcularSubtotal(carrito, productos) {
  return detalleCarrito(carrito, productos).reduce((total, linea) => total + linea.totalLinea, 0);
}

/** Devuelve el porcentaje del cupón o 0 si no es válido. */
export function porcentajeCupon(codigo) {
  return CUPONES[String(codigo || "").trim().toUpperCase()] || 0;
}

export function calcularEnvio(tipoEnvio, subtotalConDescuento) {
  if (tipoEnvio !== "domicilio") return 0; // retiro en tienda o envío aún no elegido
  return subtotalConDescuento >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
}

/** Calcula todos los montos de una compra. */
export function calcularTotales(carrito, productos, cupon = "", tipoEnvio = null) {
  const subtotal = calcularSubtotal(carrito, productos);
  const descuentoCupon = Math.round((subtotal * porcentajeCupon(cupon)) / 100);
  const costoEnvio = carrito.length ? calcularEnvio(tipoEnvio, subtotal - descuentoCupon) : 0;
  return { subtotal, descuentoCupon, costoEnvio, total: subtotal - descuentoCupon + costoEnvio };
}

/** Lista de líneas cuya cantidad supera el stock actual. */
export function lineasSinStock(carrito, productos) {
  return carrito.filter((item) => {
    const producto = productos.find((p) => p.codigo === item.codigo);
    return !producto || item.cantidad > producto.stock;
  });
}
