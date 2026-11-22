import { formatoCLP, precioFinal, tieneOferta } from "../../utils/formato";

/** Muestra el precio de un producto; si está en oferta, tacha el precio original. */
export default function Precio({ producto, grande = false }) {
  const oferta = tieneOferta(producto);
  return (
    <span className={`precio ${grande ? "precio--grande" : ""}`}>
      {oferta && <del className="precio__anterior me-2">{formatoCLP(producto.precio)}</del>}
      <span className="precio__actual">{formatoCLP(precioFinal(producto))}</span>
    </span>
  );
}
