import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTienda } from "../../context/TiendaContext";
import { contarItems } from "../../utils/carrito";

const ENLACES = [
  { ruta: "/", texto: "Home" },
  { ruta: "/productos", texto: "Productos" },
  { ruta: "/categorias", texto: "Categorías" },
  { ruta: "/ofertas", texto: "Ofertas" },
  { ruta: "/nosotros", texto: "Nosotros" },
  { ruta: "/blogs", texto: "Blogs" },
  { ruta: "/contacto", texto: "Contacto" },
];

/** Barra de navegación responsiva (Bootstrap navbar). El menú móvil se abre/cierra con estado de React. */
export default function Encabezado() {
  const { carrito, usuarioActual, cerrarSesion } = useTienda();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navegar = useNavigate();
  const cerrarMenu = () => setMenuAbierto(false);
  const esStaff = usuarioActual && ["Administrador", "Vendedor"].includes(usuarioActual.tipo);

  function salir() {
    cerrarSesion();
    cerrarMenu();
    navegar("/");
  }

  return (
    <header className="encabezado sticky-top">
      <nav className="navbar navbar-expand-xl">
        <div className="container">
          <Link to="/" className="navbar-brand" onClick={cerrarMenu}>
            <img src="/img/logo.png" alt="Glitch Store" className="marca__logo" />
          </Link>

          <div className="d-flex align-items-center gap-2 order-xl-last">
            <Link to="/carrito" className="btn btn-outline-light btn-sm carrito-boton" aria-label="Ver carrito" onClick={cerrarMenu}>
              🛒 <span className="badge text-bg-danger" data-testid="contador-carrito">{contarItems(carrito)}</span>
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              aria-controls="menu-principal"
              aria-expanded={menuAbierto}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>

          <div className={`collapse navbar-collapse ${menuAbierto ? "show" : ""}`} id="menu-principal">
            <ul className="navbar-nav mx-auto mb-2 mb-xl-0">
              {ENLACES.map((enlace) => (
                <li className="nav-item" key={enlace.ruta}>
                  <NavLink to={enlace.ruta} end={enlace.ruta === "/"} className="nav-link" onClick={cerrarMenu}>
                    {enlace.texto}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="d-flex flex-column flex-xl-row gap-2 align-items-xl-center me-xl-3 small">
              {usuarioActual ? (
                <>
                  <span className="text-body-secondary">Hola, {usuarioActual.nombre}</span>
                  {esStaff && (
                    <Link to="/admin" className="link-danger" onClick={cerrarMenu}>
                      Panel admin
                    </Link>
                  )}
                  <button type="button" className="btn btn-link btn-sm p-0 text-start link-light" onClick={salir}>
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="link-light" onClick={cerrarMenu}>
                    Iniciar sesión
                  </Link>
                  <Link to="/registro" className="link-light" onClick={cerrarMenu}>
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
