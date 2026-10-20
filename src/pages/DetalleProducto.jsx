import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";
import Precio from "../components/common/Precio";
import Boton from "../components/common/Boton";
import SelectorCantidad from "../components/common/SelectorCantidad";
import InsigniaStock from "../components/common/InsigniaStock";
import EstadoVacio from "../components/common/EstadoVacio";
import GrillaProductos from "../components/productos/GrillaProductos";
import { categoriaPorNombre, esStockCritico } from "../utils/formato";

export default function DetalleProducto() {
  const { codigo } = useParams();
  const { productos, agregarAlCarrito } = useTienda();
  const producto = productos.find((p) => p.codigo === codigo);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");

  if (!producto) {
    return (
      <div className="container py-5">
        <EstadoVacio titulo="Producto no encontrado" mensaje="El producto que buscas no existe o fue retirado." enlace="/productos" textoEnlace="Volver al catálogo" />
      </div>
    );
  }

  const categoria = categoriaPorNombre(producto.categoria);
  const relacionados = productos.filter((p) => p.categoria === producto.categoria && p.codigo !== producto.codigo).slice(0, 4);

  function agregar() {
    agregarAlCarrito(producto.codigo, cantidad);
    setMensaje(`Agregaste ${cantidad} × ${producto.nombre} al carrito.`);
    setCantidad(1);
  }

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item">
            {categoria ? <Link to={`/categorias/${categoria.id}`}>{producto.categoria}</Link> : producto.categoria}
          </li>
          <li className="breadcrumb-item active" aria-current="page">{producto.nombre}</li>
        </ol>
      </nav>

      <div className="row g-5">
        <div className="col-md-6">
          <div className="detalle-producto__galeria rounded p-4 d-flex justify-content-center">
            <img src={producto.imagen} alt={producto.nombre} className="img-fluid" />
          </div>
        </div>
        <div className="col-md-6">
          <p className="tarjeta-producto__categoria mb-1">{producto.categoria}</p>
          <h1 className="h2">{producto.nombre}</h1>
          <div className="fs-3 mb-3">
            <Precio producto={producto} grande />
            {producto.descuento > 0 && <span className="badge text-bg-danger ms-2 align-middle">-{producto.descuento}%</span>}
          </div>
          <p>{producto.descripcion}</p>
          <p className="mb-3">
            <InsigniaStock producto={producto} prefijo={esStockCritico(producto) ? "¡Quedan pocas unidades!" : "Disponibles:"} />
          </p>

          {producto.stock > 0 ? (
            <div className="row g-2 align-items-center">
              <div className="col-6 col-sm-4">
                <SelectorCantidad cantidad={cantidad} max={producto.stock} onCambiar={setCantidad} />
              </div>
              <div className="col-12 col-sm-8">
                <Boton etiqueta="Añadir al carrito" ancho onClick={agregar} />
              </div>
            </div>
          ) : (
            <p className="text-danger fw-semibold">Producto agotado por ahora.</p>
          )}

          {mensaje && (
            <div className="alert alert-success mt-3 d-flex justify-content-between align-items-center" role="status">
              <span>{mensaje}</span>
              <Link to="/carrito" className="btn btn-sm btn-outline-light">
                Ver carrito
              </Link>
            </div>
          )}
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-5">
          <h2 className="h3 mb-3">También te puede interesar</h2>
          <GrillaProductos productos={relacionados} onAgregar={agregarAlCarrito} />
        </section>
      )}
    </div>
  );
}
