/* =========================================================
   FOLLAJE — Carrito de compras (localStorage)
   Reglas del carrito:
   - Se identifica cada línea por el código de producto.
   - La cantidad mínima por línea es 1; al bajar de 1 se elimina la línea.
   - La cantidad máxima por línea queda limitada al stock disponible.
   - El carrito se guarda en localStorage bajo la clave "follaje_carrito".
   ========================================================= */

const CARRITO_KEY = "follaje_carrito";

function obtenerCarrito() {
  try {
    const data = localStorage.getItem(CARRITO_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("No se pudo leer el carrito:", e);
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  actualizarContadorCarrito();
}

function agregarAlCarrito(codigoProducto, cantidad = 1) {
  const producto = PRODUCTOS.find((p) => p.codigo === codigoProducto);
  if (!producto) return;

  const carrito = obtenerCarrito();
  const linea = carrito.find((item) => item.codigo === codigoProducto);

  if (linea) {
    linea.cantidad = Math.min(linea.cantidad + cantidad, producto.stock);
  } else {
    carrito.push({ codigo: producto.codigo, cantidad: Math.min(cantidad, producto.stock) });
  }

  guardarCarrito(carrito);
}

function cambiarCantidadCarrito(codigoProducto, delta) {
  const producto = PRODUCTOS.find((p) => p.codigo === codigoProducto);
  let carrito = obtenerCarrito();
  const linea = carrito.find((item) => item.codigo === codigoProducto);
  if (!linea) return;

  linea.cantidad += delta;

  if (linea.cantidad < 1) {
    carrito = carrito.filter((item) => item.codigo !== codigoProducto);
  } else if (producto) {
    linea.cantidad = Math.min(linea.cantidad, producto.stock);
  }

  guardarCarrito(carrito);
  if (typeof renderCarritoPagina === "function") renderCarritoPagina();
}

function eliminarDelCarrito(codigoProducto) {
  const carrito = obtenerCarrito().filter((item) => item.codigo !== codigoProducto);
  guardarCarrito(carrito);
  if (typeof renderCarritoPagina === "function") renderCarritoPagina();
}

function totalItemsCarrito() {
  return obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
}

function totalPrecioCarrito() {
  const carrito = obtenerCarrito();
  return carrito.reduce((total, item) => {
    const producto = PRODUCTOS.find((p) => p.codigo === item.codigo);
    return producto ? total + producto.precio * item.cantidad : total;
  }, 0);
}

function actualizarContadorCarrito() {
  document.querySelectorAll("[data-carrito-contador]").forEach((el) => {
    el.textContent = totalItemsCarrito();
  });
}

function formatoCLP(valor) {
  return valor.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

document.addEventListener("DOMContentLoaded", actualizarContadorCarrito);
