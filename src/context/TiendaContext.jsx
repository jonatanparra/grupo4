/* =========================================================
   Contexto global de la tienda.
   Conecta la API REST (backend Spring Boot) con los componentes:
   - Al iniciar carga el catálogo (productos y categorías).
   - Si hay tokens guardados, confirma la sesión con /auth/me
     (el rol siempre lo informa el backend, no el navegador).
   - Según el rol carga lo que corresponde: usuarios y órdenes
     (Administrador), órdenes (Vendedor) o sus compras (Cliente).
   - Cada acción llama a la API y actualiza el estado con la
     respuesta, por lo que la interfaz se refresca al instante.
   ========================================================= */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { crearApi } from "../api/servicios";
import * as Carrito from "../utils/carrito";

const TiendaContext = createContext(null);

const porCodigo = (a, b) => a.codigo.localeCompare(b.codigo);
const porNombre = (a, b) => a.nombre.localeCompare(b.nombre);

export function TiendaProvider({ children, api: apiInyectada }) {
  // En las pruebas se inyecta una API falsa (mock) que no usa la red.
  const api = useMemo(() => apiInyectada || crearApi(), [apiInyectada]);

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [catalogo, setCatalogo] = useState({ cargando: true, error: "" });
  const [usuarios, setUsuarios] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [datosRol, setDatosRol] = useState({ cargando: false, error: "" });
  const [carrito, setCarrito] = useState(() => api.carrito.leer());
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(() => api.auth.haySesion());
  const [cupon, setCupon] = useState("");

  // ---------- Catálogo ----------
  const cargarCatalogo = useCallback(async () => {
    setCatalogo({ cargando: true, error: "" });
    try {
      const [listaProductos, listaCategorias] = await Promise.all([api.productos.listar(), api.categorias.listar()]);
      setProductos(listaProductos);
      setCategorias(listaCategorias);
      setCatalogo({ cargando: false, error: "" });
    } catch (error) {
      setCatalogo({ cargando: false, error: error.message });
    }
  }, [api]);

  useEffect(() => {
    cargarCatalogo();
  }, [cargarCatalogo]);

  // ---------- Sesión ----------
  // Al recargar la página: si hay tokens, el backend confirma quién es el usuario y su rol.
  useEffect(() => {
    if (!api.auth.haySesion()) return;
    let vigente = true;
    api.auth
      .perfil()
      .then((usuario) => vigente && setUsuarioActual(usuario))
      .catch(() => api.auth.cerrarSesion())
      .finally(() => vigente && setVerificandoSesion(false));
    return () => {
      vigente = false;
    };
  }, [api]);

  // Si el token de renovación también venció, la sesión se cierra en toda la app.
  useEffect(() => api.alExpirarSesion(() => setUsuarioActual(null)), [api]);

  // Datos que dependen del rol
  const cargarDatosRol = useCallback(
    async (usuario) => {
      if (!usuario) {
        setUsuarios([]);
        setOrdenes([]);
        return;
      }
      setDatosRol({ cargando: true, error: "" });
      try {
        if (usuario.tipo === "Administrador") {
          const [listaUsuarios, listaOrdenes] = await Promise.all([api.usuarios.listar(), api.boletas.listar()]);
          setUsuarios(listaUsuarios);
          setOrdenes(listaOrdenes);
        } else if (usuario.tipo === "Vendedor") {
          setUsuarios([]);
          setOrdenes(await api.boletas.listar());
        } else {
          setUsuarios([]);
          setOrdenes(await api.boletas.mias());
        }
        setDatosRol({ cargando: false, error: "" });
      } catch (error) {
        setDatosRol({ cargando: false, error: error.message });
      }
    },
    [api]
  );

  const runActual = usuarioActual?.run;
  const tipoActual = usuarioActual?.tipo;
  useEffect(() => {
    cargarDatosRol(runActual ? { run: runActual, tipo: tipoActual } : null);
  }, [runActual, tipoActual, cargarDatosRol]);

  const iniciarSesion = useCallback(
    async (correo, contrasena) => {
      const usuario = await api.auth.iniciarSesion(correo, contrasena);
      setUsuarioActual(usuario);
      return usuario;
    },
    [api]
  );

  const registrar = useCallback(
    async (datos) => {
      const usuario = await api.auth.registrar(datos);
      setUsuarioActual(usuario);
      return usuario;
    },
    [api]
  );

  const cerrarSesion = useCallback(() => {
    api.auth.cerrarSesion();
    setUsuarioActual(null);
  }, [api]);

  // ---------- Carrito (se guarda en el navegador) ----------
  const guardarCarrito = useCallback(
    (nuevo) => {
      api.carrito.guardar(nuevo);
      setCarrito(nuevo);
    },
    [api]
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

  // ---------- Productos (CRUD vía API) ----------
  const crearProducto = useCallback(
    async (producto) => {
      const creado = await api.productos.crear(producto);
      setProductos((lista) => [...lista, creado].sort(porCodigo));
      return creado;
    },
    [api]
  );

  const actualizarProducto = useCallback(
    async (codigo, cambios) => {
      const actualizado = await api.productos.actualizar(codigo, cambios);
      setProductos((lista) => lista.map((p) => (p.codigo === codigo ? actualizado : p)));
      return actualizado;
    },
    [api]
  );

  const eliminarProducto = useCallback(
    async (codigo) => {
      await api.productos.eliminar(codigo);
      setProductos((lista) => lista.filter((p) => p.codigo !== codigo));
      guardarCarrito(Carrito.quitarItem(api.carrito.leer(), codigo));
    },
    [api, guardarCarrito]
  );

  // ---------- Usuarios (CRUD vía API, solo Administrador) ----------
  const crearUsuario = useCallback(
    async (usuario) => {
      const creado = await api.usuarios.crear(usuario);
      setUsuarios((lista) => [...lista, creado].sort(porNombre));
      return creado;
    },
    [api]
  );

  const actualizarUsuario = useCallback(
    async (run, cambios) => {
      const actualizado = await api.usuarios.actualizar(run, cambios);
      setUsuarios((lista) => lista.map((u) => (u.run === run ? actualizado : u)));
      if (runActual === run) setUsuarioActual(actualizado);
      return actualizado;
    },
    [api, runActual]
  );

  const eliminarUsuario = useCallback(
    async (run) => {
      await api.usuarios.eliminar(run);
      setUsuarios((lista) => lista.filter((u) => u.run !== run));
    },
    [api]
  );

  // ---------- Compra ----------
  /**
   * Envía la compra al backend, que calcula precios y totales, valida el stock
   * y responde con la boleta "Pagado" o "Rechazado". Si se paga, se vacía el
   * carrito y se recarga el catálogo (cambió el stock).
   */
  const procesarCompra = useCallback(
    async (datos, { simularRechazo = false } = {}) => {
      const orden = await api.boletas.comprar({
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
        items: carrito.map(({ codigo, cantidad }) => ({ codigo, cantidad })),
        cupon,
        simularRechazo,
      });
      setOrdenes((lista) => [orden, ...lista]);
      if (orden.estado === "Pagado") {
        guardarCarrito([]);
        setCupon("");
        api.productos
          .listar()
          .then(setProductos)
          .catch(() => {});
      }
      return orden;
    },
    [api, carrito, cupon, guardarCarrito]
  );

  /** Busca una orden en memoria o, si hay sesión, la pide al backend. */
  const obtenerOrden = useCallback(
    async (id) => {
      const local = ordenes.find((o) => o.id === id);
      if (local) return local;
      if (!runActual) return null;
      try {
        return await api.boletas.obtener(id);
      } catch {
        return null;
      }
    },
    [api, ordenes, runActual]
  );

  const cambiarEstadoOrden = useCallback(
    async (id, estado) => {
      const actualizada = await api.boletas.cambiarEstado(id, estado);
      setOrdenes((lista) => lista.map((o) => (o.id === id ? actualizada : o)));
      if (estado === "Anulado") api.productos.listar().then(setProductos).catch(() => {});
      return actualizada;
    },
    [api]
  );

  const valor = {
    productos,
    categorias,
    catalogo,
    cargarCatalogo,
    usuarios,
    ordenes,
    datosRol,
    carrito,
    cupon,
    usuarioActual,
    verificandoSesion,
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
    registrar,
    cerrarSesion,
    procesarCompra,
    obtenerOrden,
    cambiarEstadoOrden,
  };

  return <TiendaContext.Provider value={valor}>{children}</TiendaContext.Provider>;
}

export function useTienda() {
  const contexto = useContext(TiendaContext);
  if (!contexto) throw new Error("useTienda debe usarse dentro de <TiendaProvider>.");
  return contexto;
}
