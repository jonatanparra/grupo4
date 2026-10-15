import { act, renderHook } from "@testing-library/react";
import { TiendaProvider, useTienda } from "./TiendaContext";
import { crearServiciosPrueba } from "../test/utilidades";

/** Monta el hook useTienda con servicios simulados (mock de localStorage). */
function montarTienda(opciones) {
  const servicios = crearServiciosPrueba(opciones);
  const wrapper = ({ children }) => <TiendaProvider servicios={servicios}>{children}</TiendaProvider>;
  const { result } = renderHook(() => useTienda(), { wrapper });
  return { result, servicios };
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

describe("TiendaContext (estado global + persistencia)", () => {
  it("carga los productos desde la base de datos simulada", () => {
    const { result } = montarTienda();
    expect(result.current.productos.length).toBe(12);
  });

  it("agrega al carrito y lo persiste en el almacenamiento", () => {
    const { result, servicios } = montarTienda();
    act(() => result.current.agregarAlCarrito("GS-001", 2));
    expect(result.current.carrito).toEqual([{ codigo: "GS-001", cantidad: 2 }]);
    expect(servicios.carritoStore.leer()).toEqual([{ codigo: "GS-001", cantidad: 2 }]);

    act(() => result.current.cambiarCantidad("GS-001", -1));
    expect(result.current.carrito[0].cantidad).toBe(1);
    act(() => result.current.quitarDelCarrito("GS-001"));
    expect(result.current.carrito).toEqual([]);
  });

  it("aplicarCupon acepta cupones válidos y rechaza los inválidos", () => {
    const { result } = montarTienda();
    let valido;
    act(() => (valido = result.current.aplicarCupon("glitch10")));
    expect(valido).toBeTrue();
    expect(result.current.cupon).toBe("GLITCH10");
    act(() => (valido = result.current.aplicarCupon("nada")));
    expect(valido).toBeFalse();
    expect(result.current.cupon).toBe("");
  });

  it("CRUD de productos actualiza el estado en tiempo real", () => {
    const { result } = montarTienda();
    const nuevo = { codigo: "GS-100", nombre: "Nuevo", categoria: "Indie", precio: 1000, descuento: 0, stock: 5, stockCritico: 1, descripcion: "", imagen: "" };
    act(() => result.current.crearProducto(nuevo));
    expect(result.current.productos.length).toBe(13);
    act(() => result.current.actualizarProducto("GS-100", { precio: 2000 }));
    expect(result.current.productos.find((p) => p.codigo === "GS-100").precio).toBe(2000);
    act(() => result.current.eliminarProducto("GS-100"));
    expect(result.current.productos.length).toBe(12);
  });

  it("eliminar un producto también lo quita del carrito", () => {
    const { result } = montarTienda({ carrito: [{ codigo: "GS-001", cantidad: 1 }] });
    act(() => result.current.eliminarProducto("GS-001"));
    expect(result.current.carrito).toEqual([]);
  });

  it("no permite registrar dos usuarios con el mismo correo", () => {
    const { result } = montarTienda();
    expect(() => result.current.crearUsuario({ run: "11111111", correo: "CAMILA.ROJAS@duoc.cl" })).toThrowError(/correo/);
  });

  it("iniciarSesion valida credenciales y no guarda la contraseña en la sesión", () => {
    const { result, servicios } = montarTienda();
    let usuario;
    act(() => (usuario = result.current.iniciarSesion("camila.rojas@duoc.cl", "mala")));
    expect(usuario).toBeNull();

    act(() => (usuario = result.current.iniciarSesion("camila.rojas@duoc.cl", "admin123")));
    expect(usuario.tipo).toBe("Administrador");
    expect(result.current.usuarioActual.contrasena).toBeUndefined();
    expect(servicios.sesionStore.leer().nombre).toBe("Camila");

    act(() => result.current.cerrarSesion());
    expect(result.current.usuarioActual).toBeNull();
  });

  it("actualizar al usuario con sesión activa refresca la sesión", () => {
    const { result } = montarTienda();
    act(() => result.current.iniciarSesion("camila.rojas@duoc.cl", "admin123"));
    act(() => result.current.actualizarUsuario("191102207", { nombre: "Cami" }));
    expect(result.current.usuarioActual.nombre).toBe("Cami");
  });

  describe("procesarCompra", () => {
    it("compra pagada: crea la orden, descuenta stock y vacía el carrito", () => {
      const { result } = montarTienda({ carrito: [{ codigo: "GS-001", cantidad: 2 }] });
      const stockAntes = result.current.productos.find((p) => p.codigo === "GS-001").stock;
      let orden;
      act(() => (orden = result.current.procesarCompra(DATOS_COMPRA)));

      expect(orden.estado).toBe("Pagado");
      expect(orden.id).toBe("ORD-1003");
      expect(orden.items[0]).toEqual(jasmine.objectContaining({ codigo: "GS-001", cantidad: 2 }));
      expect(result.current.productos.find((p) => p.codigo === "GS-001").stock).toBe(stockAntes - 2);
      expect(result.current.carrito).toEqual([]);
      expect(result.current.ordenes.length).toBe(3);
    });

    it("pago rechazado: registra la orden rechazada y conserva carrito y stock", () => {
      const { result } = montarTienda({ carrito: [{ codigo: "GS-001", cantidad: 1 }] });
      let orden;
      act(() => (orden = result.current.procesarCompra(DATOS_COMPRA, { simularRechazo: true })));
      expect(orden.estado).toBe("Rechazado");
      expect(orden.motivoRechazo).toContain("rechazado");
      expect(result.current.carrito.length).toBe(1);
      expect(result.current.productos.find((p) => p.codigo === "GS-001").stock).toBe(22);
    });

    it("rechaza la compra si no hay stock suficiente", () => {
      const { result, servicios } = montarTienda({ carrito: [{ codigo: "GS-005", cantidad: 3 }] });
      servicios.productosDB.actualizar("GS-005", { stock: 1 }); // alguien compró antes
      let orden;
      act(() => (orden = result.current.procesarCompra(DATOS_COMPRA)));
      expect(orden.estado).toBe("Rechazado");
      expect(orden.motivoRechazo).toContain("stock");
    });
  });
});
