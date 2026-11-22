import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTienda } from "../../context/TiendaContext";
import EncabezadoAdmin from "../../components/admin/EncabezadoAdmin";
import TablaOrdenes, { InsigniaEstado } from "../../components/admin/TablaOrdenes";
import ResumenOrden from "../../components/carrito/ResumenOrden";
import EstadoVacio from "../../components/common/EstadoVacio";
import Alerta from "../../components/common/Alerta";

/** Estados a los que el Administrador puede mover una boleta pagada. */
const ESTADOS = ["Pagado", "Enviado", "Entregado", "Anulado"];

/** Listado de órdenes con filtro por estado. */
export function AdminOrdenes() {
  const { ordenes } = useTienda();
  const [estado, setEstado] = useState("Todas");
  const filtradas = [...ordenes]
    .filter((o) => estado === "Todas" || o.estado === estado)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <>
      <EncabezadoAdmin titulo="Órdenes" subtitulo={`${filtradas.length} órdenes`}>
        <select className="form-select" aria-label="Filtrar por estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option>Todas</option>
          {ESTADOS.map((e) => (
            <option key={e}>{e}</option>
          ))}
          <option>Rechazado</option>
        </select>
      </EncabezadoAdmin>
      <div className="card card-body">
        <TablaOrdenes ordenes={filtradas} />
      </div>
    </>
  );
}

/** Cambio de estado de una boleta (solo Administrador). Anular devuelve el stock. */
function CambiarEstado({ orden }) {
  const { cambiarEstadoOrden } = useTienda();
  const [estado, setEstado] = useState(orden.estado);
  const [mensaje, setMensaje] = useState(null);
  const bloqueada = ["Rechazado", "Anulado"].includes(orden.estado);

  async function guardar() {
    try {
      await cambiarEstadoOrden(orden.id, estado);
      setMensaje({ tipo: "success", texto: `Estado actualizado a ${estado}.` });
    } catch (error) {
      setMensaje({ tipo: "danger", texto: error.message });
    }
  }

  if (bloqueada) return <p className="small text-body-secondary">Una boleta {orden.estado.toLowerCase()} no puede cambiar de estado.</p>;
  return (
    <div className="mb-3">
      <Alerta tipo={mensaje?.tipo} mensaje={mensaje?.texto} onCerrar={() => setMensaje(null)} />
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <label htmlFor="estado-orden" className="form-label mb-0">Cambiar estado</label>
        <select id="estado-orden" className="form-select w-auto" value={estado} onChange={(e) => setEstado(e.target.value)}>
          {ESTADOS.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
        <button type="button" className="btn btn-glitch btn-sm" disabled={estado === orden.estado} onClick={guardar}>
          Guardar estado
        </button>
      </div>
    </div>
  );
}

/** Boleta de una orden. */
export function AdminOrdenDetalle() {
  const { id } = useParams();
  const { ordenes, usuarioActual } = useTienda();
  const orden = ordenes.find((o) => o.id === id);

  if (!orden) return <EstadoVacio titulo="Orden no encontrada" enlace="/admin/ordenes" textoEnlace="Volver a órdenes" />;

  return (
    <>
      <EncabezadoAdmin titulo={`Boleta ${orden.id}`}>
        <button type="button" className="btn btn-outline-light" onClick={() => window.print()}>
          Imprimir
        </button>
        <Link to="/admin/ordenes" className="btn btn-outline-secondary">
          Volver al listado
        </Link>
      </EncabezadoAdmin>
      <div className="card card-body">
        <p>
          Estado: <InsigniaEstado estado={orden.estado} /> {orden.motivoRechazo && <span className="small ms-2">{orden.motivoRechazo}</span>}
        </p>
        {usuarioActual?.tipo === "Administrador" && <CambiarEstado key={orden.id} orden={orden} />}
        <ResumenOrden orden={orden} />
      </div>
    </>
  );
}
