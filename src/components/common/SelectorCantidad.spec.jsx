import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import SelectorCantidad from "./SelectorCantidad";

/** Componente contenedor para probar el cambio de estado real del selector. */
function SelectorConEstado({ max }) {
  const [cantidad, setCantidad] = useState(1);
  return <SelectorCantidad cantidad={cantidad} max={max} onCambiar={setCantidad} />;
}

describe("SelectorCantidad (estado y eventos)", () => {
  it("incrementa y decrementa la cantidad al hacer clic", () => {
    render(<SelectorConEstado max={5} />);
    const campo = screen.getByRole("textbox");
    fireEvent.click(screen.getByLabelText("Aumentar cantidad"));
    fireEvent.click(screen.getByLabelText("Aumentar cantidad"));
    expect(campo.value).toBe("3");
    fireEvent.click(screen.getByLabelText("Disminuir cantidad"));
    expect(campo.value).toBe("2");
  });

  it("no baja del mínimo ni supera el máximo (botones deshabilitados)", () => {
    render(<SelectorConEstado max={2} />);
    expect(screen.getByLabelText("Disminuir cantidad").disabled).toBeTrue();
    fireEvent.click(screen.getByLabelText("Aumentar cantidad"));
    expect(screen.getByRole("textbox").value).toBe("2");
    expect(screen.getByLabelText("Aumentar cantidad").disabled).toBeTrue();
  });

  it("llama a onCambiar con el nuevo valor", () => {
    const alCambiar = jasmine.createSpy("onCambiar");
    render(<SelectorCantidad cantidad={4} max={10} onCambiar={alCambiar} />);
    fireEvent.click(screen.getByLabelText("Aumentar cantidad"));
    expect(alCambiar).toHaveBeenCalledWith(5);
  });
});
