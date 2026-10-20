import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTienda } from "../../context/TiendaContext";
import EncabezadoAdmin from "../../components/admin/EncabezadoAdmin";
import TablaOrdenes, { InsigniaEstado } from "../../components/admin/TablaOrdenes";
import ResumenOrden from "../../components/carrito/ResumenOrden";
import EstadoVacio from "../../components/common/EstadoVacio";

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
          <option>Pagado</option>
          <option>Rechazado</option>
        </select>
      </EncabezadoAdmin>
      <div className="card card-body">
        <TablaOrdenes ordenes={filtradas} />
      </div>
    </>
  );
}

/** Boleta de una orden. */
export function AdminOrdenDetalle() {
  const { id } = useParams();
  const { ordenes } = useTienda();
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
        <ResumenOrden orden={orden} />
      </div>
    </>
  );
}
