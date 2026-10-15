/* =========================================================
   Servicios de datos de la tienda (capa de persistencia).
   Los componentes NO usan localStorage directamente: pasan por
   estos servicios a través del contexto TiendaContext.
   ========================================================= */
import { crearColeccion, crearValor } from "./db";
import { PRODUCTOS, USUARIOS, ORDENES } from "./datos";

export function crearServicios(almacenamiento = window.localStorage) {
  const ordenesDB = crearColeccion("glitch_ordenes", ORDENES, "id", almacenamiento);

  return {
    productosDB: crearColeccion("glitch_productos", PRODUCTOS, "codigo", almacenamiento),
    usuariosDB: crearColeccion("glitch_usuarios", USUARIOS, "run", almacenamiento),
    ordenesDB,
    carritoStore: crearValor("glitch_carrito", [], almacenamiento),
    sesionStore: crearValor("glitch_sesion", null, almacenamiento),

    /** Genera el siguiente número de orden correlativo (ORD-1003, ORD-1004...). */
    siguienteIdOrden() {
      const numeros = ordenesDB.listar().map((o) => Number(o.id.replace("ORD-", "")) || 0);
      return `ORD-${Math.max(1000, ...numeros) + 1}`;
    },
  };
}
