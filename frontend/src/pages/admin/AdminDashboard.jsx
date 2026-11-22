import { Link } from "react-router-dom";
import { useTienda } from "../../context/TiendaContext";
import EncabezadoAdmin from "../../components/admin/EncabezadoAdmin";
import TarjetaEstadistica from "../../components/admin/TarjetaEstadistica";
import TablaOrdenes from "../../components/admin/TablaOrdenes";
import GraficoVentas from "../../components/admin/graficos/GraficoVentas";
import GraficoEstados from "../../components/admin/graficos/GraficoEstados";
import GraficoCategorias from "../../components/admin/graficos/GraficoCategorias";
import GraficoStock from "../../components/admin/graficos/GraficoStock";
import { esStockCritico, esVentaConcretada, formatoCLP } from "../../utils/formato";

/** Dashboard del Administrador: indicadores, 4 gráficos y últimas órdenes. */
export default function AdminDashboard({ hoy }) {
  const { productos, categorias, usuarios, ordenes, usuarioActual } = useTienda();
  const pagadas = ordenes.filter(esVentaConcretada);
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

      <div className="row g-4 mb-4">
        <div className="col-xl-8">
          <GraficoVentas ordenes={ordenes} hoy={hoy} />
        </div>
        <div className="col-xl-4">
          <GraficoEstados ordenes={ordenes} />
        </div>
        <div className="col-xl-6">
          <GraficoCategorias ordenes={ordenes} productos={productos} categorias={categorias} />
        </div>
        <div className="col-xl-6">
          <GraficoStock productos={productos} />
        </div>
      </div>

      <section className="card card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="h5 mb-0">Últimas órdenes</h2>
          <Link to="/admin/ordenes" className="small link-danger">Ver todas</Link>
        </div>
        <TablaOrdenes ordenes={ultimas} />
      </section>
    </>
  );
}
