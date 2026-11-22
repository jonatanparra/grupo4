import { Link, useParams } from "react-router-dom";
import { BLOGS } from "../data/blogs";
import EstadoVacio from "../components/common/EstadoVacio";

export default function BlogDetalle() {
  const { id } = useParams();
  const blog = BLOGS.find((b) => b.id === id);

  if (!blog) {
    return (
      <div className="container py-5">
        <EstadoVacio titulo="Artículo no encontrado" enlace="/blogs" textoEnlace="Ver blogs" />
      </div>
    );
  }

  return (
    <article className="container py-5 articulo-blog">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/blogs">Blogs</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{blog.titulo}</li>
        </ol>
      </nav>
      <div className="ratio ratio-16x9 mb-4 rounded overflow-hidden">
        <video controls poster={blog.imagen}>
          <source src={blog.video} type="video/mp4" />
          Tu navegador no soporta la reproducción de video.
        </video>
      </div>
      <h1>{blog.titulo}</h1>
      <p>{blog.resumen}</p>
      {blog.puntos.map(([titulo, texto], i) => (
        <p key={titulo}>
          <strong>
            {i + 1}. {titulo}:
          </strong>{" "}
          {texto}
        </p>
      ))}
      <p className="fw-semibold">{blog.cierre}</p>
    </article>
  );
}
