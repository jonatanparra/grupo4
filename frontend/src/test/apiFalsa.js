/* =========================================================
   API falsa (mock) para las pruebas de componentes.
   Tiene la misma forma que crearApi() (src/api/servicios.js),
   pero guarda los datos en memoria y responde con promesas, igual
   que el backend real (incluidos los errores 401, 403 y 409).
   Así las pruebas no dependen de la red ni de Oracle.
   ========================================================= */
import { crearAlmacenSesion, crearValor } from "../api/almacenamiento";
import { ErrorApi } from "../api/cliente";
import { calcularTotales, detalleCarrito, lineasSinStock, porcentajeCupon } from "../utils/carrito";
import { CATEGORIAS, ORDENES, PRODUCTOS, USUARIOS } from "./datosPrueba";

const copiar = (valor) => JSON.parse(JSON.stringify(valor));

/** Mock de localStorage en memoria. */
export function crearAlmacenamientoFalso(datosIniciales = {}) {
  const datos = new Map(Object.entries(datosIniciales));
  return {
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => datos.set(clave, String(valor)),
    removeItem: (clave) => datos.delete(clave),
    clear: () => datos.clear(),
  };
}

/** Quita la contraseña, como hace UsuarioDTO en el backend. */
function publico({ contrasena, ...usuario }) {
  return usuario;
}

/**
 * @param {object} opciones
 * @param {Array}  opciones.carrito  carrito inicial
 * @param {object} opciones.sesion   usuario con sesión iniciada (simula tokens válidos)
 * @param {string} opciones.errorCatalogo  si se indica, listar productos falla con ese mensaje
 */
