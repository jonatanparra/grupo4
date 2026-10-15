import { useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";
import { useFormulario } from "../hooks/useFormulario";
import CampoFormulario from "../components/common/CampoFormulario";
import CamposRegionComuna from "../components/common/CamposRegionComuna";
import Boton from "../components/common/Boton";
import ResumenCarrito from "../components/carrito/ResumenCarrito";
import { calcularTotales, detalleCarrito } from "../utils/carrito";
import { formatoCLP } from "../utils/formato";
import { COSTO_ENVIO, ENVIO_GRATIS_DESDE } from "../data/datos";
import { primerError, validarCorreo, validarMaximo, validarRequerido } from "../utils/validaciones";

/** Reglas de validación del checkout (exportadas para las pruebas unitarias). */
export function validarCheckout(v) {
  const esDomicilio = v.tipoEnvio === "domicilio";
  return {
    nombre: primerError(validarRequerido(v.nombre, "El nombre"), validarMaximo(v.nombre, 50, "El nombre")),
    apellidos: primerError(validarRequerido(v.apellidos, "Los apellidos"), validarMaximo(v.apellidos, 100, "Los apellidos")),
    correo: validarCorreo(v.correo),
    calle: esDomicilio ? primerError(validarRequerido(v.calle, "La calle"), validarMaximo(v.calle, 300, "La calle")) : "",
    departamento: validarMaximo(v.departamento, 20, "El departamento"),
    region: validarRequerido(v.region, "La región"),
    comuna: validarRequerido(v.comuna, "La comuna"),
    indicaciones: validarMaximo(v.indicaciones, 200, "Las indicaciones"),
    metodoPago: validarRequerido(v.metodoPago, "El método de pago"),
  };
}

/** Si el usuario inició sesión, sus datos se completan automáticamente. */
function valoresIniciales(usuario) {
  return {
    nombre: usuario?.nombre || "",
    apellidos: usuario?.apellidos || "",
    correo: usuario?.correo || "",
    tipoEnvio: "domicilio",
    calle: usuario?.direccion || "",
    departamento: "",
    region: usuario?.region || "",
    comuna: usuario?.comuna || "",
    indicaciones: "",
    metodoPago: "",
    simularRechazo: false,
  };
}

export default function Checkout() {
  const { carrito, productos, cupon, usuarioActual, procesarCompra } = useTienda();
  const navegar = useNavigate();
  const compraEnviada = useRef(false);
  const { valores, errores, cambiar, validarTodo } = useFormulario(valoresIniciales(usuarioActual), validarCheckout);

  const lineas = detalleCarrito(carrito, productos);
  if (!lineas.length && !compraEnviada.current) return <Navigate to="/carrito" replace />;

  const totales = calcularTotales(carrito, productos, cupon, valores.tipoEnvio);

  function pagar(evento) {
    evento.preventDefault();
    if (!validarTodo()) return;
    compraEnviada.current = true;
    const orden = procesarCompra(valores, { simularRechazo: valores.simularRechazo });
    navegar(`/compra/${orden.estado === "Pagado" ? "exito" : "error"}/${orden.id}`);
  }

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/carrito">Carrito</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Checkout</li>
        </ol>
      </nav>
      <h1>Checkout</h1>
      {usuarioActual ? (
        <p className="text-success">Completamos tus datos con la información de tu cuenta. Puedes modificarlos si lo necesitas.</p>
      ) : (
        <p>
          ¿Ya tienes cuenta? <Link to="/login" state={{ desde: "/checkout" }} className="link-danger">Inicia sesión</Link> y completamos tus datos automáticamente.
        </p>
      )}

      <form onSubmit={pagar} noValidate className="row g-4">
        <div className="col-lg-8">
          <fieldset className="card card-body mb-4">
            <legend className="h5">Información del cliente</legend>
            <div className="row g-md-3">
              <div className="col-md-6">
                <CampoFormulario name="nombre" etiqueta="Nombre" valor={valores.nombre} onChange={cambiar} error={errores.nombre} maxLength={50} />
              </div>
              <div className="col-md-6">
                <CampoFormulario name="apellidos" etiqueta="Apellidos" valor={valores.apellidos} onChange={cambiar} error={errores.apellidos} maxLength={100} />
              </div>
            </div>
            <CampoFormulario name="correo" tipo="email" etiqueta="Correo" valor={valores.correo} onChange={cambiar} error={errores.correo} placeholder="nombre@duoc.cl" />
          </fieldset>

          <fieldset className="card card-body mb-4">
            <legend className="h5">Entrega</legend>
            <div className="mb-3" role="radiogroup" aria-label="Tipo de entrega">
              <div className="form-check">
                <input className="form-check-input" type="radio" name="tipoEnvio" id="envio-domicilio" value="domicilio" checked={valores.tipoEnvio === "domicilio"} onChange={cambiar} />
                <label className="form-check-label" htmlFor="envio-domicilio">
                  Despacho a domicilio ({formatoCLP(COSTO_ENVIO)}, gratis sobre {formatoCLP(ENVIO_GRATIS_DESDE)})
                </label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="tipoEnvio" id="envio-retiro" value="retiro" checked={valores.tipoEnvio === "retiro"} onChange={cambiar} />
                <label className="form-check-label" htmlFor="envio-retiro">
                  Retiro en tienda (gratis)
                </label>
              </div>
            </div>

            {valores.tipoEnvio === "domicilio" && (
              <div className="row g-md-3">
                <div className="col-md-8">
                  <CampoFormulario name="calle" etiqueta="Calle y número" valor={valores.calle} onChange={cambiar} error={errores.calle} maxLength={300} />
                </div>
                <div className="col-md-4">
                  <CampoFormulario name="departamento" etiqueta="Departamento" opcional valor={valores.departamento} onChange={cambiar} error={errores.departamento} placeholder="Ej: 603" />
                </div>
              </div>
            )}
            <CamposRegionComuna region={valores.region} comuna={valores.comuna} onChange={cambiar} errores={errores} />
            {valores.tipoEnvio === "domicilio" && (
              <CampoFormulario
                como="textarea"
                name="indicaciones"
                etiqueta="Indicaciones para la entrega"
                opcional
                valor={valores.indicaciones}
                onChange={cambiar}
                error={errores.indicaciones}
                placeholder="Ej: entre calles, color del edificio, no tiene timbre."
                rows={2}
              />
            )}
          </fieldset>

          <fieldset className="card card-body">
            <legend className="h5">Pago</legend>
            <CampoFormulario como="select" name="metodoPago" etiqueta="Método de pago" valor={valores.metodoPago} onChange={cambiar} error={errores.metodoPago}>
              <option value="">-- Seleccione --</option>
              <option value="debito">Tarjeta de débito</option>
              <option value="credito">Tarjeta de crédito</option>
              <option value="transferencia">Transferencia bancaria</option>
            </CampoFormulario>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="simularRechazo" name="simularRechazo" checked={valores.simularRechazo} onChange={cambiar} />
              <label className="form-check-label small" htmlFor="simularRechazo">
                Simular pago rechazado (demostración del flujo de error)
              </label>
            </div>
          </fieldset>
        </div>

        <div className="col-lg-4">
          <ResumenCarrito totales={totales} cuponActivo={cupon} envioCalculado>
            <ul className="list-unstyled small mb-3">
              {lineas.map((l) => (
                <li key={l.codigo} className="d-flex justify-content-between">
                  <span>{l.cantidad} × {l.producto.nombre}</span>
                  <span>{formatoCLP(l.totalLinea)}</span>
                </li>
              ))}
            </ul>
            <Boton tipo="submit" etiqueta={`Pagar ahora ${formatoCLP(totales.total)}`} ancho tamano="lg" />
          </ResumenCarrito>
        </div>
      </form>
    </div>
  );
}
