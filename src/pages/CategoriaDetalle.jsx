import { Link, useParams } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";
import { CATEGORIAS } from "../data/datos";
import GrillaProductos from "../components/productos/GrillaProductos";
import EstadoVacio from "../components/common/EstadoVacio";
import { categoriaPorId } from "../utils/formato";

/** Productos de una categoría (/categorias/:id) con acceso rápido a las demás. */
export default function CategoriaDetalle() {
  const { id } = useParams();
  const { productos, agregarAlCarrito } = useTienda();
  const categoria = categoriaPorId(id);

  if (!categoria) {
    return (
      <div className="container py-5">
        <EstadoVacio titulo="Categoría no encontrada" mensaje="La categoría que buscas no existe." enlace="/categorias" textoEnlace="Ver categorías" />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/categorias">Categorías</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{categoria.nombre}</li>
        </ol>
      </nav>
      <h1>{categoria.nombre}</h1>
      <p>{categoria.descripcion}</p>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {CATEGORIAS.map((c) => (
          <Link key={c.id} to={`/categorias/${c.id}`} className={`btn btn-sm rounded-pill ${c.id === id ? "btn-glitch" : "btn-outline-secondary"}`}>
            {c.nombre}
          </Link>
        ))}
      </div>

      <GrillaProductos
        productos={productos.filter((p) => p.categoria === categoria.nombre)}
        onAgregar={agregarAlCarrito}
        mensajeVacio="Aún no hay productos en esta categoría."
      />
    </div>
  );
}
