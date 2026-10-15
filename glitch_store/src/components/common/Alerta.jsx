/** Mensaje de alerta Bootstrap. No renderiza nada si no hay mensaje. */
export default function Alerta({ mensaje, tipo = "success", onCerrar }) {
  if (!mensaje) return null;
  return (
    <div className={`alert alert-${tipo} d-flex justify-content-between align-items-start`} role={tipo === "danger" ? "alert" : "status"}>
      <span>{mensaje}</span>
      {onCerrar && <button type="button" className="btn-close ms-3" aria-label="Cerrar mensaje" onClick={onCerrar} />}
    </div>
  );
}
