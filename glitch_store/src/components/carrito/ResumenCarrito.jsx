import { useState } from "react";
import Boton from "../common/Boton";
import { formatoCLP } from "../../utils/formato";

/**
 * Resumen de montos del pedido con campo de cupón.
 * onAplicarCupon(codigo) debe devolver true si el cupón es válido.
 * "children" permite poner la acción principal (ej: botón "Ir a pagar").
 */
export default function ResumenCarrito({ totales, cuponActivo, onAplicarCupon, envioCalculado = false, children }) {
  const [codigo, setCodigo] = useState(cuponActivo || "");
  const [mensaje, setMensaje] = useState(null);

  function aplicar() {
    const valido = onAplicarCupon(codigo);
    setMensaje(valido ? { tipo: "success", texto: "Cupón aplicado." } : { tipo: "danger", texto: "Cupón no válido." });
  }

  return (
    <div className="card resumen-carrito">
      <div className="card-body">
        <h2 className="h5">Resumen del pedido</h2>
        <dl className="mb-0">
          <div className="d-flex justify-content-between">
            <dt className="fw-normal">Subtotal</dt>
            <dd className="mb-1">{formatoCLP(totales.subtotal)}</dd>
          </div>
          {totales.descuentoCupon > 0 && (
            <div className="d-flex justify-content-between text-success">
              <dt className="fw-normal">Cupón {cuponActivo}</dt>
              <dd className="mb-1">-{formatoCLP(totales.descuentoCupon)}</dd>
            </div>
          )}
          <div className="d-flex justify-content-between">
            <dt className="fw-normal">Envío</dt>
            <dd className="mb-1">
              {!envioCalculado ? "Se calcula en el checkout" : totales.costoEnvio ? formatoCLP(totales.costoEnvio) : "Gratis"}
            </dd>
          </div>
          <div className="d-flex justify-content-between fs-5 fw-bold border-top pt-2 mt-2">
            <dt>Total</dt>
            <dd className="mb-0" data-testid="total-pedido">
              {formatoCLP(totales.total)}
            </dd>
          </div>
        </dl>

        {onAplicarCupon && (
          <div className="mt-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Cupón (ej: GLITCH10)"
                aria-label="Cupón de descuento"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
              <Boton variante="contorno" etiqueta="Aplicar" onClick={aplicar} disabled={!codigo.trim()} />
            </div>
            {mensaje && <div className={`small mt-1 text-${mensaje.tipo}`}>{mensaje.texto}</div>}
          </div>
        )}

        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
