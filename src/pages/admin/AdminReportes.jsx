import { useTienda } from "../../context/TiendaContext";
import { CATEGORIAS } from "../../data/datos";
import EncabezadoAdmin from "../../components/admin/EncabezadoAdmin";
import TarjetaEstadistica from "../../components/admin/TarjetaEstadistica";
import { formatoCLP } from "../../utils/formato";

/** Reportes de ventas calculados en tiempo real a partir de las órdenes pagadas. */
export default function AdminReportes() {
  const { ordenes, productos } = useTienda();
  const pagadas = ordenes.filter((o) => o.estado === "Pagado");
  const ingresos = pagadas.reduce((t, o) => t + o.total, 0);
  const tasaExito = ordenes.length ? Math.round((pagadas.length / ordenes.length) * 100) : 0;

  // Unidades e ingresos por producto
  const porProducto = {};
  pagadas.forEach((o) =>
    o.items.forEach((item) => {
      porProducto[item.codigo] ??= { nombre: item.nombre, unidades: 0, ingresos: 0 };
      porProducto[item.codigo].unidades += item.cantidad;
      porProducto[item.codigo].ingresos += item.cantidad * item.precioUnitario;
    })
  );
  const ranking = Object.entries(porProducto).sort(([, a], [, b]) => b.unidades - a.unidades);

  const porCategoria = CATEGORIAS.map((c) => {
    const codigos = productos.filter((p) => p.categoria === c.nombre).map((p) => p.codigo);
    const ingresosCategoria = codigos.reduce((t, cod) => t + (porProducto[cod]?.ingresos || 0), 0);
    return { ...c, ingresos: ingresosCategoria };
  });
  const maxCategoria = Math.max(1, ...porCategoria.map((c) => c.ingresos));

  return (
    <>
      <EncabezadoAdmin titulo="Reportes" subtitulo="Indicadores calculados con las órdenes registradas." />
      <div className="row row-cols-1 row-cols-sm-3 g-3 mb-4">
        <div className="col"><TarjetaEstadistica valor={formatoCLP(ingresos)} etiqueta="Ingresos totales" /></div>
        <div className="col"><TarjetaEstadistica valor={ordenes.length} etiqueta="Órdenes registradas" /></div>
        <div className="col"><TarjetaEstadistica valor={`${tasaExito}%`} etiqueta="Pagos aprobados" /></div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <section className="card card-body h-100">
            <h2 className="h5">Ingresos por categoría</h2>
            {porCategoria.map((c) => (
              <div key={c.id} className="mb-2">
                <div className="d-flex justify-content-between small">
                  <span>{c.nombre}</span>
                  <span>{formatoCLP(c.ingresos)}</span>
                </div>
                <div className="progress" role="progressbar" aria-label={`Ingresos ${c.nombre}`} aria-valuenow={c.ingresos} aria-valuemin="0" aria-valuemax={maxCategoria}>
                  <div className="progress-bar bg-danger" style={{ width: `${(c.ingresos / maxCategoria) * 100}%` }} />
                </div>
              </div>
            ))}
          </section>
        </div>
        <div className="col-lg-6">
          <section className="card card-body h-100">
            <h2 className="h5">Productos más vendidos</h2>
            {ranking.length ? (
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr><th>Producto</th><th className="text-end">Unidades</th><th className="text-end">Ingresos</th></tr>
                  </thead>
                  <tbody>
                    {ranking.map(([codigo, datos]) => (
                      <tr key={codigo}>
                        <td>{datos.nombre}</td>
                        <td className="text-end">{datos.unidades}</td>
                        <td className="text-end">{formatoCLP(datos.ingresos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mb-0">Aún no hay ventas.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
