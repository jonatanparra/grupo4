import { useTienda } from "../context/TiendaContext";
import GrillaProductos from "../components/productos/GrillaProductos";
import { formatoCLP, precioFinal, tieneOferta } from "../utils/formato";

/** Todos los productos en oferta, ordenados del mayor al menor descuento. */
export default function Ofertas() {
  const { productos, agregarAlCarrito } = useTienda();
  const ofertas = productos.filter(tieneOferta).sort((a, b) => b.descuento - a.descuento);
  const ahorroTotal = ofertas.reduce((total, p) => total + (p.precio - precioFinal(p)), 0);

  return (
    <div className="container py-5">
      <div className="ofertas-banner rounded p-4 mb-4">
        <h1 className="mb-1">Ofertas glitch</h1>
        <p className="mb-0">
          {ofertas.length} juegos con descuento. Ahorra hasta {formatoCLP(ahorroTotal)} si te llevas todos.
        </p>
      </div>
      <GrillaProductos productos={ofertas} onAgregar={agregarAlCarrito} mensajeVacio="Por ahora no hay ofertas activas. ¡Vuelve pronto!" />
    </div>
  );
}
