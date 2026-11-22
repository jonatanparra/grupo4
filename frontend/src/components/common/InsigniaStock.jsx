import { esStockCritico } from "../../utils/formato";

/** Insignia con el stock; se marca en rojo cuando está en nivel crítico o agotado. */
export default function InsigniaStock({ producto, prefijo = "Stock:" }) {
  if (producto.stock <= 0) return <span className="badge text-bg-dark border border-danger">Agotado</span>;
  const critico = esStockCritico(producto);
  return (
    <span className={`badge ${critico ? "text-bg-danger" : "text-bg-secondary"}`}>
      {prefijo} {producto.stock}
      {critico && " · crítico"}
    </span>
  );
}
