import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Precio from "../common/Precio";
import Boton from "../common/Boton";
import { tieneOferta } from "../../utils/formato";

/** Tarjeta de un producto en la vitrina. Avisa al padre con onAgregar(codigo). */
export default function TarjetaProducto({ producto, onAgregar }) {
  const [agregado, setAgregado] = useState(false);
  const agotado = producto.stock <= 0;

  // Vuelve el botón a su texto original después de mostrar la confirmación.
  useEffect(() => {
    if (!agregado) return undefined;
    const temporizador = setTimeout(() => setAgregado(false), 1200);
    return () => clearTimeout(temporizador);
  }, [agregado]);

  function manejarAgregar() {
    onAgregar(producto.codigo);
    setAgregado(true);
  }

  return (
    <article className="card h-100 tarjeta-producto" data-testid="tarjeta-producto">
      <Link to={`/producto/${producto.codigo}`} className="tarjeta-producto__imagen-link position-relative">
        {tieneOferta(producto) && <span className="badge text-bg-danger position-absolute top-0 start-0 m-2">-{producto.descuento}%</span>}
        <img src={producto.imagen} alt={producto.nombre} className="card-img-top tarjeta-producto__imagen" loading="lazy" />
      </Link>
      <div className="card-body d-flex flex-column gap-1">
        <p className="tarjeta-producto__categoria mb-0">{producto.categoria}</p>
        <Link to={`/producto/${producto.codigo}`} className="tarjeta-producto__nombre">
          {producto.nombre}
        </Link>
        <div className="mt-auto pt-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <Precio producto={producto} />
          <Boton
            tamano="sm"
            onClick={manejarAgregar}
            disabled={agotado}
            etiqueta={agotado ? "Agotado" : agregado ? "Añadido ✓" : "Añadir"}
            aria-label={`Añadir ${producto.nombre} al carrito`}
          />
        </div>
      </div>
    </article>
  );
}
