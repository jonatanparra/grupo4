import { fireEvent, screen, within } from "@testing-library/react";
import Productos from "./Productos";
import DetalleProducto from "./DetalleProducto";
import Carrito from "./Carrito";
import Ofertas from "./Ofertas";
import CategoriaDetalle from "./CategoriaDetalle";
import Checkout, { validarCheckout } from "./Checkout";
import CompraResultado from "./CompraResultado";
import { crearServiciosPrueba, renderConTienda, USUARIO_CLIENTE } from "../test/utilidades";

const tarjetas = () => screen.queryAllByTestId("tarjeta-producto");

describe("Página Productos (filtros de búsqueda)", () => {
  it("lista todo el catálogo al inicio", () => {
    renderConTienda(<Productos />);
    expect(tarjetas().length).toBe(12);
    expect(screen.getByText("12 resultados")).toBeTruthy();
  });

  it("filtra por texto de búsqueda", () => {
    renderConTienda(<Productos />);
    fireEvent.change(screen.getByLabelText("Buscar productos"), { target: { value: "hollow" } });
    expect(tarjetas().length).toBe(2);
  });

  it("filtra por categoría y por solo ofertas", () => {
    renderConTienda(<Productos />);
    fireEvent.click(screen.getByRole("button", { name: "Terror" }));
    expect(tarjetas().length).toBe(2);
    fireEvent.click(screen.getByLabelText("Solo ofertas"));
    expect(tarjetas().length).toBe(1);
  });

  it("muestra el estado vacío si no hay coincidencias", () => {
    renderConTienda(<Productos />);
    fireEvent.change(screen.getByLabelText("Buscar productos"), { target: { value: "zzzz" } });
    expect(screen.getByText("Sin resultados")).toBeTruthy();
  });

  it("al añadir un producto se guarda en el carrito", () => {
    const { servicios } = renderConTienda(<Productos />);
    fireEvent.click(screen.getByRole("button", { name: "Añadir Minecraft al carrito" }));
    expect(servicios.carritoStore.leer()).toEqual([{ codigo: "GS-011", cantidad: 1 }]);
  });
});

describe("Páginas Ofertas y Categoría", () => {
  it("Ofertas muestra solo productos con descuento, del mayor al menor", () => {
    renderConTienda(<Ofertas />);
    const nombres = tarjetas().map((t) => within(t).getByText(/%$/).textContent);
    expect(nombres).toEqual(["-40%", "-30%", "-25%", "-20%", "-15%"]);
  });

  it("Categoría muestra los productos de esa categoría", () => {
    renderConTienda(<CategoriaDetalle />, { ruta: "/categorias/indie", patron: "/categorias/:id" });
    expect(screen.getByRole("heading", { name: "Indie" })).toBeTruthy();
    expect(tarjetas().length).toBe(3);
  });

  it("Categoría inexistente muestra mensaje de no encontrada", () => {
    renderConTienda(<CategoriaDetalle />, { ruta: "/categorias/xyz", patron: "/categorias/:id" });
    expect(screen.getByText("Categoría no encontrada")).toBeTruthy();
  });
});

describe("Página DetalleProducto", () => {
  const renderDetalle = (codigo, opciones) => renderConTienda(<DetalleProducto />, { ruta: `/producto/${codigo}`, patron: "/producto/:codigo", ...opciones });

  it("muestra la información del producto según la URL", () => {
    renderDetalle("GS-007");
    expect(screen.getByRole("heading", { name: "Resident Evil II" })).toBeTruthy();
    expect(screen.getByText(/Survival horror centrado/)).toBeTruthy();
  });

  it("agrega la cantidad elegida al carrito", () => {
    const { servicios } = renderDetalle("GS-007");
    fireEvent.click(screen.getByLabelText("Aumentar cantidad"));
    fireEvent.click(screen.getByLabelText("Aumentar cantidad"));
    fireEvent.click(screen.getByRole("button", { name: "Añadir al carrito" }));
    expect(servicios.carritoStore.leer()).toEqual([{ codigo: "GS-007", cantidad: 3 }]);
    expect(screen.getByText(/Agregaste 3 × Resident Evil II/)).toBeTruthy();
  });

  it("muestra aviso de stock crítico", () => {
    renderDetalle("GS-005");
    expect(screen.getByText(/Quedan pocas unidades/)).toBeTruthy();
  });

  it("muestra mensaje si el producto no existe", () => {
    renderDetalle("NO-EXISTE");
    expect(screen.getByText("Producto no encontrado")).toBeTruthy();
  });
});

describe("Página Carrito", () => {
  it("muestra el estado vacío cuando no hay productos", () => {
    renderConTienda(<Carrito />);
    expect(screen.getByText("Tu carrito está vacío")).toBeTruthy();
  });

  it("lista las líneas, permite cambiar cantidades y vaciar", () => {
    const servicios = crearServiciosPrueba({ carrito: [{ codigo: "GS-001", cantidad: 1 }, { codigo: "GS-003", cantidad: 2 }] });
    renderConTienda(<Carrito />, { servicios });
    expect(screen.getAllByTestId("linea-carrito").length).toBe(2);

    fireEvent.click(screen.getAllByLabelText("Aumentar cantidad")[0]);
    expect(servicios.carritoStore.leer()[0].cantidad).toBe(2);

    fireEvent.click(screen.getByText("Vaciar carrito"));
    expect(screen.getByText("Tu carrito está vacío")).toBeTruthy();
  });
});

