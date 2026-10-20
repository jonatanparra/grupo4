/** Botones tipo "pill" para filtrar por categoría. La categoría activa queda resaltada. */
export default function FiltroCategorias({ categorias, activa, onSeleccionar }) {
  return (
    <div className="d-flex flex-wrap gap-2 filtros-categoria" role="group" aria-label="Filtrar por categoría">
      {["Todas", ...categorias].map((categoria) => (
        <button
          key={categoria}
          type="button"
          className={`btn btn-sm rounded-pill ${categoria === activa ? "btn-glitch" : "btn-outline-secondary"}`}
          aria-pressed={categoria === activa}
          onClick={() => onSeleccionar(categoria)}
        >
          {categoria}
        </button>
      ))}
    </div>
  );
}
