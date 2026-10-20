import { useTienda } from "../context/TiendaContext";
import { CATEGORIAS } from "../data/datos";
import TarjetaCategoria from "../components/productos/TarjetaCategoria";

/** Vista que separa el catálogo por categorías. */
export default function Categorias() {
  const { productos } = useTienda();

  return (
    <div className="container py-5">
      <h1>Categorías</h1>
      <p>Elige un género y descubre todos los juegos que tenemos para ti.</p>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
        {CATEGORIAS.map((c) => (
          <div className="col" key={c.id}>
            <TarjetaCategoria categoria={c} cantidad={productos.filter((p) => p.categoria === c.nombre).length} />
          </div>
        ))}
      </div>
    </div>
  );
}
