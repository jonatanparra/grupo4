/** Indicador de carga mientras se espera una respuesta del backend. */
export default function Cargando({ mensaje = "Cargando..." }) {
  return (
    <div className="text-center py-5" role="status" aria-live="polite">
      <div className="spinner-border text-danger mb-3" aria-hidden="true" />
      <p className="mb-0">{mensaje}</p>
    </div>
  );
}
