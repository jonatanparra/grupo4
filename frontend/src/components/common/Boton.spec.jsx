import { fireEvent, render, screen } from "@testing-library/react";
import Boton from "./Boton";

describe("Boton (propiedades y eventos)", () => {
  it("muestra la etiqueta recibida por props", () => {
    render(<Boton etiqueta="Comprar" />);
    expect(screen.getByRole("button", { name: "Comprar" })).toBeTruthy();
  });

  it("usa children cuando no recibe etiqueta", () => {
    render(<Boton>Texto hijo</Boton>);
    expect(screen.getByRole("button").textContent).toBe("Texto hijo");
  });

  it("ejecuta la función onClick recibida al hacer clic", () => {
    const alHacerClic = jasmine.createSpy("onClick");
    render(<Boton etiqueta="Añadir" onClick={alHacerClic} />);
    fireEvent.click(screen.getByRole("button", { name: "Añadir" }));
    expect(alHacerClic).toHaveBeenCalledTimes(1);
  });

  it("no ejecuta onClick cuando está deshabilitado", () => {
    const alHacerClic = jasmine.createSpy("onClick");
    render(<Boton etiqueta="Agotado" onClick={alHacerClic} disabled />);
    fireEvent.click(screen.getByRole("button"));
    expect(alHacerClic).not.toHaveBeenCalled();
  });

  it("aplica clases según variante, tamaño y ancho", () => {
    render(<Boton etiqueta="Eliminar" variante="peligro" tamano="sm" ancho tipo="submit" />);
    const boton = screen.getByRole("button");
    expect(boton.className).toContain("btn-outline-danger");
    expect(boton.className).toContain("btn-sm");
    expect(boton.className).toContain("w-100");
    expect(boton.getAttribute("type")).toBe("submit");
  });

  it("usa la variante primaria si recibe una desconocida", () => {
    render(<Boton etiqueta="X" variante="inventada" />);
    expect(screen.getByRole("button").className).toContain("btn-glitch");
  });
});
