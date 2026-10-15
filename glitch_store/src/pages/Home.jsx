import { Link } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";
import { CATEGORIAS } from "../data/datos";
import GrillaProductos from "../components/productos/GrillaProductos";
import TarjetaCategoria from "../components/productos/TarjetaCategoria";
import { tieneOferta } from "../utils/formato";

export default function Home() {
  const { productos, agregarAlCarrito } = useTienda();
  const ofertas = productos.filter(tieneOferta).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="container py-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <h1 className="hero__titulo">Entra al Glitch, encuentra tu juego</h1>
              <p className="lead">
                Seleccionamos videojuegos de terror, acción y narrativa para quienes buscan algo más que otro estreno del momento. Catálogo curado,
                precios justos y despacho a todo Chile.
              </p>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <Link to="/productos" className="btn btn-glitch btn-lg">
                  Ver catálogo
                </Link>
                <Link to="/ofertas" className="btn btn-outline-light btn-lg">
                  Ver ofertas
                </Link>
              </div>
            </div>
            <div className="col-lg-6 order-first order-lg-last">
              <img src="/img/logo-index.jpeg" alt="Ilustración de Glitch Store" className="img-fluid rounded hero__imagen" />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
          <h2 className="mb-0">Explora por categoría</h2>
          <Link to="/categorias" className="link-danger">
            Ver todas →
          </Link>
        </div>
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
          {CATEGORIAS.map((c) => (
            <div className="col" key={c.id}>
              <TarjetaCategoria categoria={c} cantidad={productos.filter((p) => p.categoria === c.nombre).length} />
            </div>
          ))}
        </div>
      </section>

      {ofertas.length > 0 && (
        <section className="container py-4">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
            <h2 className="mb-0">Ofertas del momento</h2>
            <Link to="/ofertas" className="link-danger">
              Ver todas las ofertas →
            </Link>
          </div>
          <GrillaProductos productos={ofertas} onAgregar={agregarAlCarrito} />
        </section>
      )}

      <section className="container py-5">
        <h2 className="mb-4">Recién llegados a la tienda</h2>
        <GrillaProductos productos={productos.slice(0, 8)} onAgregar={agregarAlCarrito} />
        <div className="text-center mt-4">
          <Link to="/productos" className="btn btn-glitch">
            Ver todos los productos
          </Link>
        </div>
      </section>
    </>
  );
}
