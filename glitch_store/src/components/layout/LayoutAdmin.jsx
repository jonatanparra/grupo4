import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTienda } from "../../context/TiendaContext";

const SECCIONES = [
  { ruta: "/admin", texto: "📊 Dashboard", fin: true },
  { ruta: "/admin/ordenes", texto: "🧾 Órdenes" },
  { ruta: "/admin/productos", texto: "🎮 Productos" },
  { ruta: "/admin/productos-criticos", texto: "⚠️ Stock crítico" },
  { ruta: "/admin/usuarios", texto: "👤 Usuarios", soloAdmin: true },
  { ruta: "/admin/reportes", texto: "📈 Reportes" },
];

/** Layout del panel administrativo: barra lateral (colapsable en móvil) + contenido. */
export default function LayoutAdmin() {
  const { usuarioActual, cerrarSesion } = useTienda();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navegar = useNavigate();
  const secciones = SECCIONES.filter((s) => !s.soloAdmin || usuarioActual?.tipo === "Administrador");

  function salir() {
    cerrarSesion();
    navegar("/login");
  }

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <aside className="col-12 col-md-3 col-xl-2 admin-sidebar p-0">
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary-subtle">
            <span className="d-flex align-items-center gap-2">
              <img src="/img/logo.png" alt="Glitch Store" className="marca__logo" />
              <span className="badge rounded-pill border border-danger text-danger">admin</span>
            </span>
            <button
              type="button"
              className="btn btn-outline-light btn-sm d-md-none"
              aria-expanded={menuAbierto}
              aria-label="Mostrar menú del panel"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              ☰
            </button>
          </div>
          <nav className={`nav flex-column py-2 ${menuAbierto ? "" : "d-none"} d-md-flex`}>
            {secciones.map((s) => (
              <NavLink key={s.ruta} to={s.ruta} end={s.fin} className="nav-link admin-sidebar__enlace" onClick={() => setMenuAbierto(false)}>
                {s.texto}
              </NavLink>
            ))}
            <hr className="my-2" />
            <Link to="/" className="nav-link admin-sidebar__enlace">
              ← Volver a la tienda
            </Link>
            <button type="button" className="nav-link admin-sidebar__enlace text-start border-0 bg-transparent" onClick={salir}>
              Cerrar sesión
            </button>
          </nav>
        </aside>

        <main className="col-12 col-md-9 col-xl-10 admin-main p-3 p-lg-4">
          <div className="d-flex justify-content-end mb-2">
            <span className="badge rounded-pill text-bg-dark border">
              {usuarioActual?.nombre} · {usuarioActual?.tipo}
            </span>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
