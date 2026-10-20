import { fireEvent, render, screen } from "@testing-library/react";
import CampoFormulario from "./CampoFormulario";
import Alerta from "./Alerta";

describe("CampoFormulario (renderizado condicional)", () => {
  it("muestra el mensaje de error SOLO cuando hay un error", () => {
    const { rerender } = render(<CampoFormulario name="correo" etiqueta="Correo" valor="" onChange={() => {}} />);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByLabelText("Correo").className).not.toContain("is-invalid");

    rerender(<CampoFormulario name="correo" etiqueta="Correo" valor="" onChange={() => {}} error="Ingresa un correo." />);
    expect(screen.getByRole("alert").textContent).toBe("Ingresa un correo.");
    expect(screen.getByLabelText("Correo").className).toContain("is-invalid");
    expect(screen.getByLabelText("Correo").getAttribute("aria-invalid")).toBe("true");
  });

  it("muestra la ayuda y la marca de opcional", () => {
    render(<CampoFormulario name="telefono" etiqueta="Teléfono" opcional ayuda="Solo números." onChange={() => {}} />);
    expect(screen.getByText("(opcional)")).toBeTruthy();
    expect(screen.getByText("Solo números.")).toBeTruthy();
  });

  it("avisa cada cambio de texto con onChange", () => {
    const alCambiar = jasmine.createSpy("onChange");
    render(<CampoFormulario name="nombre" etiqueta="Nombre" valor="" onChange={alCambiar} />);
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana" } });
    expect(alCambiar).toHaveBeenCalled();
  });

  it("puede renderizar textarea y select", () => {
    const { container, rerender } = render(<CampoFormulario como="textarea" name="mensaje" etiqueta="Mensaje" onChange={() => {}} />);
    expect(container.querySelector("textarea")).not.toBeNull();
    rerender(
      <CampoFormulario como="select" name="tipo" etiqueta="Tipo" onChange={() => {}}>
        <option value="a">A</option>
      </CampoFormulario>
    );
    expect(container.querySelector("select.form-select")).not.toBeNull();
  });
});

describe("Alerta", () => {
  it("no renderiza nada si no hay mensaje", () => {
    const { container } = render(<Alerta mensaje="" />);
    expect(container.innerHTML).toBe("");
  });

  it("muestra el mensaje y permite cerrarla", () => {
    const alCerrar = jasmine.createSpy("onCerrar");
    render(<Alerta tipo="danger" mensaje="Error de prueba" onCerrar={alCerrar} />);
    expect(screen.getByRole("alert").textContent).toContain("Error de prueba");
    fireEvent.click(screen.getByLabelText("Cerrar mensaje"));
    expect(alCerrar).toHaveBeenCalled();
  });
});
