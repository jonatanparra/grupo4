/** Tarjeta con un indicador numérico del dashboard. */
export default function TarjetaEstadistica({ valor, etiqueta, icono, destacada = false }) {
  return (
    <div className={`card h-100 tarjeta-estadistica ${destacada ? "border-danger" : ""}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="tarjeta-estadistica__valor">{valor}</div>
          {icono && <span className="fs-4" aria-hidden="true">{icono}</span>}
        </div>
        <div className="small text-body-secondary">{etiqueta}</div>
      </div>
    </div>
  );
}
