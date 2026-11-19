/* =========================================================
   Servicios de la tienda: una función por endpoint de la API.
   Los componentes NO llaman a fetch directamente: pasan por el
   contexto TiendaContext, que usa estos servicios.
   ========================================================= */
import { crearAlmacenSesion, crearValor } from "./almacenamiento";
import { API_URL, crearClienteApi } from "./cliente";

const ruta = (valor) => encodeURIComponent(valor);

export function crearApi({ baseUrl = API_URL, almacenamiento = window.localStorage, fetchImpl } = {}) {
  const sesion = crearAlmacenSesion(almacenamiento);
  const avisosExpiracion = new Set();
  const http = crearClienteApi({ baseUrl, sesion, fetchImpl, alCerrarSesion: () => avisosExpiracion.forEach((aviso) => aviso()) });

  /** Guarda los tokens del login/registro y devuelve el usuario. */
  function abrirSesion(respuesta) {
    sesion.guardar(respuesta);
    return respuesta.usuario;
  }

  return {
    carrito: crearValor("glitch_carrito", [], almacenamiento),

    /** Registra una función que se llama si la sesión expira y no se puede renovar. Devuelve cómo desuscribirla. */
    alExpirarSesion(aviso) {
      avisosExpiracion.add(aviso);
      return () => avisosExpiracion.delete(aviso);
    },

    auth: {
      haySesion: () => Boolean(sesion.leer()?.accessToken),
      iniciarSesion: async (correo, contrasena) => abrirSesion(await http.post("/v1/auth/login", { correo: correo.trim(), contrasena })),
      registrar: async (datos) => abrirSesion(await http.post("/v1/auth/registro", datos)),
      perfil: () => http.get("/v1/auth/me"),
      cerrarSesion: () => sesion.limpiar(),
    },

    productos: {
      listar: () => http.get("/v1/productos"),
      crear: (producto) => http.post("/v1/productos", producto),
      actualizar: (codigo, producto) => http.put(`/v1/productos/${ruta(codigo)}`, producto),
      eliminar: (codigo) => http.eliminar(`/v1/productos/${ruta(codigo)}`),
    },

    categorias: {
      listar: () => http.get("/v1/categorias"),
    },

    usuarios: {
      listar: () => http.get("/v1/usuarios"),
      crear: (usuario) => http.post("/v1/usuarios", usuario),
      actualizar: (run, usuario) => http.put(`/v1/usuarios/${ruta(run)}`, usuario),
      eliminar: (run) => http.eliminar(`/v1/usuarios/${ruta(run)}`),
    },

    boletas: {
      listar: () => http.get("/v1/boletas"),
      mias: () => http.get("/v1/boletas/mias"),
      obtener: (id) => http.get(`/v1/boletas/${ruta(id)}`),
      comprar: (compra) => http.post("/v1/boletas", compra),
      cambiarEstado: (id, estado) => http.put(`/v1/boletas/${ruta(id)}/estado`, { estado }),
    },
  };
}