describe("Página Checkout", () => {
  const CARRITO = [{ codigo: "GS-001", cantidad: 1 }];
  const renderCheckout = (opciones = {}) =>
    renderConTienda(<Checkout />, { ruta: "/checkout", patron: "/checkout", servicios: crearServiciosPrueba({ carrito: CARRITO, ...opciones }) });

  it("redirige al carrito si está vacío", () => {
    renderConTienda(<Checkout />, { ruta: "/checkout", patron: "/checkout" });
    expect(screen.getByTestId("ubicacion").textContent).toBe("/carrito");
  });

  it("con sesión iniciada completa los datos del cliente automáticamente", () => {
    renderCheckout({ sesion: USUARIO_CLIENTE });
    expect(screen.getByLabelText("Nombre").value).toBe("Javiera");
    expect(screen.getByLabelText("Correo").value).toBe(USUARIO_CLIENTE.correo);
    expect(screen.getByLabelText("Calle y número").value).toBe("Camino Real 789");
    expect(screen.getByLabelText("Comuna").value).toBe("chillan");
  });

  it("al elegir retiro en tienda oculta la dirección y el envío pasa a gratis", () => {
    renderCheckout();
    expect(screen.queryByLabelText("Calle y número")).not.toBeNull();
    fireEvent.click(screen.getByLabelText("Retiro en tienda (gratis)"));
    expect(screen.queryByLabelText("Calle y número")).toBeNull();
    expect(screen.getByText("Gratis")).toBeTruthy();
  });

  it("no permite pagar con campos inválidos", () => {
    const { servicios } = renderCheckout();
    fireEvent.click(screen.getByRole("button", { name: /Pagar ahora/ }));
    expect(screen.getByText("Falta completar: el método de pago.")).toBeTruthy();
    expect(servicios.ordenesDB.listar().length).toBe(2);
  });

  it("pago exitoso navega a /compra/exito/:id", () => {
    renderCheckout({ sesion: USUARIO_CLIENTE });
    fireEvent.change(screen.getByLabelText("Método de pago"), { target: { name: "metodoPago", value: "debito" } });
    fireEvent.click(screen.getByRole("button", { name: /Pagar ahora/ }));
    expect(screen.getByTestId("ubicacion").textContent).toBe("/compra/exito/ORD-1003");
  });

  it("pago rechazado (simulado) navega a /compra/error/:id", () => {
    renderCheckout({ sesion: USUARIO_CLIENTE });
    fireEvent.change(screen.getByLabelText("Método de pago"), { target: { name: "metodoPago", value: "credito" } });
    fireEvent.click(screen.getByLabelText(/Simular pago rechazado/));
    fireEvent.click(screen.getByRole("button", { name: /Pagar ahora/ }));
    expect(screen.getByTestId("ubicacion").textContent).toBe("/compra/error/ORD-1003");
  });

  it("validarCheckout no exige calle cuando es retiro en tienda", () => {
    const errores = validarCheckout({ nombre: "A", apellidos: "B", correo: "a@gmail.com", tipoEnvio: "retiro", calle: "", departamento: "", region: "nuble", comuna: "chillan", indicaciones: "", metodoPago: "debito" });
    expect(Object.values(errores).every((e) => !e)).toBeTrue();
  });
});

describe("Página CompraResultado", () => {
  it("compra exitosa muestra el número de orden y permite enviar la boleta", () => {
    renderConTienda(<CompraResultado exito />, { ruta: "/compra/exito/ORD-1001", patron: "/compra/exito/:id" });
    expect(screen.getByText(/Se ha realizado la compra. Nro #ORD-1001/)).toBeTruthy();
    fireEvent.click(screen.getByText("Enviar boleta por email"));
    expect(screen.getByText("Boleta enviada ✓")).toBeTruthy();
  });

  it("imprimir boleta llama a window.print (mock)", () => {
    spyOn(window, "print");
    renderConTienda(<CompraResultado exito />, { ruta: "/compra/exito/ORD-1001", patron: "/compra/exito/:id" });
    fireEvent.click(screen.getByText("Imprimir boleta"));
    expect(window.print).toHaveBeenCalled();
  });

  it("pago fallido muestra el error y la opción de reintentar", () => {
    renderConTienda(<CompraResultado exito={false} />, { ruta: "/compra/error/ORD-1002", patron: "/compra/error/:id" });
    expect(screen.getByText(/No se pudo realizar el pago/)).toBeTruthy();
    expect(screen.getByText("Volver a realizar el pago").getAttribute("href")).toBe("/checkout");
  });

  it("orden inexistente muestra mensaje", () => {
    renderConTienda(<CompraResultado exito />, { ruta: "/compra/exito/ORD-9", patron: "/compra/exito/:id" });
    expect(screen.getByText("Orden no encontrada")).toBeTruthy();
  });
});
