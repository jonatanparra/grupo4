import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTienda } from "../../context/TiendaContext";
import EncabezadoAdmin from "../../components/admin/EncabezadoAdmin";
import TablaProductos from "../../components/admin/TablaProductos";
import FormularioProducto from "../../components/admin/FormularioProducto";
import BarraBusqueda from "../../components/productos/BarraBusqueda";
import InsigniaStock from "../../components/common/InsigniaStock";
import EstadoVacio from "../../components/common/EstadoVacio";
import Alerta from "../../components/common/Alerta";
import { esStockCritico, formatoCLP, precioFinal } from "../../utils/formato";
import { filtrarProductos } from "../../utils/filtros";

function usePuedeEditar() {
  return useTienda().usuarioActual?.tipo === "Administrador";
}

/** Listado de productos con búsqueda y eliminación (con confirmación). */
export function AdminProductos() {
  const { productos, eliminarProducto } = useTienda();
  const puedeEditar = usePuedeEditar();
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState("");
  const filtrados = useMemo(() => filtrarProductos(productos, { texto }), [productos, texto]);

  function eliminar(producto) {
    if (window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) {
      eliminarProducto(producto.codigo);
      setAviso(`Producto "${producto.nombre}" eliminado.`);
    }
  }

  return (
    <>
      <EncabezadoAdmin titulo="Productos" subtitulo={`${productos.length} productos en el catálogo`}>
        {puedeEditar && (
          <Link to="/admin/productos/nuevo" className="btn btn-glitch">
            + Nuevo producto
          </Link>
        )}
      </EncabezadoAdmin>
      <Alerta mensaje={aviso} tipo="warning" onCerrar={() => setAviso("")} />
      <div className="card card-body">
        <div className="mb-3">
          <BarraBusqueda valor={texto} onCambiar={setTexto} placeholder="Buscar producto..." />
        </div>
        <TablaProductos productos={filtrados} onEliminar={eliminar} puedeEditar={puedeEditar} />
      </div>
    </>
  );
}

export function AdminProductosCriticos() {
  const { productos } = useTienda();
  const criticos = productos.filter(esStockCritico).sort((a, b) => a.stock - b.stock);
  return (
    <>
      <EncabezadoAdmin titulo="Productos con stock crítico" subtitulo="Productos cuyo stock está en o bajo el nivel crítico definido." />
      <div className="card card-body">
        <TablaProductos productos={criticos} puedeEditar={false} />
      </div>
    </>
  );
}

export function AdminProductoNuevo() {
  const { crearProducto } = useTienda();
  return (
    <>
      <EncabezadoAdmin titulo="Nuevo producto">
        <Link to="/admin/productos" className="btn btn-outline-secondary">Volver al listado</Link>
      </EncabezadoAdmin>
      <FormularioProducto onGuardar={crearProducto} />
    </>
  );
}

export function AdminProductoEditar() {
  const { codigo } = useParams();
  const { productos, actualizarProducto } = useTienda();
  const producto = productos.find((p) => p.codigo === codigo);
  if (!producto) return <EstadoVacio titulo="Producto no encontrado" enlace="/admin/productos" textoEnlace="Volver al listado" />;

  return (
    <>
      <EncabezadoAdmin titulo={`Editar: ${producto.nombre}`}>
        <Link to={`/admin/productos/${codigo}`} className="btn btn-outline-secondary">Ver ficha</Link>
      </EncabezadoAdmin>
      <FormularioProducto key={codigo} producto={producto} onGuardar={(datos) => actualizarProducto(codigo, datos)} textoBoton="Guardar cambios" />
    </>
  );
}

export function AdminProductoMostrar() {
  const { codigo } = useParams();
  const { productos } = useTienda();
  const puedeEditar = usePuedeEditar();
  const producto = productos.find((p) => p.codigo === codigo);
  if (!producto) return <EstadoVacio titulo="Producto no encontrado" enlace="/admin/productos" textoEnlace="Volver al listado" />;

  const campos = [
    ["Código", producto.codigo],
    ["Categoría", producto.categoria],
    ["Precio", formatoCLP(producto.precio)],
    ["Descuento", producto.descuento ? `${producto.descuento}% → ${formatoCLP(precioFinal(producto))}` : "Sin oferta"],
    ["Stock", producto.stock],
    ["Stock crítico", producto.stockCritico ?? "—"],
  ];

  return (
    <>
      <EncabezadoAdmin titulo="Mostrar producto">
        {puedeEditar && <Link to={`/admin/productos/${codigo}/editar`} className="btn btn-glitch">Editar</Link>}
        <Link to="/admin/productos" className="btn btn-outline-secondary">Volver al listado</Link>
      </EncabezadoAdmin>
      <div className="card card-body">
        <div className="row g-4">
          <div className="col-sm-4 col-lg-3">
            <img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded" />
          </div>
          <div className="col-sm-8 col-lg-9">
            <h2 className="h3">{producto.nombre}</h2>
            <p><InsigniaStock producto={producto} /></p>
            <dl className="row">
              {campos.map(([etiqueta, valor]) => (
                <div className="col-md-6 mb-2" key={etiqueta}>
                  <dt className="small text-uppercase text-body-secondary">{etiqueta}</dt>
                  <dd className="mb-0">{valor}</dd>
                </div>
              ))}
              <div className="col-12">
                <dt className="small text-uppercase text-body-secondary">Descripción</dt>
                <dd>{producto.descripcion || "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
