import { Link } from "react-router-dom";
import { formatoCLP, formatoFecha } from "../../utils/formato";

export function InsigniaEstado({ estado }) {
  return <span className={`badge ${estado === "Pagado" ? "text-bg-success" : "text-bg-danger"}`}>{estado}</span>;
}

/** Listado de órdenes (boletas) con su estado y enlace al detalle. */
export default function TablaOrdenes({ ordenes }) {
  if (!ordenes.length) return <p className="text-body-secondary mb-0">No hay órdenes registradas.</p>;

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>N° orden</th>
            <th className="d-none d-md-table-cell">Fecha</th>
            <th>Cliente</th>
            <th className="text-end">Total</th>
            <th>Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((o) => (
            <tr key={o.id}>
              <td className="text-nowrap">{o.id}</td>
              <td className="d-none d-md-table-cell text-nowrap">{formatoFecha(o.fecha)}</td>
              <td>
                {o.cliente.nombre} {o.cliente.apellidos}
              </td>
              <td className="text-end text-nowrap">{formatoCLP(o.total)}</td>
              <td>
                <InsigniaEstado estado={o.estado} />
              </td>
              <td className="text-end">
                <Link to={`/admin/ordenes/${o.id}`} className="btn btn-sm btn-outline-light">
                  Ver boleta
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
