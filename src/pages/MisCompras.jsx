import { useTienda } from "../context/TiendaContext";
import { InsigniaEstado } from "../components/admin/TablaOrdenes";
import ResumenOrden from "../components/carrito/ResumenOrden";
import EstadoVacio from "../components/common/EstadoVacio";
import Cargando from "../components/common/Cargando";
import { formatoCLP, formatoFecha } from "../utils/formato";

/** Historial de compras del usuario con sesión (GET /api/v1/boletas/mias para el Cliente). */
export default function MisCompras() {
  const { ordenes, usuarioActual, datosRol } = useTienda();
  const propias = ordenes.filter(
    (o) => o.usuarioRun === usuarioActual.run || o.cliente.correo.toLowerCase() === usuarioActual.correo.toLowerCase()
  );

  if (datosRol.cargando) return <Cargando mensaje="Cargando tus compras..." />;

  return (
    <div className="container py-5">
      <h1>Mis compras</h1>
      {!propias.length ? (
        <EstadoVacio titulo="Aún no tienes compras" mensaje="Cuando compres, tus boletas aparecerán aquí." enlace="/productos" textoEnlace="Ir a la tienda" />
      ) : (
        <div className="d-flex flex-column gap-3">
          {propias.map((o) => (
            <details key={o.id} className="card card-body">
              <summary className="d-flex flex-wrap gap-3 align-items-center">
                <strong>{o.id}</strong>
                <span className="text-body-secondary">{formatoFecha(o.fecha)}</span>
                <InsigniaEstado estado={o.estado} />
                <span className="ms-auto fw-semibold">{formatoCLP(o.total)}</span>
              </summary>
              <div className="mt-3">
                <ResumenOrden orden={o} />
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
