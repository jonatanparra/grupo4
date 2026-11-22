import { Link } from "react-router-dom";
import SelectorCantidad from "../common/SelectorCantidad";
import { formatoCLP } from "../../utils/formato";

/** Una fila del carrito: imagen, nombre, precio unitario, cantidad y total de la línea. */
export default function LineaCarrito({ linea, onCambiarCantidad, onQuitar }) {
  const { producto, cantidad, precioUnitario, totalLinea } = linea;

  return (
    <div className="row g-3 align-items-center py-3 border-bottom linea-carrito" data-testid="linea-carrito">
      <div className="col-3 col-md-2">
        <img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded linea-carrito__imagen" />
      </div>
      <div className="col-9 col-md-4">
        <Link to={`/producto/${producto.codigo}`} className="fw-semibold linea-carrito__nombre">
          {producto.nombre}
        </Link>
        <div className="small text-body-secondary">{formatoCLP(precioUnitario)} c/u</div>
        <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => onQuitar(producto.codigo)}>
          Quitar
        </button>
      </div>
      <div className="col-7 col-md-3">
        <SelectorCantidad
          cantidad={cantidad}
          min={0}
          max={producto.stock}
          onCambiar={(nueva) => onCambiarCantidad(producto.codigo, nueva - cantidad)}
          etiqueta={`Cantidad de ${producto.nombre}`}
        />
      </div>
      <div className="col-5 col-md-3 text-end fw-bold precio__actual">{formatoCLP(totalLinea)}</div>
    </div>
  );
}
