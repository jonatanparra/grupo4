import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIAS } from "../../data/datos";
import { validarCorreo } from "../../utils/validaciones";

/** Pie de página con enlaces y suscripción al newsletter (validada). */
export default function PiePagina() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState(null);

  function suscribir(evento) {
    evento.preventDefault();
    const error = validarCorreo(correo);
    setMensaje(error ? { tipo: "danger", texto: error } : { tipo: "success", texto: "¡Listo! Te avisaremos de las novedades." });
    if (!error) setCorreo("");
  }

  return (
    <footer className="pie mt-5">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6 col-lg-3">
            <img src="/img/logo.png" alt="Glitch Store" className="marca__logo mb-2" />
            <p>Tienda online de videojuegos con despacho a todo Chile.</p>
          </div>
          <div className="col-6 col-lg-3">
            <h4 className="h6">Categorías</h4>
            <ul className="list-unstyled">
              {CATEGORIAS.map((c) => (
                <li key={c.id}>
                  <Link to={`/categorias/${c.id}`}>{c.nombre}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h4 className="h6">Empresa</h4>
            <ul className="list-unstyled">
              <li><Link to="/nosotros">Nosotros</Link></li>
              <li><Link to="/blogs">Blogs</Link></li>
              <li><Link to="/ofertas">Ofertas</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <h4 className="h6">Mantente al día</h4>
            <p>Lanzamientos, ofertas y noticias del catálogo.</p>
            <form className="input-group" onSubmit={suscribir} noValidate>
              <input
                type="email"
                className="form-control"
                placeholder="Tu correo"
                aria-label="Correo para newsletter"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
              <button type="submit" className="btn btn-glitch">
                Unirme
              </button>
            </form>
            {mensaje && <div className={`small mt-1 text-${mensaje.tipo}`}>{mensaje.texto}</div>}
          </div>
        </div>
        <div className="pie__inferior d-flex flex-wrap justify-content-between gap-2 small">
          <span>© {new Date().getFullYear()} Glitch Store. Proyecto académico DSY1104.</span>
          <span>Santiago, Chile</span>
        </div>
      </div>
    </footer>
  );
}
