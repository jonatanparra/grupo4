const EQUIPO = [
  { nombre: "Williams Rivera", rol: "Estructura de vistas y estilos" },
  { nombre: "Jonatan Parra", rol: "Validaciones y carrito de compras" },
  { nombre: "Vicente Azócar", rol: "Vista de administrador y control de versiones" },
];

export default function Nosotros() {
  return (
    <div className="container py-5">
      <div className="row g-5 align-items-start">
        <div className="col-md-6">
          <img src="/img/nosotros.png" alt="Equipo de Glitch Store" className="img-fluid rounded" />
        </div>
        <div className="col-md-6">
          <h1>Detrás de Glitch Store</h1>
          <p>
            Todo comenzó con una idea: crear una página dedicada a los videojuegos. Como estudiantes y aficionados al mundo gaming, decidimos crear
            Glitch Store como un espacio para reunir juegos de PlayStation 4 y compartirlos con otros jugadores que buscan descubrir su próxima
            aventura.
          </p>
          <p>
            Hoy el catálogo incluye títulos de distintos géneros, desde terror y acción hasta grandes historias y mundos por explorar. Y aunque por
            ahora el enfoque está en PS4, la idea es seguir creciendo y, próximamente, incorporar nuevas plataformas y muchos más juegos.
          </p>
          <p className="fw-semibold">Esto es solo el primer nivel.</p>

          <h2 className="h3 mt-4">El equipo de desarrollo</h2>
          <p>Proyecto de la asignatura DSY1104 — Desarrollo Fullstack II, DuocUC.</p>
          <ul className="list-group">
            {EQUIPO.map((integrante) => (
              <li key={integrante.nombre} className="list-group-item">
                <strong>{integrante.nombre}</strong> · {integrante.rol}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
