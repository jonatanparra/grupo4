import { useState } from "react";
import { useFormulario } from "../hooks/useFormulario";
import CampoFormulario from "../components/common/CampoFormulario";
import Alerta from "../components/common/Alerta";
import Boton from "../components/common/Boton";
import { primerError, validarCorreo, validarMaximo, validarRequerido } from "../utils/validaciones";

const MAX_MENSAJE = 500;

export const validarContacto = (v) => ({
  nombre: primerError(validarRequerido(v.nombre, "El nombre"), validarMaximo(v.nombre, 100, "El nombre")),
  correo: validarCorreo(v.correo, false),
  mensaje: primerError(validarRequerido(v.mensaje, "El mensaje"), validarMaximo(v.mensaje, MAX_MENSAJE, "El mensaje")),
});

export default function Contacto() {
  const [enviadoOk, setEnviadoOk] = useState(false);
  const { valores, errores, cambiar, validarTodo, reiniciar } = useFormulario({ nombre: "", correo: "", mensaje: "" }, validarContacto);

  function enviar(evento) {
    evento.preventDefault();
    if (!validarTodo()) {
      setEnviadoOk(false);
      return;
    }
    setEnviadoOk(true);
    reiniciar();
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-6">
          <form className="card card-body p-4 formulario" onSubmit={enviar} noValidate>
            <h1 className="h4 mb-4">Formulario de contacto</h1>
            <Alerta mensaje={enviadoOk ? "¡Gracias! Recibimos tu mensaje y te responderemos a la brevedad." : ""} onCerrar={() => setEnviadoOk(false)} />

            <CampoFormulario name="nombre" etiqueta="Nombre completo" valor={valores.nombre} onChange={cambiar} error={errores.nombre} maxLength={100} />
            <CampoFormulario name="correo" tipo="email" etiqueta="Correo" opcional valor={valores.correo} onChange={cambiar} error={errores.correo} placeholder="nombre@duoc.cl" maxLength={100} />
            <CampoFormulario
              como="textarea"
              name="mensaje"
              etiqueta="Mensaje"
              valor={valores.mensaje}
              onChange={cambiar}
              error={errores.mensaje}
              maxLength={MAX_MENSAJE}
              rows={5}
              ayuda={`${valores.mensaje.length} / ${MAX_MENSAJE} caracteres`}
            />

            <Boton tipo="submit" etiqueta="Enviar mensaje" ancho />
          </form>
        </div>
      </div>
    </div>
  );
}
