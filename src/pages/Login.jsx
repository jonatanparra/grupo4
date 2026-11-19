import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";
import { useFormulario } from "../hooks/useFormulario";
import CampoFormulario from "../components/common/CampoFormulario";
import Alerta from "../components/common/Alerta";
import Boton from "../components/common/Boton";
import { validarContrasena, validarCorreo } from "../utils/validaciones";

export const validarLogin = (v) => ({
  correo: validarCorreo(v.correo),
  contrasena: validarContrasena(v.contrasena),
});

export default function Login() {
  const { iniciarSesion } = useTienda();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [errorLogin, setErrorLogin] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { valores, errores, cambiar, validarTodo } = useFormulario({ correo: "", contrasena: "" }, validarLogin);

  async function enviar(evento) {
    evento.preventDefault();
    setErrorLogin("");
    if (!validarTodo()) return;

    setEnviando(true);
    try {
      const usuario = await iniciarSesion(valores.correo, valores.contrasena);
      const esStaff = ["Administrador", "Vendedor"].includes(usuario.tipo);
      navegar(ubicacion.state?.desde || (esStaff ? "/admin" : "/"), { replace: true });
    } catch (error) {
      // 401 del backend: "Correo o contraseña incorrectos."; sin conexión: aviso del cliente HTTP
      setErrorLogin(error.message);
      setEnviando(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5">
          <form className="card card-body p-4 formulario" onSubmit={enviar} noValidate>
            <img src="/img/logo.png" alt="Glitch Store" className="mx-auto mb-3 formulario__logo" />
            <h1 className="h4 text-center mb-4">Inicio de sesión</h1>

            <Alerta tipo="danger" mensaje={errorLogin} />

            <CampoFormulario name="correo" tipo="email" etiqueta="Correo" valor={valores.correo} onChange={cambiar} error={errores.correo} placeholder="nombre@duoc.cl" maxLength={100} autoComplete="email" />
            <CampoFormulario
              name="contrasena"
              tipo="password"
              etiqueta="Contraseña"
              valor={valores.contrasena}
              onChange={cambiar}
              error={errores.contrasena}
              ayuda="Entre 4 y 10 caracteres."
              maxLength={10}
              autoComplete="current-password"
            />

            <Boton tipo="submit" etiqueta={enviando ? "Ingresando..." : "Iniciar sesión"} disabled={enviando} ancho />
            <p className="text-center mt-3 mb-0 small">
              ¿No tienes cuenta? <Link to="/registro" className="link-danger fw-semibold">Regístrate</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
