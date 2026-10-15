import { formatoCLP, formatoFecha, nombreComuna, nombreRegion } from "../../utils/formato";

/** Boleta/resumen de una orden: cliente, despacho, productos y totales. */
export default function ResumenOrden({ orden }) {
  const { cliente, envio } = orden;

  return (
    <div className="resumen-orden">
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <h3 className="h6 text-uppercase text-body-secondary">Cliente</h3>
          <p className="mb-0">
            {cliente.nombre} {cliente.apellidos}
            <br />
            {cliente.correo}
          </p>
        </div>
        <div className="col-md-6">
          <h3 className="h6 text-uppercase text-body-secondary">{envio.tipo === "retiro" ? "Retiro en tienda" : "Despacho a domicilio"}</h3>
          <p className="mb-0">
            {envio.tipo === "retiro" ? (
              "Av. Providencia 1234, Santiago"
            ) : (
              <>
                {envio.calle} {envio.departamento && `, depto. ${envio.departamento}`}
                <br />
                {nombreComuna(envio.region, envio.comuna)}, {nombreRegion(envio.region)}
              </>
            )}
          </p>
          {envio.indicaciones && <p className="small mb-0">Indicaciones: {envio.indicaciones}</p>}
        </div>
      </div>

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th className="text-end">Precio</th>
              <th className="text-center">Cantidad</th>
              <th className="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orden.items.map((item) => (
              <tr key={item.codigo}>
                <td>{item.nombre}</td>
                <td className="text-end">{formatoCLP(item.precioUnitario)}</td>
                <td className="text-center">{item.cantidad}</td>
                <td className="text-end">{formatoCLP(item.precioUnitario * item.cantidad)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {orden.descuentoCupon > 0 && (
              <tr>
                <td colSpan="3" className="text-end">
                  Descuento cupón {orden.cupon}
                </td>
                <td className="text-end">-{formatoCLP(orden.descuentoCupon)}</td>
              </tr>
            )}
            <tr>
              <td colSpan="3" className="text-end">
                Envío
              </td>
              <td className="text-end">{orden.costoEnvio ? formatoCLP(orden.costoEnvio) : "Gratis"}</td>
            </tr>
            <tr className="fw-bold">
              <td colSpan="3" className="text-end">
                Total
              </td>
              <td className="text-end">{formatoCLP(orden.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="small text-body-secondary mb-0">Fecha: {formatoFecha(orden.fecha)}</p>
    </div>
  );
}
