import { Link } from "react-router-dom";

/** Tabla de usuarios con acciones Ver / Editar / Eliminar. */
export default function TablaUsuarios({ usuarios, onEliminar, runActual }) {
  if (!usuarios.length) return <p className="text-body-secondary mb-0">No hay usuarios para mostrar.</p>;

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>RUN</th>
            <th>Nombre</th>
            <th className="d-none d-md-table-cell">Correo</th>
            <th>Tipo</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.run}>
              <td>{u.run}</td>
              <td>
                {u.nombre} {u.apellidos}
              </td>
              <td className="d-none d-md-table-cell">{u.correo}</td>
              <td>
                <span className="badge rounded-pill border border-danger text-danger">{u.tipo}</span>
              </td>
              <td className="text-end text-nowrap">
                <Link to={`/admin/usuarios/${u.run}`} className="btn btn-sm btn-outline-light me-1">
                  Ver
                </Link>
                <Link to={`/admin/usuarios/${u.run}/editar`} className="btn btn-sm btn-outline-secondary me-1">
                  Editar
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  disabled={u.run === runActual}
                  title={u.run === runActual ? "No puedes eliminar tu propia cuenta" : undefined}
                  onClick={() => onEliminar(u)}
                  aria-label={`Eliminar ${u.nombre}`}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
