/* =========================================================
   Base de datos simulada sobre localStorage.
   crearColeccion() entrega un objeto con las operaciones CRUD
   (listar, obtener, crear, actualizar, eliminar) para una
   colección. Si la colección aún no existe en el almacenamiento,
   se inicializa con los datos semilla.
   ========================================================= */

function copiar(valor) {
  return JSON.parse(JSON.stringify(valor));
}

/**
 * @param {string} clave       Clave en el almacenamiento (ej: "glitch_productos").
 * @param {Array}  semilla     Datos iniciales de la colección.
 * @param {string} campoId     Campo que identifica a cada registro (ej: "codigo").
 * @param {Storage} almacenamiento  localStorage por defecto; se puede reemplazar por un mock en las pruebas.
 */
export function crearColeccion(clave, semilla, campoId, almacenamiento = window.localStorage) {
  function leer() {
    try {
      const data = almacenamiento.getItem(clave);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(`No se pudo leer la colección "${clave}":`, e);
    }
    const inicial = copiar(semilla);
    escribir(inicial);
    return inicial;
  }

  function escribir(registros) {
    almacenamiento.setItem(clave, JSON.stringify(registros));
  }

  return {
    /** Devuelve todos los registros. */
    listar() {
      return leer();
    },

    /** Devuelve un registro por su id, o null si no existe. */
    obtener(id) {
      return leer().find((r) => r[campoId] === id) || null;
    },

    /** Agrega un registro nuevo. Lanza error si el id ya existe. */
    crear(registro) {
      const registros = leer();
      if (registros.some((r) => r[campoId] === registro[campoId])) {
        throw new Error(`Ya existe un registro con ${campoId} "${registro[campoId]}".`);
      }
      const nuevo = copiar(registro);
      registros.push(nuevo);
      escribir(registros);
      return nuevo;
    },

    /** Modifica un registro existente (no permite cambiar el id). */
    actualizar(id, cambios) {
      const registros = leer();
      const indice = registros.findIndex((r) => r[campoId] === id);
      if (indice === -1) throw new Error(`No existe un registro con ${campoId} "${id}".`);
      registros[indice] = { ...registros[indice], ...copiar(cambios), [campoId]: id };
      escribir(registros);
      return registros[indice];
    },

    /** Elimina un registro. Devuelve true si existía. */
    eliminar(id) {
      const registros = leer();
      const filtrados = registros.filter((r) => r[campoId] !== id);
      escribir(filtrados);
      return filtrados.length !== registros.length;
    },

    /** Vuelve la colección a los datos semilla. */
    reiniciar() {
      escribir(copiar(semilla));
    },
  };
}

/** Guarda/lee un único valor JSON (carrito, sesión). */
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
