import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GraficoVentas from "./GraficoVentas";
import GraficoCategorias from "./GraficoCategorias";
import GraficoEstados from "./GraficoEstados";
import GraficoStock from "./GraficoStock";
import { CATEGORIAS, ORDENES, PRODUCTOS } from "../../../test/datosPrueba";

const HOY = new Date(2026, 9, 10, 12); // las órdenes de prueba son del 1 y 5 de octubre
const conRouter = (ui) => render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{ui}</MemoryRouter>);

describe("Gráfico de ventas en el tiempo", () => {
  it("resume los ingresos del período y cambia al elegir otro período", () => {
    render(<GraficoVentas ordenes={ORDENES} hoy={HOY} />);
    expect(screen.getByText(/\$38\.082 en 1 venta · últimos 30 días/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "7 días" }));
    expect(screen.getByRole("button", { name: "7 días" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Sin ventas en este período.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "90 días" }));
    expect(screen.getByText(/últimos 90 días · por semana/)).toBeTruthy();
  });

  it("al pasar el cursor muestra el detalle del día", () => {
    render(<GraficoVentas ordenes={ORDENES} hoy={HOY} />);
    const zona = screen.getByTestId("zona-ventas");
    const caja = zona.getBoundingClientRect();
    // el 1 de octubre es el día 21 de 30 (índice 20)
    fireEvent.mouseMove(zona, { clientX: caja.left + (20 / 29) * caja.width, clientY: caja.top + 10 });
    expect(screen.getByRole("status").textContent).toContain("1 oct");
    expect(screen.getByRole("status").textContent).toContain("$38.082");
    fireEvent.mouseLeave(zona);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("ofrece los datos en una tabla", () => {
    render(<GraficoVentas ordenes={ORDENES} hoy={HOY} />);
    expect(screen.getByText("Ver datos en tabla")).toBeTruthy();
    expect(screen.getByRole("cell", { name: "1 oct" })).toBeTruthy();
  });
});

describe("Gráfico de ingresos por categoría", () => {
  it("dibuja una barra por categoría, la de más ingresos primero", () => {
    render(<GraficoCategorias ordenes={ORDENES} productos={PRODUCTOS} categorias={CATEGORIAS} />);
    const barras = screen.getAllByTestId("barra-categoria");
    expect(barras.length).toBe(5);
    expect(barras[0].textContent).toContain("Terror");
    expect(barras[0].textContent).toContain("$34.092");
  });

  it("muestra unidades e ingresos al pasar el cursor", () => {
    render(<GraficoCategorias ordenes={ORDENES} productos={PRODUCTOS} categorias={CATEGORIAS} />);
    fireEvent.mouseEnter(screen.getAllByTestId("barra-categoria")[0]);
    expect(screen.getByRole("status").textContent).toContain("2 unidades");
  });

  it("sin ventas muestra un mensaje en vez de barras vacías", () => {
    render(<GraficoCategorias ordenes={[]} productos={PRODUCTOS} categorias={CATEGORIAS} />);
    expect(screen.getByText("Aún no hay ventas registradas.")).toBeTruthy();
  });
});

describe("Gráfico de estado de las órdenes", () => {
  it("divide la barra por estado y lo repite en la leyenda con cantidad y %", () => {
    const { container } = render(<GraficoEstados ordenes={ORDENES} />);
    expect(screen.getAllByTestId("segmento-estado").length).toBe(2);
    expect(screen.getByText(/50% de 2 órdenes terminó en venta/)).toBeTruthy();
    const leyenda = within(container.querySelector(".grafico-leyenda"));
    expect(leyenda.getByText("Pagado")).toBeTruthy();
    expect(leyenda.getAllByText("1 · 50%").length).toBe(2);
  });

  it("muestra el detalle del segmento bajo el cursor", () => {
    render(<GraficoEstados ordenes={ORDENES} />);
    fireEvent.mouseEnter(screen.getAllByTestId("segmento-estado")[1]);
    expect(screen.getByRole("status").textContent).toContain("Rechazado");
  });

  it("sin órdenes muestra un mensaje", () => {
    render(<GraficoEstados ordenes={[]} />);
    expect(screen.getByText("Aún no hay órdenes.")).toBeTruthy();
  });
});

describe("Gráfico de stock frente a nivel crítico", () => {
  it("pone primero los productos que hay que reponer, marcados con ⚠", () => {
    conRouter(<GraficoStock productos={PRODUCTOS} />);
    const filas = screen.getAllByTestId("fila-stock");
    expect(filas.length).toBe(8);
    expect(filas[0].textContent).toContain("⚠");
    expect(filas[1].textContent).toContain("⚠");
    expect(filas[2].textContent).not.toContain("⚠");
    expect(screen.getByText(/2 productos necesitan reposición/)).toBeTruthy();
  });

  it("al pasar el cursor muestra stock y nivel crítico", () => {
    conRouter(<GraficoStock productos={PRODUCTOS} />);
    fireEvent.mouseEnter(screen.getAllByTestId("fila-stock")[0]);
    expect(screen.getByRole("status").textContent).toMatch(/Stock \d+ · crítico \d+ · reponer/);
  });

  it("si ningún producto tiene nivel crítico lo indica", () => {
    conRouter(<GraficoStock productos={[{ codigo: "A", nombre: "A", stock: 3, stockCritico: null }]} />);
    expect(screen.getByText("Ningún producto tiene nivel crítico definido.")).toBeTruthy();
  });
});
