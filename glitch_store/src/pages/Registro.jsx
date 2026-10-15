import { useState } from "react";
import { Link } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";
import { useFormulario } from "../hooks/useFormulario";
import CampoFormulario from "../components/common/CampoFormulario";
import CamposRegionComuna from "../components/common/CamposRegionComuna";
import Alerta from "../components/common/Alerta";
import Boton from "../components/common/Boton";
import {
  primerError,
  validarConfirmacion,
  validarContrasena,
  validarCorreo,
  validarMaximo,
  validarRequerido,
  validarRun,
  validarTelefono,
} from "../utils/validaciones";

const VACIO = { run: "", nombre: "", apellidos: "", correo: "", contrasena: "", confirmar: "", telefono: "", region: "", comuna: "", direccion: "" };

export const validarRegistro = (v) => ({
  run: validarRun(v.run),
  nombre: primerError(validarRequerido(v.nombre, "El nombre"), validarMaximo(v.nombre, 50, "El nombre")),
  apellidos: primerError(validarRequerido(v.apellidos, "Los apellidos"), validarMaximo(v.apellidos, 100, "Los apellidos")),
  correo: validarCorreo(v.correo),
  contrasena: validarContrasena(v.contrasena),
  confirmar: validarConfirmacion(v.confirmar, v.contrasena),
  telefono: validarTelefono(v.telefono),
  region: validarRequerido(v.region, "La región"),
  comuna: validarRequerido(v.comuna, "La comuna"),
  direccion: primerError(validarRequerido(v.direccion, "La dirección"), validarMaximo(v.direccion, 300, "La dirección")),
});

export default function Registro() {
  const { crearUsuario } = useTienda();
  const [resultado, setResultado] = useState(null);
  const { valores, errores, cambiar, validarTodo, reiniciar } = useFormulario(VACIO, validarRegistro);

  function enviar(evento) {
    evento.preventDefault();
    setResultado(null);
    if (!validarTodo()) return;
    try {
      const { confirmar, ...datos } = valores;
      crearUsuario({ ...datos, run: datos.run.trim().toUpperCase(), tipo: "Cliente", fechaNacimiento: "" });
      setResultado({ tipo: "success", texto: "Cuenta creada correctamente. Ya puedes iniciar sesión." });
      reiniciar();
    } catch (error) {
      setResultado({ tipo: "danger", texto: error.message });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-7">
          <form className="card card-body p-4 formulario" onSubmit={enviar} noValidate>
            <h1 className="h4 mb-4">Crear una cuenta</h1>
            <Alerta tipo={resultado?.tipo} mensaje={resultado?.texto} onCerrar={() => setResultado(null)} />
            {resultado?.tipo === "success" && (
              <p>
                <Link to="/login" className="btn btn-glitch btn-sm">Ir a iniciar sesión</Link>
              </p>
            )}

            <CampoFormulario name="run" etiqueta="RUN (sin puntos ni guion)" valor={valores.run} onChange={cambiar} error={errores.run} placeholder="Ej: 19011022K" maxLength={9} />
            <div className="row g-md-3">
              <div className="col-md-6">
                <CampoFormulario name="nombre" etiqueta="Nombre" valor={valores.nombre} onChange={cambiar} error={errores.nombre} maxLength={50} />
              </div>
              <div className="col-md-6">
                <CampoFormulario name="apellidos" etiqueta="Apellidos" valor={valores.apellidos} onChange={cambiar} error={errores.apellidos} maxLength={100} />
              </div>
            </div>
            <CampoFormulario name="correo" tipo="email" etiqueta="Correo" valor={valores.correo} onChange={cambiar} error={errores.correo} placeholder="nombre@duoc.cl" maxLength={100} />
            <div className="row g-md-3">
              <div className="col-md-6">
                <CampoFormulario name="contrasena" tipo="password" etiqueta="Contraseña" valor={valores.contrasena} onChange={cambiar} error={errores.contrasena} ayuda="Entre 4 y 10 caracteres." maxLength={10} />
              </div>
              <div className="col-md-6">
                <CampoFormulario name="confirmar" tipo="password" etiqueta="Confirmar contraseña" valor={valores.confirmar} onChange={cambiar} error={errores.confirmar} maxLength={10} />
              </div>
            </div>
            <CampoFormulario name="telefono" tipo="tel" etiqueta="Teléfono" opcional valor={valores.telefono} onChange={cambiar} error={errores.telefono} placeholder="+56 9 1234 5678" maxLength={15} />
            <CamposRegionComuna region={valores.region} comuna={valores.comuna} onChange={cambiar} errores={errores} />
            <CampoFormulario name="direccion" etiqueta="Dirección" valor={valores.direccion} onChange={cambiar} error={errores.direccion} maxLength={300} />

            <Boton tipo="submit" etiqueta="Registrar" ancho />
            <p className="text-center mt-3 mb-0 small">
              ¿Ya tienes cuenta? <Link to="/login" className="link-danger fw-semibold">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
