import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GrillaProductos from "./GrillaProductos";
import TarjetaProducto from "./TarjetaProducto";
import FiltroCategorias from "./FiltroCategorias";
import BarraBusqueda from "./BarraBusqueda";
import { PRODUCTOS } from "../../data/datos";

const conRouter = (ui) => render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{ui}</MemoryRouter>);

describe("GrillaProductos (renderizado de listas)", () => {
  it("renderiza una tarjeta por cada producto del conjunto de datos", () => {
    conRouter(<GrillaProductos productos={PRODUCTOS} onAgregar={() => {}} />);
    expect(screen.getAllByTestId("tarjeta-producto").length).toBe(PRODUCTOS.length);
    PRODUCTOS.forEach((p) => expect(screen.getByText(p.nombre)).toBeTruthy());
  });

  it("muestra un mensaje cuando la lista está vacía", () => {
    conRouter(<GrillaProductos productos={[]} onAgregar={() => {}} mensajeVacio="Nada por aquí" />);
    expect(screen.queryAllByTestId("tarjeta-producto").length).toBe(0);
    expect(screen.getByText("Nada por aquí")).toBeTruthy();
  });
});

describe("TarjetaProducto", () => {
  const producto = { ...PRODUCTOS[3] }; // Outlast, con 20% de descuento

  afterEach(() => jasmine.clock().uninstall());

  it("muestra nombre, categoría, descuento y enlace al detalle", () => {
    conRouter(<TarjetaProducto producto={producto} onAgregar={() => {}} />);
    expect(screen.getByText("Outlast")).toBeTruthy();
    expect(screen.getByText("-20%")).toBeTruthy();
    expect(screen.getByText("Outlast").getAttribute("href")).toBe("/producto/GS-004");
  });

  it("al hacer clic en Añadir llama a onAgregar con el código y cambia el texto temporalmente", () => {
    jasmine.clock().install();
    const alAgregar = jasmine.createSpy("onAgregar");
    conRouter(<TarjetaProducto producto={producto} onAgregar={alAgregar} />);
    const boton = screen.getByRole("button", { name: /Añadir Outlast/ });

    fireEvent.click(boton);
    expect(alAgregar).toHaveBeenCalledWith("GS-004");
    expect(boton.textContent).toBe("Añadido ✓");

    act(() => jasmine.clock().tick(1300));
    expect(boton.textContent).toBe("Añadir");
  });

  it("deshabilita el botón si no hay stock", () => {
    conRouter(<TarjetaProducto producto={{ ...producto, stock: 0 }} onAgregar={() => {}} />);
    const boton = screen.getByRole("button", { name: /Añadir Outlast/ });
    expect(boton.disabled).toBeTrue();
    expect(boton.textContent).toBe("Agotado");
  });
});

describe("FiltroCategorias", () => {
  it("marca la categoría activa y avisa la seleccionada", () => {
    const alSeleccionar = jasmine.createSpy("onSeleccionar");
    render(<FiltroCategorias categorias={["Terror", "Indie"]} activa="Terror" onSeleccionar={alSeleccionar} />);
    expect(screen.getAllByRole("button").length).toBe(3); // Todas + 2
    expect(screen.getByText("Terror").getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByText("Indie"));
    expect(alSeleccionar).toHaveBeenCalledWith("Indie");
  });
});

describe("BarraBusqueda", () => {
  it("avisa el texto escrito y permite limpiarlo", () => {
    const alCambiar = jasmine.createSpy("onCambiar");
    const { rerender } = render(<BarraBusqueda valor="" onCambiar={alCambiar} />);
    expect(screen.queryByText("Limpiar")).toBeNull();
    fireEvent.change(screen.getByLabelText("Buscar productos"), { target: { value: "dark" } });
    expect(alCambiar).toHaveBeenCalledWith("dark");

    rerender(<BarraBusqueda valor="dark" onCambiar={alCambiar} />);
    fireEvent.click(screen.getByText("Limpiar"));
    expect(alCambiar).toHaveBeenCalledWith("");
  });
});
