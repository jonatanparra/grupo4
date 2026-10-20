import { useEffect, useState } from "react"; // agregué useEffect
import { Link, useParams } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";
import ResumenOrden from "../components/carrito/ResumenOrden";
import EstadoVacio from "../components/common/EstadoVacio";
import Boton from "../components/common/Boton";
import { confetiHalloween } from "../utils/confettiHalloween"; // nuevo import

/**
 * Resultado de una compra. Se usa en dos rutas:
 *  - /compra/exito/:id  → compra exitosa con la boleta.
 *  - /compra/error/:id  → pago rechazado, con opción de reintentar.
 */
export default function CompraResultado({ exito }) {
  const { id } = useParams();
  const { ordenes } = useTienda();
  const [boletaEnviada, setBoletaEnviada] = useState(false);
  const orden = ordenes.find((o) => o.id === id);

  // nuevo: disparo el confeti una sola vez cuando la compra fue exitosa
  useEffect(() => {
    if (exito && orden) confetiHalloween();
  }, [exito, orden?.id]);

  if (!orden) {
    return (
      <div className="container py-5">
        <EstadoVacio titulo="Orden no encontrada" mensaje={`No existe la orden ${id}.`} enlace="/" textoEnlace="Volver al inicio" />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="card">
        <div className="card-body p-4">
          {exito ? (
            <div className="alert alert-success" role="status">
              <h1 className="h3 mb-1">✅ Se ha realizado la compra. Nro #{orden.id}</h1>
              <p className="mb-0">¡Gracias por tu compra! Te enviamos el detalle a {orden.cliente.correo}.</p>
            </div>
          ) : (
            <div className="alert alert-danger" role="alert">
              <h1 className="h3 mb-1">❌ No se pudo realizar el pago. Nro #{orden.id}</h1>
              <p className="mb-0">{orden.motivoRechazo || "El pago fue rechazado."} No se realizó ningún cargo; tu carrito sigue guardado.</p>
            </div>
          )}

          <ResumenOrden orden={orden} />

          <div className="d-flex flex-wrap gap-2 mt-4">
            {exito ? (
              <>
                <Boton etiqueta="Imprimir boleta" onClick={() => window.print()} />
                <Boton variante="contorno" etiqueta={boletaEnviada ? "Boleta enviada ✓" : "Enviar boleta por email"} disabled={boletaEnviada} onClick={() => setBoletaEnviada(true)} />
                <Link to="/productos" className="btn btn-outline-secondary">
                  Seguir comprando
                </Link>
              </>
            ) : (
              <>
                <Link to="/checkout" className="btn btn-glitch">
                  Volver a realizar el pago
                </Link>
                <Link to="/carrito" className="btn btn-outline-light">
                  Revisar carrito
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}