import { fireEvent, screen, within } from "@testing-library/react";
import Productos from "./Productos";
import DetalleProducto from "./DetalleProducto";
import Carrito from "./Carrito";
import Ofertas from "./Ofertas";
import CategoriaDetalle from "./CategoriaDetalle";
import Checkout, { validarCheckout } from "./Checkout";
import CompraResultado from "./CompraResultado";
import MisCompras from "./MisCompras";
import { crearApiFalsa, renderConTienda, USUARIO_ADMIN, USUARIO_CLIENTE, esperarQue } from "../test/utilidades";

const tarjetas = () => screen.queryAllByTestId("tarjeta-producto");
const ubicacion = () => screen.getByTestId("ubicacion").textContent;

describe("Página Productos (catálogo desde la API + filtros)", () => {
  it("lista todo el catálogo al inicio", async () => {
    await renderConTienda(<Productos />);
    expect(tarjetas().length).toBe(12);
    expect(screen.getByText("12 resultados")).toBeTruthy();
  });

  it("filtra por texto de búsqueda", async () => {
    await renderConTienda(<Productos />);
    fireEvent.change(screen.getByLabelText("Buscar productos"), { target: { value: "hollow" } });
    expect(tarjetas().length).toBe(2);
  });

  it("filtra por categoría (categorías de la API) y por solo ofertas", async () => {
    await renderConTienda(<Productos />);
    fireEvent.click(screen.getByRole("button", { name: "Terror" }));
    expect(tarjetas().length).toBe(2);
    fireEvent.click(screen.getByLabelText("Solo ofertas"));
    expect(tarjetas().length).toBe(1);
  });

  it("muestra el estado vacío si no hay coincidencias", async () => {
    await renderConTienda(<Productos />);
    fireEvent.change(screen.getByLabelText("Buscar productos"), { target: { value: "zzzz" } });
    expect(screen.getByText("Sin resultados")).toBeTruthy();
  });

  it("al añadir un producto se guarda en el carrito del navegador", async () => {
    const { api } = await renderConTienda(<Productos />);
    fireEvent.click(screen.getByRole("button", { name: "Añadir Minecraft al carrito" }));
    expect(api.carrito.leer()).toEqual([{ codigo: "GS-011", cantidad: 1 }]);
  });
});

describe("Páginas Ofertas y Categoría", () => {
  it("Ofertas muestra solo productos con descuento, del mayor al menor", async () => {
    await renderConTienda(<Ofertas />);
    const nombres = tarjetas().map((t) => within(t).getByText(/%$/).textContent);
    expect(nombres).toEqual(["-40%", "-30%", "-25%", "-20%", "-15%"]);
  });

  it("Categoría muestra los productos de esa categoría", async () => {
    await renderConTienda(<CategoriaDetalle />, { ruta: "/categorias/indie", patron: "/categorias/:id" });
    expect(screen.getByRole("heading", { name: "Indie" })).toBeTruthy();
    expect(tarjetas().length).toBe(3);
  });

  it("Categoría inexistente muestra mensaje de no encontrada", async () => {
    await renderConTienda(<CategoriaDetalle />, { ruta: "/categorias/xyz", patron: "/categorias/:id" });
    expect(screen.getByText("Categoría no encontrada")).toBeTruthy();
  });
});

describe("Página DetalleProducto", () => {
  const renderDetalle = (codigo, opciones) => renderConTienda(<DetalleProducto />, { ruta: `/producto/${codigo}`, patron: "/producto/:codigo", ...opciones });

  it("muestra la información del producto según la URL", async () => {
    await renderDetalle("GS-007");
    expect(screen.getByRole("heading", { name: "Resident Evil II" })).toBeTruthy();
    expect(screen.getByText(/Survival horror centrado/)).toBeTruthy();
  });

  it("agrega la cantidad elegida al carrito", async () => {
    const { api } = await renderDetalle("GS-007");
    fireEvent.click(screen.getByLabelText("Aumentar cantidad"));
    fireEvent.click(screen.getByLabelText("Aumentar cantidad"));
    fireEvent.click(screen.getByRole("button", { name: "Añadir al carrito" }));
    expect(api.carrito.leer()).toEqual([{ codigo: "GS-007", cantidad: 3 }]);
    expect(screen.getByText(/Agregaste 3 × Resident Evil II/)).toBeTruthy();
  });

  it("muestra aviso de stock crítico", async () => {
    await renderDetalle("GS-005");
    expect(screen.getByText(/Quedan pocas unidades/)).toBeTruthy();
  });

  it("muestra mensaje si el producto no existe", async () => {
    await renderDetalle("NO-EXISTE");
    expect(screen.getByText("Producto no encontrado")).toBeTruthy();
  });
});

