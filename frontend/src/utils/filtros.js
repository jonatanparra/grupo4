import { precioFinal, tieneOferta } from "./formato";

/** Quita tildes y pasa a minúsculas para comparar textos ("Acción" ≈ "accion"). */
export function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const ORDENES = {
  relevancia: () => 0,
  "precio-asc": (a, b) => precioFinal(a) - precioFinal(b),
  "precio-desc": (a, b) => precioFinal(b) - precioFinal(a),
  nombre: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
};

/** Filtra y ordena productos según texto, categoría, ofertas y criterio de orden. */
export function filtrarProductos(productos, { texto = "", categoria = "Todas", soloOfertas = false, orden = "relevancia" } = {}) {
  const buscado = normalizar(texto.trim());
  return productos
    .filter((p) => categoria === "Todas" || p.categoria === categoria)
    .filter((p) => !soloOfertas || tieneOferta(p))
    .filter((p) => !buscado || normalizar(p.nombre).includes(buscado) || normalizar(p.descripcion).includes(buscado))
    .sort(ORDENES[orden] || ORDENES.relevancia);
}
