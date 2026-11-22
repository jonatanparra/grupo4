/** Título de una vista del panel con acciones a la derecha (botones/enlaces como children). */
export default function EncabezadoAdmin({ titulo, subtitulo, children }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 className="h2 mb-0">{titulo}</h1>
        {subtitulo && <p className="mb-0 small">{subtitulo}</p>}
      </div>
      {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