describe("Página Carrito", () => {
  it("muestra el estado vacío cuando no hay productos", async () => {
    await renderConTienda(<Carrito />);
    expect(screen.getByText("Tu carrito está vacío")).toBeTruthy();
  });

  it("lista las líneas, permite cambiar cantidades y vaciar", async () => {
    const api = crearApiFalsa({ carrito: [{ codigo: "GS-001", cantidad: 1 }, { codigo: "GS-003", cantidad: 2 }] });
    await renderConTienda(<Carrito />, { api });
    expect(screen.getAllByTestId("linea-carrito").length).toBe(2);

    fireEvent.click(screen.getAllByLabelText("Aumentar cantidad")[0]);
    expect(api.carrito.leer()[0].cantidad).toBe(2);

    fireEvent.click(screen.getByText("Vaciar carrito"));
    expect(screen.getByText("Tu carrito está vacío")).toBeTruthy();
  });
});

describe("Página Checkout", () => {
  const CARRITO = [{ codigo: "GS-001", cantidad: 1 }];
  const renderCheckout = (opciones = {}) =>
    renderConTienda(<Checkout />, { ruta: "/checkout", patron: "/checkout", api: crearApiFalsa({ carrito: CARRITO, ...opciones }) });
  const elegirPago = (valor) => fireEvent.change(screen.getByLabelText("Método de pago"), { target: { name: "metodoPago", value: valor } });

  it("redirige al carrito si está vacío", async () => {
    await renderConTienda(<Checkout />, { ruta: "/checkout", patron: "/checkout" });
    expect(ubicacion()).toBe("/carrito");
  });

  it("con sesión iniciada completa los datos del cliente automáticamente", async () => {
    await renderCheckout({ sesion: USUARIO_CLIENTE });
    expect(screen.getByLabelText("Nombre").value).toBe("Javiera");
    expect(screen.getByLabelText("Correo").value).toBe(USUARIO_CLIENTE.correo);
    expect(screen.getByLabelText("Calle y número").value).toBe("Camino Real 789");
    expect(screen.getByLabelText("Comuna").value).toBe("chillan");
  });

  it("al elegir retiro en tienda oculta la dirección y el envío pasa a gratis", async () => {
    await renderCheckout();
    expect(screen.queryByLabelText("Calle y número")).not.toBeNull();
    fireEvent.click(screen.getByLabelText("Retiro en tienda (gratis)"));
    expect(screen.queryByLabelText("Calle y número")).toBeNull();
    expect(screen.getByText("Gratis")).toBeTruthy();
  });

  it("no envía la compra al backend si hay campos inválidos", async () => {
    const { api } = await renderCheckout();
    const comprar = spyOn(api.boletas, "comprar").and.callThrough();
    fireEvent.click(screen.getByRole("button", { name: /Pagar ahora/ }));
    expect(screen.getByText("Falta completar: el método de pago.")).toBeTruthy();
    expect(comprar).not.toHaveBeenCalled();
  });

  it("pago exitoso navega a /compra/exito/:id", async () => {
    await renderCheckout({ sesion: USUARIO_CLIENTE });
    elegirPago("debito");
    fireEvent.click(screen.getByRole("button", { name: /Pagar ahora/ }));
    await esperarQue(() => ubicacion() === "/compra/exito/ORD-1003", "ubicacion() === \"/compra/exito/ORD-1003\"");
    expect(ubicacion()).toBe("/compra/exito/ORD-1003");
  });

  it("pago rechazado (simulado) navega a /compra/error/:id", async () => {
    await renderCheckout({ sesion: USUARIO_CLIENTE });
    elegirPago("credito");
    fireEvent.click(screen.getByLabelText(/Simular pago rechazado/));
    fireEvent.click(screen.getByRole("button", { name: /Pagar ahora/ }));
    await esperarQue(() => ubicacion() === "/compra/error/ORD-1003", "ubicacion() === \"/compra/error/ORD-1003\"");
    expect(ubicacion()).toBe("/compra/error/ORD-1003");
  });

  it("si el backend responde con error, lo muestra y permite reintentar", async () => {
    const { api } = await renderCheckout();
    spyOn(api.boletas, "comprar").and.returnValue(Promise.reject(new Error("No se pudo conectar con el servidor.")));
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { name: "nombre", value: "Ana" } });
    fireEvent.change(screen.getByLabelText("Apellidos"), { target: { name: "apellidos", value: "Soto" } });
    fireEvent.change(screen.getByLabelText("Correo"), { target: { name: "correo", value: "ana@gmail.com" } });
    fireEvent.click(screen.getByLabelText("Retiro en tienda (gratis)"));
    fireEvent.change(screen.getByLabelText("Región"), { target: { name: "region", value: "nuble" } });
    fireEvent.change(screen.getByLabelText("Comuna"), { target: { name: "comuna", value: "chillan" } });
    elegirPago("debito");
    fireEvent.click(screen.getByRole("button", { name: /Pagar ahora/ }));
    expect(await screen.findByText("No se pudo conectar con el servidor.")).toBeTruthy();
    expect(ubicacion()).toBe("/checkout");
    expect(screen.getByRole("button", { name: /Pagar ahora/ }).disabled).toBeFalse();
  });

  it("validarCheckout no exige calle cuando es retiro en tienda", () => {
    const errores = validarCheckout({ nombre: "A", apellidos: "B", correo: "a@gmail.com", tipoEnvio: "retiro", calle: "", departamento: "", region: "nuble", comuna: "chillan", indicaciones: "", metodoPago: "debito" });
    expect(Object.values(errores).every((e) => !e)).toBeTrue();
  });
});

