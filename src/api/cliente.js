/* =========================================================
   Cliente HTTP de la API REST (fetch).
   - Agrega el header Authorization: Bearer <accessToken>.
   - Si el backend responde 401 porque el token venció, pide un
     par nuevo con el refreshToken y repite la petición una vez.
     Varias peticiones que fallan a la vez comparten una sola
     renovación.
   - Si la renovación falla, borra la sesión y avisa (la app
     vuelve a pedir login).
   - Convierte las respuestas de error en ErrorApi con el mensaje
     y los errores por campo que envía el backend.
   ========================================================= */

/** Dirección del backend: variable VITE_API_URL o localhost:8080 en desarrollo. */
export const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080/api";

export class ErrorApi extends Error {
  constructor(estado, mensaje, campos = null) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
    this.campos = campos;
  }
}

/**
 * @param {object} opciones
 * @param {string} opciones.baseUrl  URL base de la API.
 * @param {object} opciones.sesion   Almacén de tokens (crearAlmacenSesion).
 * @param {Function} opciones.fetchImpl  fetch a usar (en las pruebas se reemplaza por un mock).
 * @param {Function} opciones.alCerrarSesion  Se llama cuando la sesión expira sin poder renovarse.
 */
export function crearClienteApi({ baseUrl = API_URL, sesion, fetchImpl = (...args) => window.fetch(...args), alCerrarSesion = () => {} }) {
  let renovacionEnCurso = null;

  async function renovarTokens() {
    const refreshToken = sesion.leer()?.refreshToken;
    if (!refreshToken) return false;
    if (!renovacionEnCurso) {
      renovacionEnCurso = (async () => {
        const respuesta = await fetchImpl(`${baseUrl}/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!respuesta.ok) return false;
        sesion.guardar(await respuesta.json());
        return true;
      })()
        .catch(() => false)
        .finally(() => {
          renovacionEnCurso = null;
        });
    }
    return renovacionEnCurso;
  }

  async function solicitar(metodo, ruta, cuerpo, puedeReintentar = true) {
    const tokens = sesion.leer();
    const headers = { Accept: "application/json" };
    if (cuerpo !== undefined) headers["Content-Type"] = "application/json";
    if (tokens?.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;

    let respuesta;
    try {
      respuesta = await fetchImpl(baseUrl + ruta, { method: metodo, headers, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) });
    } catch {
      throw new ErrorApi(0, "No se pudo conectar con el servidor. Revisa que el backend esté en ejecución.");
    }

    if (respuesta.status === 401 && tokens?.accessToken) {
      if (puedeReintentar && (await renovarTokens())) return solicitar(metodo, ruta, cuerpo, false);
      sesion.limpiar();
      alCerrarSesion();
    }

    if (respuesta.status === 204) return null;
    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      const campos = datos?.campos || null;
      const detalle = campos ? ` ${Object.values(campos).join(" ")}` : "";
      throw new ErrorApi(respuesta.status, (datos?.mensaje || `Error ${respuesta.status} del servidor.`) + detalle, campos);
    }
    return datos;
  }

  return {
    get: (ruta) => solicitar("GET", ruta),
    post: (ruta, cuerpo = {}) => solicitar("POST", ruta, cuerpo),
    put: (ruta, cuerpo = {}) => solicitar("PUT", ruta, cuerpo),
    eliminar: (ruta) => solicitar("DELETE", ruta),
  };
}
