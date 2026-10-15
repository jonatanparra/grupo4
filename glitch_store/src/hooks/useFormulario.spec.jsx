import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useFormulario } from "./useFormulario";
import { validarRequerido } from "../utils/validaciones";

const validar = (v) => ({ nombre: validarRequerido(v.nombre, "El nombre") });

/** Formulario mínimo que usa el hook, para probar estado + DOM. */
function FormularioDePrueba({ onEnviar }) {
  const { valores, errores, cambiar, validarTodo } = useFormulario({ nombre: "", acepto: false }, validar);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (validarTodo()) onEnviar(valores);
      }}
    >
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" value={valores.nombre} onChange={cambiar} />
      <input type="checkbox" aria-label="Acepto" name="acepto" checked={valores.acepto} onChange={cambiar} />
      {errores.nombre && <p role="alert">{errores.nombre}</p>}
      <button type="submit">Enviar</button>
    </form>
  );
}

describe("useFormulario (gestión del estado de formularios)", () => {
  it("el estado cambia cuando el usuario escribe", () => {
    render(<FormularioDePrueba onEnviar={() => {}} />);
    const campo = screen.getByLabelText("Nombre");
    fireEvent.change(campo, { target: { value: "Glitch" } });
    expect(campo.value).toBe("Glitch");
  });

  it("los checkbox guardan true/false", () => {
    render(<FormularioDePrueba onEnviar={() => {}} />);
    fireEvent.click(screen.getByLabelText("Acepto"));
    expect(screen.getByLabelText("Acepto").checked).toBeTrue();
  });

  it("no muestra errores hasta que se toca el campo o se envía", () => {
    render(<FormularioDePrueba onEnviar={() => {}} />);
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByText("Enviar"));
    expect(screen.getByRole("alert").textContent).toContain("el nombre");
  });

  it("muestra el error en vivo al borrar un campo ya tocado", () => {
    render(<FormularioDePrueba onEnviar={() => {}} />);
    const campo = screen.getByLabelText("Nombre");
    fireEvent.change(campo, { target: { value: "A" } });
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.change(campo, { target: { value: "" } });
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("solo envía cuando no hay errores", () => {
    const alEnviar = jasmine.createSpy("onEnviar");
    render(<FormularioDePrueba onEnviar={alEnviar} />);
    fireEvent.click(screen.getByText("Enviar"));
    expect(alEnviar).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana" } });
    fireEvent.click(screen.getByText("Enviar"));
    expect(alEnviar).toHaveBeenCalledWith({ nombre: "Ana", acepto: false });
  });

  it("asignar y reiniciar modifican el estado directamente", () => {
    const { result } = renderHook(() => useFormulario({ nombre: "" }, validar));
    act(() => result.current.asignar("nombre", "Nuevo"));
    expect(result.current.valores.nombre).toBe("Nuevo");
    act(() => result.current.reiniciar());
    expect(result.current.valores.nombre).toBe("");
  });
});