describe("Página CompraResultado", () => {
  const comoAdmin = () => crearApiFalsa({ sesion: USUARIO_ADMIN });

  it("compra exitosa muestra el número de orden y permite enviar la boleta", async () => {
    await renderConTienda(<CompraResultado exito />, { ruta: "/compra/exito/ORD-1001", patron: "/compra/exito/:id", api: comoAdmin() });
    expect(await screen.findByText(/Se ha realizado la compra. Nro #ORD-1001/)).toBeTruthy();
    fireEvent.click(screen.getByText("Enviar boleta por email"));
    expect(screen.getByText("Boleta enviada ✓")).toBeTruthy();
  });

  it("imprimir boleta llama a window.print (mock)", async () => {
    spyOn(window, "print");
    await renderConTienda(<CompraResultado exito />, { ruta: "/compra/exito/ORD-1001", patron: "/compra/exito/:id", api: comoAdmin() });
    fireEvent.click(await screen.findByText("Imprimir boleta"));
    expect(window.print).toHaveBeenCalled();
  });

  it("pago fallido muestra el error y la opción de reintentar", async () => {
    await renderConTienda(<CompraResultado exito={false} />, { ruta: "/compra/error/ORD-1002", patron: "/compra/error/:id", api: comoAdmin() });
    expect(await screen.findByText(/No se pudo realizar el pago/)).toBeTruthy();
    expect(screen.getByText("Volver a realizar el pago").getAttribute("href")).toBe("/checkout");
  });

  it("orden inexistente muestra mensaje", async () => {
    await renderConTienda(<CompraResultado exito />, { ruta: "/compra/exito/ORD-9", patron: "/compra/exito/:id", api: comoAdmin() });
    expect(await screen.findByText("Orden no encontrada")).toBeTruthy();
  });
});

describe("Página Mis compras (Cliente)", () => {
  it("muestra solo las compras del usuario con sesión", async () => {
    await renderConTienda(<MisCompras />, { api: crearApiFalsa({ sesion: USUARIO_CLIENTE }) });
    expect(screen.getByText("ORD-1001")).toBeTruthy();
    expect(screen.queryByText("ORD-1002")).toBeNull();
  });
});
