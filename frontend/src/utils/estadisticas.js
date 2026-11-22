/* =========================================================
   Cálculos para los gráficos del dashboard (funciones puras).
   Reciben las órdenes y productos que entrega la API y devuelven
   los datos ya agrupados, listos para dibujar.
   ========================================================= */
import { esVentaConcretada } from "./formato";

/** Orden fijo de los estados (así cada estado conserva siempre su color). */
export const ESTADOS_ORDEN = ["Pagado", "Enviado", "Entregado", "Rechazado", "Anulado"];

/** Fecha local YYYY-MM-DD (las boletas llegan en UTC; se agrupan por el día de Chile). */
export function diaLocal(fecha) {
  const d = new Date(fecha);
  const dos = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

/**
 * Ingresos por día de las ventas concretadas en los últimos `dias` días (incluido hoy).
 * Devuelve todos los días del período, con 0 los días sin ventas, para que la línea no salte.
 */
export function ventasPorDia(ordenes, dias, hoy = new Date()) {
  const resultado = [];
  const indice = new Map();
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i);
    const punto = { fecha: diaLocal(d), total: 0, ordenes: 0 };
    indice.set(punto.fecha, punto);
    resultado.push(punto);
  }
  ordenes.filter(esVentaConcretada).forEach((o) => {
    const punto = indice.get(diaLocal(o.fecha));
    if (punto) {
      punto.total += o.total;
      punto.ordenes += 1;
    }
  });
  return resultado;
}

/**
 * Igual que ventasPorDia, pero suma de a `diasPorGrupo` días (contando hacia atrás desde hoy).
 * Cada grupo se identifica por su primer día. Con 7 se obtienen semanas.
 */
export function ventasAgrupadas(ordenes, dias, diasPorGrupo = 1, hoy = new Date()) {
  const porDia = ventasPorDia(ordenes, dias, hoy);
  if (diasPorGrupo <= 1) return porDia;
  const grupos = [];
  for (let fin = porDia.length; fin > 0; fin -= diasPorGrupo) {
    const tramo = porDia.slice(Math.max(0, fin - diasPorGrupo), fin);
    grupos.unshift({
      fecha: tramo[0].fecha,
      hasta: tramo.at(-1).fecha,
      total: tramo.reduce((t, d) => t + d.total, 0),
      ordenes: tramo.reduce((t, d) => t + d.ordenes, 0),
    });
  }
  return grupos;
}

/** Ingresos y unidades vendidas por categoría, de mayor a menor ingreso. */
export function ingresosPorCategoria(ordenes, productos, categorias) {
  const categoriaDe = new Map(productos.map((p) => [p.codigo, p.categoria]));
  const totales = new Map(categorias.map((c) => [c.nombre, { id: c.id, nombre: c.nombre, ingresos: 0, unidades: 0 }]));
  ordenes.filter(esVentaConcretada).forEach((o) =>
    o.items.forEach((item) => {
      const fila = totales.get(categoriaDe.get(item.codigo));
      if (!fila) return; // producto eliminado: ya no se sabe su categoría
      fila.ingresos += item.precioUnitario * item.cantidad;
      fila.unidades += item.cantidad;
    })
  );
  return [...totales.values()].sort((a, b) => b.ingresos - a.ingresos || a.nombre.localeCompare(b.nombre));
}

/** Cantidad y porcentaje de órdenes por estado (solo los estados presentes, en orden fijo). */
export function ordenesPorEstado(ordenes) {
  const total = ordenes.length;
  return ESTADOS_ORDEN.map((estado) => {
    const cantidad = ordenes.filter((o) => o.estado === estado).length;
    return { estado, cantidad, porcentaje: total ? Math.round((cantidad / total) * 100) : 0 };
  }).filter((fila) => fila.cantidad > 0);
}

/**
 * Productos con nivel crítico definido, ordenados del más al menos urgente
 * (stock / stock crítico). Los primeros son los que hay que reponer antes.
 */
export function stockFrenteACritico(productos, limite = 8) {
  return productos
    .filter((p) => p.stockCritico !== null && p.stockCritico !== undefined && p.stockCritico > 0)
    .map((p) => ({ codigo: p.codigo, nombre: p.nombre, stock: p.stock, stockCritico: p.stockCritico, critico: p.stock <= p.stockCritico }))
    .sort((a, b) => a.stock / a.stockCritico - b.stock / b.stockCritico || a.nombre.localeCompare(b.nombre))
    .slice(0, limite);
}

/** Marcas "redondas" para un eje que parte en 0 (0, 10.000, 20.000...). */
export function marcasEje(maximo, cantidad = 4) {
  if (maximo <= 0) return [0, 1];
  const pasoBruto = maximo / cantidad;
  const magnitud = 10 ** Math.floor(Math.log10(pasoBruto));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * magnitud).find((p) => p >= pasoBruto);
  const marcas = [];
  for (let v = 0; v < maximo + paso; v += paso) marcas.push(Math.round(v));
  return marcas;
}
