import { Link } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";
import LineaCarrito from "../components/carrito/LineaCarrito";
import ResumenCarrito from "../components/carrito/ResumenCarrito";
import EstadoVacio from "../components/common/EstadoVacio";
import Boton from "../components/common/Boton";
import { calcularTotales, detalleCarrito } from "../utils/carrito";

export default function Carrito() {
  const { carrito, productos, cupon, cambiarCantidad, quitarDelCarrito, vaciarCarrito, aplicarCupon } = useTienda();
  const lineas = detalleCarrito(carrito, productos);

  if (!lineas.length) {
    return (
      <div className="container py-5">
        <h1>Carrito de compras</h1>
        <EstadoVacio
          titulo="Tu carrito está vacío"
          mensaje="Explora nuestros productos y encuentra tu próximo juego favorito."
          enlace="/productos"
          textoEnlace="Ver productos"
        />
      </div>
    );
  }

  const totales = calcularTotales(carrito, productos, cupon);

  return (
    <div className="container py-5">
      <h1>Carrito de compras</h1>
      <div className="row g-4">
        <div className="col-lg-8">
          {lineas.map((linea) => (
            <LineaCarrito key={linea.codigo} linea={linea} onCambiarCantidad={cambiarCantidad} onQuitar={quitarDelCarrito} />
          ))}
          <div className="d-flex justify-content-between mt-3">
            <Link to="/productos" className="btn btn-outline-light">
              ← Seguir comprando
            </Link>
            <Boton variante="peligro" etiqueta="Vaciar carrito" onClick={vaciarCarrito} />
          </div>
        </div>
        <div className="col-lg-4">
          <ResumenCarrito totales={totales} cuponActivo={cupon} onAplicarCupon={aplicarCupon}>
            <Link to="/checkout" className="btn btn-glitch w-100 btn-lg">
              Ir a pagar
            </Link>
          </ResumenCarrito>
        </div>
      </div>
    </div>
  );
}
