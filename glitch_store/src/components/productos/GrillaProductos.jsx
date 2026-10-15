import TarjetaProducto from "./TarjetaProducto";
import EstadoVacio from "../common/EstadoVacio";

/** Grilla responsiva (1 → 2 → 3 → 4 columnas) con una tarjeta por producto. */
export default function GrillaProductos({ productos, onAgregar, mensajeVacio = "No encontramos productos con esos filtros." }) {
  if (!productos.length) return <EstadoVacio titulo="Sin resultados" mensaje={mensajeVacio} />;

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
      {productos.map((producto) => (
        <div className="col" key={producto.codigo}>
          <TarjetaProducto producto={producto} onAgregar={onAgregar} />
        </div>
      ))}
    </div>
  );
}
