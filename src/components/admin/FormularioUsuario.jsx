import { useState } from "react";
import { TIPOS_USUARIO } from "../../data/datos";
import { useFormulario } from "../../hooks/useFormulario";
import CampoFormulario from "../common/CampoFormulario";
import CamposRegionComuna from "../common/CamposRegionComuna";
import Alerta from "../common/Alerta";
import Boton from "../common/Boton";
import { primerError, validarContrasena, validarCorreo, validarMaximo, validarRequerido, validarRun } from "../../utils/validaciones";

/** En edición la contraseña es opcional: si se deja vacía, se mantiene la actual. */
export const validarUsuario = (v, esEdicion = false) => ({
  run: esEdicion ? "" : validarRun(v.run),
  nombre: primerError(validarRequerido(v.nombre, "El nombre"), validarMaximo(v.nombre, 50, "El nombre")),
  apellidos: primerError(validarRequerido(v.apellidos, "Los apellidos"), validarMaximo(v.apellidos, 100, "Los apellidos")),
  correo: validarCorreo(v.correo),
  contrasena: esEdicion && !v.contrasena ? "" : validarContrasena(v.contrasena),
  fechaNacimiento: v.fechaNacimiento && new Date(v.fechaNacimiento) > new Date() ? "La fecha de nacimiento no puede ser futura." : "",
  tipo: validarRequerido(v.tipo, "El tipo de usuario"),
  region: validarRequerido(v.region, "La región"),
  comuna: validarRequerido(v.comuna, "La comuna"),
  direccion: primerError(validarRequerido(v.direccion, "La dirección"), validarMaximo(v.direccion, 300, "La dirección")),
});

const VACIO = { run: "", nombre: "", apellidos: "", correo: "", contrasena: "", fechaNacimiento: "", tipo: "", region: "", comuna: "", direccion: "" };

export default function FormularioUsuario({ usuario, onGuardar, textoBoton = "Guardar usuario" }) {
  const esEdicion = Boolean(usuario);
  const inicial = esEdicion ? { ...VACIO, ...usuario, contrasena: "" } : VACIO;
  const { valores, errores, cambiar, validarTodo, reiniciar } = useFormulario(inicial, (v) => validarUsuario(v, esEdicion));
  const [resultado, setResultado] = useState(null);

  function enviar(evento) {
    evento.preventDefault();
    if (!validarTodo()) {
      setResultado({ tipo: "danger", texto: "Revisa los campos marcados en rojo." });
      return;
    }
    const { contrasena, ...datos } = valores;
    const usuarioFinal = { ...datos, run: datos.run.trim().toUpperCase(), ...(contrasena ? { contrasena } : {}) };
    try {
      onGuardar(usuarioFinal);
      setResultado({ tipo: "success", texto: esEdicion ? "Usuario actualizado correctamente." : "Usuario creado correctamente." });
      if (!esEdicion) reiniciar();
    } catch (error) {
      setResultado({ tipo: "danger", texto: error.message });
    }
  }

  return (
    <form className="card card-body p-4" onSubmit={enviar} noValidate>
      <Alerta tipo={resultado?.tipo} mensaje={resultado?.texto} onCerrar={() => setResultado(null)} />

      <CampoFormulario
        name="run"
        etiqueta="RUN (sin puntos ni guion)"
        valor={valores.run}
        onChange={cambiar}
        error={errores.run}
        maxLength={9}
        readOnly={esEdicion}
        ayuda={esEdicion ? "El RUN no se puede modificar una vez creado." : "Ej: 19011022K"}
      />
      <div className="row g-md-3">
        <div className="col-md-6">
          <CampoFormulario name="nombre" etiqueta="Nombre" valor={valores.nombre} onChange={cambiar} error={errores.nombre} maxLength={50} />
        </div>
        <div className="col-md-6">
          <CampoFormulario name="apellidos" etiqueta="Apellidos" valor={valores.apellidos} onChange={cambiar} error={errores.apellidos} maxLength={100} />
        </div>
      </div>
      <div className="row g-md-3">
        <div className="col-md-6">
          <CampoFormulario name="correo" tipo="email" etiqueta="Correo" valor={valores.correo} onChange={cambiar} error={errores.correo} maxLength={100} />
        </div>
        <div className="col-md-6">
          <CampoFormulario
            name="contrasena"
            tipo="password"
            etiqueta="Contraseña"
            opcional={esEdicion}
            valor={valores.contrasena}
            onChange={cambiar}
            error={errores.contrasena}
            maxLength={10}
            ayuda={esEdicion ? "Déjala vacía para mantener la actual." : "Entre 4 y 10 caracteres."}
          />
        </div>
      </div>
      <div className="row g-md-3">
        <div className="col-md-6">
          <CampoFormulario name="fechaNacimiento" tipo="date" etiqueta="Fecha de nacimiento" opcional valor={valores.fechaNacimiento} onChange={cambiar} error={errores.fechaNacimiento} />
        </div>
        <div className="col-md-6">
          <CampoFormulario como="select" name="tipo" etiqueta="Tipo de usuario" valor={valores.tipo} onChange={cambiar} error={errores.tipo}>
            <option value="">-- Seleccione el perfil --</option>
            {TIPOS_USUARIO.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </CampoFormulario>
        </div>
      </div>
      <CamposRegionComuna region={valores.region} comuna={valores.comuna} onChange={cambiar} errores={errores} />
      <CampoFormulario name="direccion" etiqueta="Dirección" valor={valores.direccion} onChange={cambiar} error={errores.direccion} maxLength={300} />

      <Boton tipo="submit" etiqueta={textoBoton} />
    </form>
  );
}
