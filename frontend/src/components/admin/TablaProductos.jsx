import { Link } from "react-router-dom";
import InsigniaStock from "../common/InsigniaStock";
import { formatoCLP, precioFinal } from "../../utils/formato";

/** Tabla de productos del panel. Las acciones de edición solo aparecen si puedeEditar es true. */
export default function TablaProductos({ productos, onEliminar, puedeEditar = true }) {
  if (!productos.length) return <p className="text-body-secondary mb-0">No hay productos para mostrar.</p>;

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th className="d-none d-md-table-cell">Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.codigo}>
              <td className="text-nowrap">{p.codigo}</td>
              <td>{p.nombre}</td>
              <td className="d-none d-md-table-cell">{p.categoria}</td>
              <td className="text-nowrap">
                {formatoCLP(precioFinal(p))}
                {p.descuento > 0 && <span className="badge text-bg-danger ms-1">-{p.descuento}%</span>}
              </td>
              <td>
                <InsigniaStock producto={p} prefijo="" />
              </td>
              <td className="text-end text-nowrap">
                <Link to={`/admin/productos/${p.codigo}`} className="btn btn-sm btn-outline-light me-1">
                  Ver
                </Link>
                {puedeEditar && (
                  <>
                    <Link to={`/admin/productos/${p.codigo}/editar`} className="btn btn-sm btn-outline-secondary me-1">
                      Editar
                    </Link>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(p)} aria-label={`Eliminar ${p.nombre}`}>
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
