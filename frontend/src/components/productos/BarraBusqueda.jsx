/** Campo de búsqueda controlado; avisa cada cambio de texto con onCambiar(texto). */
export default function BarraBusqueda({ valor, onCambiar, placeholder = "Buscar por nombre o descripción..." }) {
  return (
    <div className="input-group">
      <span className="input-group-text" aria-hidden="true">
        🔍
      </span>
      <input
        type="search"
        className="form-control"
        placeholder={placeholder}
        aria-label="Buscar productos"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
      />
      {valor && (
        <button type="button" className="btn btn-outline-secondary" onClick={() => onCambiar("")}>
          Limpiar
        </button>
      )}
    </div>
  );
}
