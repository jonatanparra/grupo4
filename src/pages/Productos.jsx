import { useMemo, useState } from "react";
import { useTienda } from "../context/TiendaContext";
import { CATEGORIAS } from "../data/datos";
import BarraBusqueda from "../components/productos/BarraBusqueda";
import FiltroCategorias from "../components/productos/FiltroCategorias";
import GrillaProductos from "../components/productos/GrillaProductos";
import { filtrarProductos } from "../utils/filtros";

/** Catálogo completo con búsqueda, filtro por categoría, solo ofertas y orden. */
export default function Productos() {
  const { productos, agregarAlCarrito } = useTienda();
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [orden, setOrden] = useState("relevancia");

  const resultado = useMemo(
    () => filtrarProductos(productos, { texto, categoria, soloOfertas, orden }),
    [productos, texto, categoria, soloOfertas, orden]
  );

  return (
    <div className="container py-5">
      <h1>Productos</h1>
      <p>Busca, filtra por categoría u ordena el catálogo completo de terror, acción, narrativa e indie.</p>

      <div className="row g-3 align-items-center mb-3">
        <div className="col-12 col-lg-6">
          <BarraBusqueda valor={texto} onCambiar={setTexto} />
        </div>
        <div className="col-7 col-sm-6 col-lg-3">
          <select className="form-select" aria-label="Ordenar productos" value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="relevancia">Orden: destacados</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="nombre">Nombre (A-Z)</option>
          </select>
        </div>
        <div className="col-5 col-sm-6 col-lg-3">
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="solo-ofertas" checked={soloOfertas} onChange={(e) => setSoloOfertas(e.target.checked)} />
            <label className="form-check-label" htmlFor="solo-ofertas">
              Solo ofertas
            </label>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <FiltroCategorias categorias={CATEGORIAS.map((c) => c.nombre)} activa={categoria} onSeleccionar={setCategoria} />
      </div>

      <p className="small text-body-secondary" aria-live="polite">
        {resultado.length} {resultado.length === 1 ? "resultado" : "resultados"}
      </p>
      <GrillaProductos productos={resultado} onAgregar={agregarAlCarrito} />
    </div>
  );
}
