/* =========================================================
   Persistencia local del navegador (localStorage).
   Solo guarda lo que pertenece al navegador del usuario:
   - el carrito (para no perderlo al recargar)
   - los tokens JWT de la sesión
   Los datos de la tienda (productos, usuarios, boletas) viven en
   el backend y se piden a la API REST.
   ========================================================= */

function copiar(valor) {
  return JSON.parse(JSON.stringify(valor));
}

/** Guarda/lee un único valor JSON bajo una clave. */
export function crearValor(clave, valorPorDefecto, almacenamiento = window.localStorage) {
  return {
    leer() {
      try {
        const data = almacenamiento.getItem(clave);
        return data ? JSON.parse(data) : copiar(valorPorDefecto);
      } catch {
        return copiar(valorPorDefecto);
      }
    },
    guardar(valor) {
      if (valor === null || valor === undefined) almacenamiento.removeItem(clave);
      else almacenamiento.setItem(clave, JSON.stringify(valor));
    },
  };
}

/**
 * Tokens de la sesión. Se guardan SOLO los tokens, nunca el rol ni los datos
 * del usuario: al recargar la página, el usuario y su rol se piden al backend
 * (/auth/me), así editar el localStorage no da permisos extra.
 */
export function crearAlmacenSesion(almacenamiento = window.localStorage) {
  const valor = crearValor("glitch_sesion", null, almacenamiento);
  return {
    leer: () => valor.leer(),
    guardar: ({ accessToken, refreshToken }) => valor.guardar({ accessToken, refreshToken }),
    limpiar: () => valor.guardar(null),
  };
}
