/** Selector numérico controlado con botones − / +, limitado entre min y max. */
export default function SelectorCantidad({ cantidad, min = 1, max, onCambiar, etiqueta = "Cantidad" }) {
  return (
    <div className="input-group selector-cantidad" role="group" aria-label={etiqueta}>
      <button
        type="button"
        className="btn btn-outline-secondary"
        aria-label="Disminuir cantidad"
        disabled={cantidad <= min}
        onClick={() => onCambiar(cantidad - 1)}
      >
        −
      </button>
      <input type="text" className="form-control text-center" value={cantidad} readOnly aria-label={etiqueta} />
      <button
        type="button"
        className="btn btn-outline-secondary"
        aria-label="Aumentar cantidad"
        disabled={max !== undefined && cantidad >= max}
        onClick={() => onCambiar(cantidad + 1)}
      >
        +
      </button>
    </div>
  );
}
