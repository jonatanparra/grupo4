import { diaLocal, ingresosPorCategoria, marcasEje, ordenesPorEstado, stockFrenteACritico, ventasAgrupadas, ventasPorDia } from "./estadisticas";

const HOY = new Date(2026, 9, 10, 12); // 10 de octubre de 2026, hora local
const orden = (id, fecha, estado, total, items = []) => ({ id, fecha, estado, total, items });
const local = (dia, hora = 12) => new Date(2026, 9, dia, hora).toISOString();

const ORDENES = [
  orden("A", local(1), "Pagado", 10000, [{ codigo: "T1", precioUnitario: 5000, cantidad: 2 }]),
  orden("B", local(9), "Entregado", 3000, [{ codigo: "I1", precioUnitario: 3000, cantidad: 1 }]),
  orden("C", local(9, 18), "Enviado", 4000, [{ codigo: "T1", precioUnitario: 4000, cantidad: 1 }]),
  orden("D", local(10), "Rechazado", 99000, [{ codigo: "I1", precioUnitario: 99000, cantidad: 1 }]),
  orden("E", local(8), "Anulado", 5000, [{ codigo: "T1", precioUnitario: 5000, cantidad: 1 }]),
];

describe("Estadísticas del dashboard", () => {
  it("ventasPorDia entrega todos los días del período, con 0 los días sin ventas", () => {
    const datos = ventasPorDia(ORDENES, 3, HOY);
    expect(datos.map((d) => d.fecha)).toEqual(["2026-10-08", "2026-10-09", "2026-10-10"]);
    expect(datos.map((d) => d.total)).toEqual([0, 7000, 0]); // anulada y rechazada no son ventas
    expect(datos[1].ordenes).toBe(2);
  });

  it("ventasPorDia ignora las ventas fuera del período", () => {
    expect(ventasPorDia(ORDENES, 7, HOY).reduce((t, d) => t + d.total, 0)).toBe(7000);
    expect(ventasPorDia(ORDENES, 10, HOY).reduce((t, d) => t + d.total, 0)).toBe(17000);
  });

  it("ventasAgrupadas suma por semanas contadas hacia atrás desde hoy", () => {
    const semanas = ventasAgrupadas(ORDENES, 14, 7, HOY);
    expect(semanas.length).toBe(2);
    expect(semanas[1]).toEqual(jasmine.objectContaining({ fecha: "2026-10-04", hasta: "2026-10-10", total: 7000, ordenes: 2 }));
    expect(semanas[0].total).toBe(10000);
    expect(ventasAgrupadas(ORDENES, 3, 1, HOY).length).toBe(3);
  });

  it("diaLocal agrupa por el día local, no por el día UTC", () => {
    expect(diaLocal(new Date(2026, 9, 9, 23, 30).toISOString())).toBe("2026-10-09");
  });

  it("ingresosPorCategoria suma solo ventas concretadas y ordena de mayor a menor", () => {
    const productos = [{ codigo: "T1", categoria: "Terror" }, { codigo: "I1", categoria: "Indie" }];
    const categorias = [{ id: "indie", nombre: "Indie" }, { id: "terror", nombre: "Terror" }, { id: "accion", nombre: "Acción" }];
    const datos = ingresosPorCategoria([...ORDENES, orden("F", local(9), "Pagado", 1, [{ codigo: null, precioUnitario: 1, cantidad: 1 }])], productos, categorias);
    expect(datos.map((d) => [d.nombre, d.ingresos, d.unidades])).toEqual([
      ["Terror", 14000, 3],
      ["Indie", 3000, 1],
      ["Acción", 0, 0],
    ]);
  });

  it("ordenesPorEstado mantiene el orden fijo de estados y omite los que no tienen órdenes", () => {
    const datos = ordenesPorEstado(ORDENES.slice(0, 4));
    expect(datos.map((d) => d.estado)).toEqual(["Pagado", "Enviado", "Entregado", "Rechazado"]);
    expect(datos.every((d) => d.porcentaje === 25)).toBeTrue();
    expect(ordenesPorEstado([])).toEqual([]);
  });

  it("stockFrenteACritico ordena por urgencia e ignora productos sin nivel crítico", () => {
    const datos = stockFrenteACritico([
      { codigo: "A", nombre: "A", stock: 20, stockCritico: 5 },
      { codigo: "B", nombre: "B", stock: 2, stockCritico: 4 },
      { codigo: "C", nombre: "C", stock: 6, stockCritico: 5 },
      { codigo: "D", nombre: "D", stock: 1, stockCritico: null },
    ]);
    expect(datos.map((d) => d.codigo)).toEqual(["B", "C", "A"]);
    expect(datos.map((d) => d.critico)).toEqual([true, false, false]);
    expect(stockFrenteACritico([{ codigo: "X", nombre: "X", stock: 1, stockCritico: 9 }, { codigo: "Y", nombre: "Y", stock: 1, stockCritico: 9 }], 1).length).toBe(1);
  });

  it("marcasEje genera divisiones redondas que cubren el máximo", () => {
    expect(marcasEje(38082)).toEqual([0, 10000, 20000, 30000, 40000]);
    expect(marcasEje(7)).toEqual([0, 2, 4, 6, 8]);
    expect(marcasEje(0)).toEqual([0, 1]);
  });
});
