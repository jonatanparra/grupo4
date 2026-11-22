import { act, renderHook, waitFor } from "@testing-library/react";
import { TiendaProvider, useTienda } from "./TiendaContext";
import { crearApiFalsa, USUARIO_ADMIN, USUARIO_CLIENTE, USUARIO_VENDEDOR, esperarQue } from "../test/utilidades";

/** Monta el hook useTienda con una API simulada (mock) y espera la carga inicial. */
async function montarTienda(opciones) {
  const api = crearApiFalsa(opciones);
  const wrapper = ({ children }) => <TiendaProvider api={api}>{children}</TiendaProvider>;
  const { result } = renderHook(() => useTienda(), { wrapper });
  await waitFor(() => {
    const c = result.current;
    if (c.catalogo.cargando || c.verificandoSesion || c.datosRol.cargando) throw new Error("cargando");
  });
  return { result, api };
}

const DATOS_COMPRA = {
  nombre: "Ana",
  apellidos: "Pérez",
  correo: "ana@gmail.com",
  tipoEnvio: "domicilio",
  calle: "Calle 1",
  departamento: "",
  region: "metropolitana",
  comuna: "santiago",
  indicaciones: "",
  metodoPago: "debito",
};

describe("TiendaContext (estado global + API REST)", () => {
  it("carga productos y categorías desde la API", async () => {
    const { result } = await montarTienda();
    expect(result.current.productos.length).toBe(12);
    expect(result.current.categorias.length).toBe(5);
    expect(result.current.usuarioActual).toBeNull();
  });

  it("informa el error si el backend no responde", async () => {
    const { result } = await montarTienda({ errorCatalogo: "No se pudo conectar con el servidor." });
    expect(result.current.catalogo.error).toContain("No se pudo conectar");
  });

  it("agrega al carrito y lo persiste en el navegador", async () => {
    const { result, api } = await montarTienda();
    act(() => result.current.agregarAlCarrito("GS-001", 2));
    expect(result.current.carrito).toEqual([{ codigo: "GS-001", cantidad: 2 }]);
    expect(api.carrito.leer()).toEqual([{ codigo: "GS-001", cantidad: 2 }]);

    act(() => result.current.cambiarCantidad("GS-001", -1));
    expect(result.current.carrito[0].cantidad).toBe(1);
    act(() => result.current.quitarDelCarrito("GS-001"));
    expect(result.current.carrito).toEqual([]);
  });

  it("aplicarCupon acepta cupones válidos y rechaza los inválidos", async () => {
    const { result } = await montarTienda();
    let valido;
    act(() => (valido = result.current.aplicarCupon("glitch10")));
    expect(valido).toBeTrue();
    expect(result.current.cupon).toBe("GLITCH10");
    act(() => (valido = result.current.aplicarCupon("nada")));
    expect(valido).toBeFalse();
    expect(result.current.cupon).toBe("");
  });

  describe("sesión (JWT)", () => {
    it("iniciarSesion guarda solo los tokens y deja al usuario sin contraseña", async () => {
      const { result, api } = await montarTienda();
      await act(() => result.current.iniciarSesion("camila.rojas@duoc.cl", "admin123"));
      expect(result.current.usuarioActual.tipo).toBe("Administrador");
      expect(result.current.usuarioActual.contrasena).toBeUndefined();
      expect(Object.keys(api.tokens.leer())).toEqual(["accessToken", "refreshToken"]);

      act(() => result.current.cerrarSesion());
      expect(result.current.usuarioActual).toBeNull();
      expect(api.tokens.leer()).toBeNull();
    });

    it("con credenciales incorrectas rechaza con el mensaje del backend", async () => {
      const { result } = await montarTienda();
      await expectAsync(result.current.iniciarSesion("camila.rojas@duoc.cl", "mala")).toBeRejectedWithError(/incorrectos/);
      expect(result.current.usuarioActual).toBeNull();
    });

    it("al recargar con tokens guardados, recupera al usuario desde /auth/me", async () => {
      const { result } = await montarTienda({ sesion: USUARIO_CLIENTE });
      expect(result.current.usuarioActual.nombre).toBe("Javiera");
    });

    it("si la sesión expira sin poder renovarse, la cierra en toda la app", async () => {
      const { result, api } = await montarTienda({ sesion: USUARIO_CLIENTE });
      act(() => api.expirarSesion());
      expect(result.current.usuarioActual).toBeNull();
    });
  });

  describe("datos según el rol", () => {
    it("el Administrador carga usuarios y todas las órdenes", async () => {
      const { result } = await montarTienda({ sesion: USUARIO_ADMIN });
      expect(result.current.usuarios.length).toBe(3);
      expect(result.current.ordenes.length).toBe(2);
    });

    it("el Vendedor carga las órdenes pero no los usuarios", async () => {
      const { result } = await montarTienda({ sesion: USUARIO_VENDEDOR });
      expect(result.current.ordenes.length).toBe(2);
      expect(result.current.usuarios).toEqual([]);
    });

    it("el Cliente solo carga sus propias compras", async () => {
      const { result } = await montarTienda({ sesion: USUARIO_CLIENTE });
      expect(result.current.ordenes.map((o) => o.id)).toEqual(["ORD-1001"]);
    });
  });

  it("CRUD de productos actualiza el estado con la respuesta de la API", async () => {
    const { result, api } = await montarTienda({ sesion: USUARIO_ADMIN });
    const nuevo = { codigo: "GS-100", nombre: "Nuevo", categoria: "Indie", precio: 1000, descuento: 0, stock: 5, stockCritico: 1, descripcion: "", imagen: "" };
    await act(() => result.current.crearProducto(nuevo));
    expect(result.current.productos.length).toBe(13);
    await act(() => result.current.actualizarProducto("GS-100", { ...nuevo, precio: 2000 }));
    expect(result.current.productos.find((p) => p.codigo === "GS-100").precio).toBe(2000);
    await act(() => result.current.eliminarProducto("GS-100"));
    expect(result.current.productos.length).toBe(12);
    expect(api.datos.productos.length).toBe(12);
  });

  it("eliminar un producto también lo quita del carrito", async () => {
    const { result } = await montarTienda({ sesion: USUARIO_ADMIN, carrito: [{ codigo: "GS-001", cantidad: 1 }] });
    await act(() => result.current.eliminarProducto("GS-001"));
    expect(result.current.carrito).toEqual([]);
  });

  it("si el backend responde 403, la acción falla y el estado no cambia", async () => {
    const { result } = await montarTienda({ sesion: USUARIO_VENDEDOR });
    await expectAsync(result.current.eliminarProducto("GS-001")).toBeRejectedWithError(/permisos/);
    expect(result.current.productos.length).toBe(12);
  });

  it("no permite crear dos usuarios con el mismo correo (409)", async () => {
    const { result } = await montarTienda({ sesion: USUARIO_ADMIN });
    await expectAsync(result.current.crearUsuario({ run: "111111111", correo: "CAMILA.ROJAS@duoc.cl" })).toBeRejectedWithError(/correo/);
  });

  it("actualizar al usuario con sesión activa refresca la sesión", async () => {
    const { result } = await montarTienda({ sesion: USUARIO_ADMIN });
    await act(() => result.current.actualizarUsuario("191102207", { ...USUARIO_ADMIN, nombre: "Cami" }));
    expect(result.current.usuarioActual.nombre).toBe("Cami");
  });

  describe("procesarCompra", () => {
    it("compra pagada: el backend crea la boleta, descuenta stock y se vacía el carrito", async () => {
      const { result, api } = await montarTienda({ carrito: [{ codigo: "GS-001", cantidad: 2 }] });
      let orden;
      await act(async () => (orden = await result.current.procesarCompra(DATOS_COMPRA)));

      expect(orden.estado).toBe("Pagado");
      expect(orden.id).toBe("ORD-1003");
      expect(orden.items[0]).toEqual(jasmine.objectContaining({ codigo: "GS-001", cantidad: 2 }));
      expect(result.current.carrito).toEqual([]);
      expect(result.current.ordenes[0].id).toBe("ORD-1003");
      await esperarQue(() => result.current.productos.find((p) => p.codigo === "GS-001").stock === 20, "result.current.productos.find((p) => p.codigo === \"GS-001\").stock === 20");
    expect(result.current.productos.find((p) => p.codigo === "GS-001").stock).toBe(20);
      expect(api.datos.ordenes.length).toBe(3);
    });

    it("envía solo códigos y cantidades: los montos los calcula el backend", async () => {
      const { result, api } = await montarTienda({ carrito: [{ codigo: "GS-001", cantidad: 1 }] });
      const comprar = spyOn(api.boletas, "comprar").and.callThrough();
      await act(() => result.current.procesarCompra(DATOS_COMPRA));
      const enviado = comprar.calls.mostRecent().args[0];
      expect(enviado.items).toEqual([{ codigo: "GS-001", cantidad: 1 }]);
      expect(enviado.total).toBeUndefined();
      expect(enviado.envio.tipo).toBe("domicilio");
    });

    it("pago rechazado: registra la boleta rechazada y conserva carrito y stock", async () => {
      const { result } = await montarTienda({ carrito: [{ codigo: "GS-001", cantidad: 1 }] });
      let orden;
      await act(async () => (orden = await result.current.procesarCompra(DATOS_COMPRA, { simularRechazo: true })));
      expect(orden.estado).toBe("Rechazado");
      expect(orden.motivoRechazo).toContain("rechazado");
      expect(result.current.carrito.length).toBe(1);
      expect(result.current.productos.find((p) => p.codigo === "GS-001").stock).toBe(22);
    });

    it("rechaza la compra si en el backend ya no hay stock suficiente", async () => {
      const { result, api } = await montarTienda({ carrito: [{ codigo: "GS-005", cantidad: 3 }] });
      api.datos.productos.find((p) => p.codigo === "GS-005").stock = 1; // alguien compró antes
      let orden;
      await act(async () => (orden = await result.current.procesarCompra(DATOS_COMPRA)));
      expect(orden.estado).toBe("Rechazado");
      expect(orden.motivoRechazo).toContain("stock");
    });
  });

  it("obtenerOrden busca en memoria o la pide al backend si hay sesión", async () => {
    const { result } = await montarTienda({ sesion: USUARIO_ADMIN });
    expect((await result.current.obtenerOrden("ORD-1002")).cliente.nombre).toBe("Pedro");
    expect(await result.current.obtenerOrden("ORD-9999")).toBeNull();
  });
});
