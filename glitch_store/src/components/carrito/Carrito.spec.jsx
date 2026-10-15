import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResumenCarrito from "./ResumenCarrito";
import LineaCarrito from "./LineaCarrito";
import ResumenOrden from "./ResumenOrden";
import { ORDENES, PRODUCTOS } from "../../data/datos";

const TOTALES = { subtotal: 20000, descuentoCupon: 2000, costoEnvio: 0, total: 18000 };

describe("ResumenCarrito", () => {
  it("muestra los montos recibidos por props", () => {
    render(<ResumenCarrito totales={TOTALES} cuponActivo="GLITCH10" />);
    expect(screen.getByText("Cupón GLITCH10")).toBeTruthy();
    expect(screen.getByTestId("total-pedido").textContent).toContain("18.000");
    expect(screen.getByText("Se calcula en el checkout")).toBeTruthy();
  });

  it("no muestra la línea de cupón si no hay descuento", () => {
    render(<ResumenCarrito totales={{ ...TOTALES, descuentoCupon: 0 }} />);
    expect(screen.queryByText(/Cupón/)).toBeNull();
  });

  it("aplica un cupón válido usando la función recibida (mock)", () => {
    const aplicar = jasmine.createSpy("onAplicarCupon").and.returnValue(true);
    render(<ResumenCarrito totales={TOTALES} onAplicarCupon={aplicar} />);
    fireEvent.change(screen.getByLabelText("Cupón de descuento"), { target: { value: "GLITCH10" } });
    fireEvent.click(screen.getByText("Aplicar"));
    expect(aplicar).toHaveBeenCalledWith("GLITCH10");
    expect(screen.getByText("Cupón aplicado.")).toBeTruthy();
  });

  it("informa cuando el cupón no es válido", () => {
    const aplicar = jasmine.createSpy("onAplicarCupon").and.returnValue(false);
    render(<ResumenCarrito totales={TOTALES} onAplicarCupon={aplicar} />);
    fireEvent.change(screen.getByLabelText("Cupón de descuento"), { target: { value: "FALSO" } });
    fireEvent.click(screen.getByText("Aplicar"));
    expect(screen.getByText("Cupón no válido.")).toBeTruthy();
  });

  it("el botón Aplicar está deshabilitado con el campo vacío", () => {
    render(<ResumenCarrito totales={TOTALES} onAplicarCupon={() => true} />);
    expect(screen.getByText("Aplicar").disabled).toBeTrue();
  });
});

describe("LineaCarrito", () => {
  const producto = PRODUCTOS[0];
  const linea = { codigo: producto.codigo, cantidad: 2, producto, precioUnitario: producto.precio, totalLinea: producto.precio * 2 };

  it("calcula la diferencia de cantidad y permite quitar el producto", () => {
    const cambiar = jasmine.createSpy("onCambiarCantidad");
    const quitar = jasmine.createSpy("onQuitar");
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LineaCarrito linea={linea} onCambiarCantidad={cambiar} onQuitar={quitar} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByLabelText("Aumentar cantidad"));
    expect(cambiar).toHaveBeenCalledWith(producto.codigo, 1);
    fireEvent.click(screen.getByLabelText("Disminuir cantidad"));
    expect(cambiar).toHaveBeenCalledWith(producto.codigo, -1);
    fireEvent.click(screen.getByText("Quitar"));
    expect(quitar).toHaveBeenCalledWith(producto.codigo);
  });
});

describe("ResumenOrden", () => {
  it("lista los productos de la orden y la dirección de despacho", () => {
    render(<ResumenOrden orden={ORDENES[0]} />);
    ORDENES[0].items.forEach((item) => expect(screen.getByText(item.nombre)).toBeTruthy());
    expect(screen.getByText("Despacho a domicilio")).toBeTruthy();
    expect(screen.getByText(/Chillán/)).toBeTruthy();
  });

  it("muestra 'Retiro en tienda' y envío gratis cuando corresponde", () => {
    render(<ResumenOrden orden={ORDENES[1]} />);
    expect(screen.getByText("Retiro en tienda")).toBeTruthy();
    expect(screen.getByText("Gratis")).toBeTruthy();
  });
});