export function crearApiFalsa({ carrito, sesion, errorCatalogo } = {}) {
  const almacenamiento = crearAlmacenamientoFalso(carrito ? { glitch_carrito: JSON.stringify(carrito) } : {});
  const tokens = crearAlmacenSesion(almacenamiento);
  const datos = {
    categorias: copiar(CATEGORIAS),
    productos: copiar(PRODUCTOS),
    usuarios: copiar(USUARIOS),
    ordenes: copiar(ORDENES),
  };
  let usuarioSesion = sesion ? datos.usuarios.find((u) => u.run === sesion.run) || { ...sesion } : null;
  if (sesion) tokens.guardar({ accessToken: `acceso-${sesion.run}`, refreshToken: `renovacion-${sesion.run}` });
  let siguienteOrden = 1003;
  const avisos = new Set();

  const respuesta = (valor) => Promise.resolve(copiar(valor));
  const error = (estado, mensaje) => Promise.reject(new ErrorApi(estado, mensaje));
  const exigirRol = (...roles) => {
    if (!usuarioSesion) throw new ErrorApi(401, "Debes iniciar sesión.");
    if (!roles.includes(usuarioSesion.tipo)) throw new ErrorApi(403, "No tienes permisos para esta acción.");
  };
  const conRol = (roles, accion) => {
    try {
      exigirRol(...roles);
      return accion();
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const ADMIN = ["Administrador"];
  const STAFF = ["Administrador", "Vendedor"];

  function abrirSesion(usuario) {
    usuarioSesion = usuario;
    tokens.guardar({ accessToken: `acceso-${usuario.run}`, refreshToken: `renovacion-${usuario.run}` });
    return respuesta(publico(usuario));
  }

  return {
    datos, // acceso directo a la "base de datos" para verificar resultados en las pruebas
    tokens,
    carrito: crearValor("glitch_carrito", [], almacenamiento),

    alExpirarSesion(aviso) {
      avisos.add(aviso);
      return () => avisos.delete(aviso);
    },
    /** Simula que el backend invalidó la sesión (ej: el refresh token venció). */
    expirarSesion() {
      usuarioSesion = null;
      tokens.limpiar();
      avisos.forEach((aviso) => aviso());
    },

    auth: {
      haySesion: () => Boolean(tokens.leer()?.accessToken),
      iniciarSesion(correo, contrasena) {
        const usuario = datos.usuarios.find((u) => u.correo.toLowerCase() === correo.trim().toLowerCase() && u.contrasena === contrasena);
        return usuario ? abrirSesion(usuario) : error(401, "Correo o contraseña incorrectos.");
      },
      registrar(nuevo) {
        if (datos.usuarios.some((u) => u.run === nuevo.run)) return error(409, "Ya existe un usuario con ese RUN.");
        if (datos.usuarios.some((u) => u.correo.toLowerCase() === nuevo.correo.toLowerCase())) return error(409, "Ya existe una cuenta con ese correo.");
        const usuario = { ...nuevo, tipo: "Cliente" };
        datos.usuarios.push(usuario);
        return abrirSesion(usuario);
      },
      perfil: () => (usuarioSesion && tokens.leer() ? respuesta(publico(usuarioSesion)) : error(401, "Token inválido.")),
      cerrarSesion() {
        usuarioSesion = null;
        tokens.limpiar();
      },
    },

    productos: {
      listar: () => (errorCatalogo ? error(0, errorCatalogo) : respuesta(datos.productos)),
      crear: (producto) =>
        conRol(ADMIN, () => {
          if (datos.productos.some((p) => p.codigo === producto.codigo)) return error(409, `Ya existe un producto con el código ${producto.codigo}.`);
          datos.productos.push(copiar(producto));
          return respuesta(producto);
        }),
      actualizar: (codigo, cambios) =>
        conRol(ADMIN, () => {
          const producto = datos.productos.find((p) => p.codigo === codigo);
          if (!producto) return error(404, "No existe el producto.");
          Object.assign(producto, copiar(cambios), { codigo });
          return respuesta(producto);
        }),
      eliminar: (codigo) =>
        conRol(ADMIN, () => {
          datos.productos = datos.productos.filter((p) => p.codigo !== codigo);
          return respuesta(null);
        }),
    },

    categorias: {
      listar: () => respuesta(datos.categorias),
    },

    usuarios: {
      listar: () => conRol(ADMIN, () => respuesta(datos.usuarios.map(publico))),
      crear: (usuario) =>
        conRol(ADMIN, () => {
          if (datos.usuarios.some((u) => u.run === usuario.run)) return error(409, "Ya existe un usuario con ese RUN.");
          if (datos.usuarios.some((u) => u.correo.toLowerCase() === usuario.correo.toLowerCase())) return error(409, "Ya existe una cuenta con ese correo.");
          datos.usuarios.push(copiar(usuario));
          return respuesta(publico(usuario));
        }),
      actualizar: (run, cambios) =>
        conRol(ADMIN, () => {
          const usuario = datos.usuarios.find((u) => u.run === run);
          if (!usuario) return error(404, "No existe el usuario.");
          Object.assign(usuario, copiar(cambios), { run });
          return respuesta(publico(usuario));
        }),
      eliminar: (run) =>
        conRol(ADMIN, () => {
          if (run === usuarioSesion.run) return error(400, "No puedes eliminar tu propia cuenta.");
          datos.usuarios = datos.usuarios.filter((u) => u.run !== run);
          return respuesta(null);
        }),
    },

    boletas: {
      listar: () => conRol(STAFF, () => respuesta(datos.ordenes)),
      mias: () => conRol([...STAFF, "Cliente"], () => respuesta(datos.ordenes.filter((o) => o.usuarioRun === usuarioSesion.run))),
      obtener(id) {
        const orden = datos.ordenes.find((o) => o.id === id);
        return orden ? respuesta(orden) : error(404, `No existe la boleta ${id}.`);
      },
      cambiarEstado: (id, estado) =>
        conRol(ADMIN, () => {
          const orden = datos.ordenes.find((o) => o.id === id);
          orden.estado = estado;
          return respuesta(orden);
        }),
      /** Misma lógica que BoletaService: recalcula montos y valida stock en el "servidor". */
      comprar(compra) {
        const lineas = detalleCarrito(compra.items, datos.productos);
        const sinStock = lineasSinStock(compra.items, datos.productos);
        if (compra.cupon && !porcentajeCupon(compra.cupon)) return error(400, `El cupón ${compra.cupon} no es válido.`);
        let motivoRechazo = "";
        if (sinStock.length) motivoRechazo = "No hay stock suficiente de uno o más productos.";
        else if (compra.simularRechazo) motivoRechazo = "El medio de pago fue rechazado por el banco emisor.";
        const orden = {
          id: `ORD-${siguienteOrden++}`,
          fecha: new Date().toISOString(),
          estado: motivoRechazo ? "Rechazado" : "Pagado",
          motivoRechazo,
          usuarioRun: usuarioSesion?.run ?? null,
          cliente: compra.cliente,
          envio: compra.envio,
          metodoPago: compra.metodoPago,
          items: lineas.map((l) => ({ codigo: l.codigo, nombre: l.producto.nombre, precioUnitario: l.precioUnitario, cantidad: l.cantidad, totalLinea: l.totalLinea })),
          cupon: compra.cupon || "",
          ...calcularTotales(compra.items, datos.productos, compra.cupon, compra.envio.tipo),
        };
        if (!motivoRechazo) lineas.forEach((l) => (datos.productos.find((p) => p.codigo === l.codigo).stock -= l.cantidad));
        datos.ordenes.unshift(orden);
        return respuesta(orden);
      },
    },
  };
}
