/* =========================================================
   Contexto global de la tienda.
   Conecta la capa de persistencia (servicios/localStorage) con
   los componentes React: cada acción guarda en la "base de datos"
   y actualiza el estado, por lo que la interfaz se refresca al
   instante (ej: al comprar baja el stock en el panel admin).
   ========================================================= */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { crearServicios } from "../data/servicios";
import * as Carrito from "../utils/carrito";

const TiendaContext = createContext(null);

/** Quita la contraseña antes de guardar al usuario en la sesión. */
function datosSesion(usuario) {
  const { contrasena, ...publico } = usuario;
  return publico;
}

export function TiendaProvider({ children, servicios: serviciosInyectados }) {
  // En las pruebas se pueden inyectar servicios simulados (mocks).
  const servicios = useMemo(() => serviciosInyectados || crearServicios(), [serviciosInyectados]);
  const { productosDB, usuariosDB, ordenesDB, carritoStore, sesionStore } = servicios;

  const [productos, setProductos] = useState(() => productosDB.listar());
  const [usuarios, setUsuarios] = useState(() => usuariosDB.listar());
  const [ordenes, setOrdenes] = useState(() => ordenesDB.listar());
  const [carrito, setCarrito] = useState(() => carritoStore.leer());
  const [usuarioActual, setUsuarioActual] = useState(() => sesionStore.leer());
  const [cupon, setCupon] = useState("");

  // ---------- Carrito ----------
  const guardarCarrito = useCallback(
    (nuevo) => {
      carritoStore.guardar(nuevo);
      setCarrito(nuevo);
    },
    [carritoStore]
  );

  const buscarProducto = useCallback((codigo) => productos.find((p) => p.codigo === codigo), [productos]);

  const agregarAlCarrito = useCallback(
    (codigo, cantidad = 1) => guardarCarrito(Carrito.agregarItem(carrito, buscarProducto(codigo), cantidad)),
    [carrito, buscarProducto, guardarCarrito]
  );

  const cambiarCantidad = useCallback(
    (codigo, delta) => {
      const producto = buscarProducto(codigo);
      if (producto) guardarCarrito(Carrito.cambiarCantidad(carrito, producto, delta));
    },
    [carrito, buscarProducto, guardarCarrito]
  );

  const quitarDelCarrito = useCallback((codigo) => guardarCarrito(Carrito.quitarItem(carrito, codigo)), [carrito, guardarCarrito]);

  const vaciarCarrito = useCallback(() => guardarCarrito([]), [guardarCarrito]);

  const aplicarCupon = useCallback((codigo) => {
    if (Carrito.porcentajeCupon(codigo) > 0) {
      setCupon(codigo.trim().toUpperCase());
      return true;
    }
    setCupon("");
    return false;
  }, []);

  // ---------- Productos (CRUD) ----------
  const crearProducto = useCallback(
    (producto) => {
      if (productosDB.obtener(producto.codigo)) throw new Error(`Ya existe un producto con el código ${producto.codigo}.`);
      productosDB.crear(producto);
      setProductos(productosDB.listar());
    },
    [productosDB]
  );

  const actualizarProducto = useCallback(
    (codigo, cambios) => {
      productosDB.actualizar(codigo, cambios);
      setProductos(productosDB.listar());
    },
    [productosDB]
  );

  const eliminarProducto = useCallback(
    (codigo) => {
      productosDB.eliminar(codigo);
      setProductos(productosDB.listar());
      guardarCarrito(Carrito.quitarItem(carritoStore.leer(), codigo));
    },
    [productosDB, carritoStore, guardarCarrito]
  );

  // ---------- Usuarios (CRUD) ----------
  const crearUsuario = useCallback(
    (usuario) => {
      if (usuariosDB.obtener(usuario.run)) throw new Error("Ya existe un usuario con ese RUN.");
      if (usuariosDB.listar().some((u) => u.correo.toLowerCase() === usuario.correo.toLowerCase())) {
        throw new Error("Ya existe una cuenta con ese correo.");
      }
      usuariosDB.crear(usuario);
      setUsuarios(usuariosDB.listar());
    },
    [usuariosDB]
  );

  const actualizarUsuario = useCallback(
    (run, cambios) => {
      const actualizado = usuariosDB.actualizar(run, cambios);
      setUsuarios(usuariosDB.listar());
      if (usuarioActual?.run === run) {
        const sesion = datosSesion(actualizado);
        sesionStore.guardar(sesion);
        setUsuarioActual(sesion);
      }
    },
    [usuariosDB, sesionStore, usuarioActual]
  );

  const eliminarUsuario = useCallback(
    (run) => {
      usuariosDB.eliminar(run);
      setUsuarios(usuariosDB.listar());
    },
    [usuariosDB]
  );

  // ---------- Sesión ----------
  const iniciarSesion = useCallback(
    (correo, contrasena) => {
      const usuario = usuariosDB
        .listar()
        .find((u) => u.correo.toLowerCase() === correo.trim().toLowerCase() && u.contrasena === contrasena);
      if (!usuario) return null;
      const sesion = datosSesion(usuario);
      sesionStore.guardar(sesion);
      setUsuarioActual(sesion);
      return sesion;
    },
    [usuariosDB, sesionStore]
  );

  const cerrarSesion = useCallback(() => {
    sesionStore.guardar(null);
    setUsuarioActual(null);
  }, [sesionStore]);

  // ---------- Compra ----------
  /**
   * Registra una orden con los datos del checkout.
   * Si el pago es rechazado (simulado) o falta stock, la orden queda "Rechazado"
   * y el carrito se conserva para reintentar. Si se paga, se descuenta stock y
   * se vacía el carrito.
   */
  const procesarCompra = useCallback(
    (datos, { simularRechazo = false } = {}) => {
      const productosActuales = productosDB.listar();
      const lineas = Carrito.detalleCarrito(carrito, productosActuales);
      const totales = Carrito.calcularTotales(carrito, productosActuales, cupon, datos.tipoEnvio);
      const sinStock = Carrito.lineasSinStock(carrito, productosActuales);

      let motivoRechazo = "";
      if (!lineas.length) motivoRechazo = "El carrito está vacío.";
      else if (sinStock.length) motivoRechazo = "No hay stock suficiente para uno o más productos.";
      else if (simularRechazo) motivoRechazo = "El medio de pago fue rechazado por el banco emisor.";

      const orden = {
        id: servicios.siguienteIdOrden(),
        fecha: new Date().toISOString(),
        estado: motivoRechazo ? "Rechazado" : "Pagado",
        motivoRechazo,
        cliente: { nombre: datos.nombre, apellidos: datos.apellidos, correo: datos.correo },
        envio: {
          tipo: datos.tipoEnvio,
          calle: datos.calle,
          departamento: datos.departamento,
          region: datos.region,
          comuna: datos.comuna,
          indicaciones: datos.indicaciones,
        },
        metodoPago: datos.metodoPago,
        items: lineas.map((l) => ({ codigo: l.codigo, nombre: l.producto.nombre, precioUnitario: l.precioUnitario, cantidad: l.cantidad })),
        cupon,
        ...totales,
      };

      ordenesDB.crear(orden);
      setOrdenes(ordenesDB.listar());

      if (orden.estado === "Pagado") {
        lineas.forEach((l) => productosDB.actualizar(l.codigo, { stock: l.producto.stock - l.cantidad }));
        setProductos(productosDB.listar());
        guardarCarrito([]);
        setCupon("");
      }
      return orden;
    },
    [carrito, cupon, servicios, productosDB, ordenesDB, guardarCarrito]
  );

  const valor = {
    productos,
    usuarios,
    ordenes,
    carrito,
    cupon,
    usuarioActual,
    agregarAlCarrito,
    cambiarCantidad,
    quitarDelCarrito,
    vaciarCarrito,
    aplicarCupon,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    iniciarSesion,
    cerrarSesion,
    procesarCompra,
  };

  return <TiendaContext.Provider value={valor}>{children}</TiendaContext.Provider>;
}

export function useTienda() {
  const contexto = useContext(TiendaContext);
  if (!contexto) throw new Error("useTienda debe usarse dentro de <TiendaProvider>.");
  return contexto;
}
