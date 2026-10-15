import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTienda } from "../../context/TiendaContext";
import EncabezadoAdmin from "../../components/admin/EncabezadoAdmin";
import TablaUsuarios from "../../components/admin/TablaUsuarios";
import TablaOrdenes from "../../components/admin/TablaOrdenes";
import FormularioUsuario from "../../components/admin/FormularioUsuario";
import EstadoVacio from "../../components/common/EstadoVacio";
import Alerta from "../../components/common/Alerta";
import { nombreComuna, nombreRegion } from "../../utils/formato";

export function AdminUsuarios() {
  const { usuarios, eliminarUsuario, usuarioActual } = useTienda();
  const [tipo, setTipo] = useState("Todos");
  const [aviso, setAviso] = useState("");
  const filtrados = usuarios.filter((u) => tipo === "Todos" || u.tipo === tipo);

  function eliminar(usuario) {
    if (window.confirm(`¿Eliminar al usuario ${usuario.nombre} ${usuario.apellidos}?`)) {
      eliminarUsuario(usuario.run);
      setAviso(`Usuario ${usuario.nombre} eliminado.`);
    }
  }

  return (
    <>
      <EncabezadoAdmin titulo="Usuarios" subtitulo={`${filtrados.length} usuarios`}>
        <select className="form-select w-auto" aria-label="Filtrar por tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option>Todos</option>
          <option>Administrador</option>
          <option>Vendedor</option>
          <option>Cliente</option>
        </select>
        <Link to="/admin/usuarios/nuevo" className="btn btn-glitch">+ Nuevo usuario</Link>
      </EncabezadoAdmin>
      <Alerta mensaje={aviso} tipo="warning" onCerrar={() => setAviso("")} />
      <div className="card card-body">
        <TablaUsuarios usuarios={filtrados} onEliminar={eliminar} runActual={usuarioActual?.run} />
      </div>
    </>
  );
}

export function AdminUsuarioNuevo() {
  const { crearUsuario } = useTienda();
  return (
    <>
      <EncabezadoAdmin titulo="Nuevo usuario">
        <Link to="/admin/usuarios" className="btn btn-outline-secondary">Volver al listado</Link>
      </EncabezadoAdmin>
      <FormularioUsuario onGuardar={crearUsuario} />
    </>
  );
}

export function AdminUsuarioEditar() {
  const { run } = useParams();
  const { usuarios, actualizarUsuario } = useTienda();
  const usuario = usuarios.find((u) => u.run === run);
  if (!usuario) return <EstadoVacio titulo="Usuario no encontrado" enlace="/admin/usuarios" textoEnlace="Volver al listado" />;

  return (
    <>
      <EncabezadoAdmin titulo={`Editar: ${usuario.nombre} ${usuario.apellidos}`}>
        <Link to={`/admin/usuarios/${run}`} className="btn btn-outline-secondary">Ver ficha</Link>
      </EncabezadoAdmin>
      <FormularioUsuario key={run} usuario={usuario} onGuardar={(datos) => actualizarUsuario(run, datos)} textoBoton="Guardar cambios" />
    </>
  );
}

/** Ficha del usuario con su historial de compras (órdenes asociadas a su correo). */
export function AdminUsuarioMostrar() {
  const { run } = useParams();
  const { usuarios, ordenes } = useTienda();
  const usuario = usuarios.find((u) => u.run === run);
  if (!usuario) return <EstadoVacio titulo="Usuario no encontrado" enlace="/admin/usuarios" textoEnlace="Volver al listado" />;

  const compras = ordenes.filter((o) => o.cliente.correo.toLowerCase() === usuario.correo.toLowerCase());
  const campos = [
    ["RUN", usuario.run],
    ["Correo", usuario.correo],
    ["Tipo de usuario", usuario.tipo],
    ["Fecha de nacimiento", usuario.fechaNacimiento || "—"],
    ["Región", nombreRegion(usuario.region)],
    ["Comuna", nombreComuna(usuario.region, usuario.comuna)],
    ["Dirección", usuario.direccion],
  ];

  return (
    <>
      <EncabezadoAdmin titulo={`${usuario.nombre} ${usuario.apellidos}`}>
        <Link to={`/admin/usuarios/${run}/editar`} className="btn btn-glitch">Editar</Link>
        <Link to="/admin/usuarios" className="btn btn-outline-secondary">Volver al listado</Link>
      </EncabezadoAdmin>
      <div className="card card-body mb-4">
        <dl className="row mb-0">
          {campos.map(([etiqueta, valor]) => (
            <div className="col-md-6 col-xl-4 mb-3" key={etiqueta}>
              <dt className="small text-uppercase text-body-secondary">{etiqueta}</dt>
              <dd className="mb-0">{valor}</dd>
            </div>
          ))}
        </dl>
      </div>
      <section className="card card-body">
        <h2 className="h5">Historial de compras</h2>
        <TablaOrdenes ordenes={compras} />
      </section>
    </>
  );
}
