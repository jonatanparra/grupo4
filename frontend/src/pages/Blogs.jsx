import { Link } from "react-router-dom";
import { BLOGS } from "../data/blogs";

export default function Blogs() {
  return (
    <div className="container py-5">
      <h1>Notas desde la tienda</h1>
      <p>Recomendaciones, curiosidades y novedades para explorar cada rincón del universo gaming, donde cada glitch puede llevarte a algo nuevo.</p>

      <div className="d-grid gap-4 mt-4">
        {BLOGS.map((blog) => (
          <article key={blog.id} className="card overflow-hidden">
            <div className="row g-0">
              <div className="col-md-5">
                <img src={blog.imagen} alt="" className="img-fluid h-100 w-100 object-fit-cover tarjeta-blog__imagen" />
              </div>
              <div className="col-md-7">
                <div className="card-body p-4 d-flex flex-column h-100">
                  <h2 className="h4">{blog.titulo}</h2>
                  <p className="flex-grow-1">{blog.resumen}</p>
                  <Link to={`/blogs/${blog.id}`} className="btn btn-outline-light align-self-start">
                    Ver caso
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
