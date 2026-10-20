import { Link } from "react-router-dom";
import { useTienda } from "../../context/TiendaContext";
import EncabezadoAdmin from "../../components/admin/EncabezadoAdmin";
import TarjetaEstadistica from "../../components/admin/TarjetaEstadistica";
import TablaProductos from "../../components/admin/TablaProductos";
import TablaOrdenes from "../../components/admin/TablaOrdenes";
import { esStockCritico, formatoCLP } from "../../utils/formato";

export default function AdminDashboard() {
  const { productos, usuarios, ordenes, usuarioActual } = useTienda();
  const pagadas = ordenes.filter((o) => o.estado === "Pagado");
  const ventas = pagadas.reduce((total, o) => total + o.total, 0);
  const criticos = productos.filter(esStockCritico);
  const ultimas = [...ordenes].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);

  return (
    <>
      <EncabezadoAdmin titulo={`¡Hola, ${usuarioActual?.nombre}!`} subtitulo="Resumen de la actividad de la tienda." />

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
        <div className="col">
          <TarjetaEstadistica valor={formatoCLP(ventas)} etiqueta={`Ventas (${pagadas.length} órdenes pagadas)`} icono="💰" />
        </div>
        <div className="col">
          <TarjetaEstadistica valor={productos.length} etiqueta="Productos publicados" icono="🎮" />
        </div>
        <div className="col">
          <TarjetaEstadistica valor={usuarios.length} etiqueta="Usuarios registrados" icono="👤" />
        </div>
        <div className="col">
          <TarjetaEstadistica valor={criticos.length} etiqueta="Productos con stock crítico" icono="⚠️" destacada={criticos.length > 0} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-6">
          <section className="card card-body h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h5 mb-0">Stock crítico</h2>
              <Link to="/admin/productos-criticos" className="small link-danger">Ver todos</Link>
            </div>
            <TablaProductos productos={criticos} puedeEditar={false} />
          </section>
        </div>
        <div className="col-xl-6">
          <section className="card card-body h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h5 mb-0">Últimas órdenes</h2>
              <Link to="/admin/ordenes" className="small link-danger">Ver todas</Link>
            </div>
            <TablaOrdenes ordenes={ultimas} />
          </section>
        </div>
      </div>
    </>
  );
}
