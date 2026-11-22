import { Link } from "react-router-dom";

/** Tarjeta de una categoría con su imagen y cantidad de productos. */
export default function TarjetaCategoria({ categoria, cantidad }) {
  return (
    <Link to={`/categorias/${categoria.id}`} className="card h-100 tarjeta-categoria text-decoration-none">
      <img src={categoria.imagen} alt="" className="card-img-top tarjeta-categoria__imagen" loading="lazy" />
      <div className="card-body">
        <h3 className="h5 mb-1">{categoria.nombre}</h3>
        <p className="small mb-2">{categoria.descripcion}</p>
        <span className="badge text-bg-secondary">
          {cantidad} {cantidad === 1 ? "producto" : "productos"}
        </span>
      </div>
    </Link>
  );
}
