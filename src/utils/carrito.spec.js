import {
  agregarItem,
  calcularEnvio,
  calcularSubtotal,
  calcularTotales,
  cambiarCantidad,
  contarItems,
  detalleCarrito,
  lineasSinStock,
  porcentajeCupon,
  quitarItem,
} from "./carrito";

const PRODUCTOS = [
  { codigo: "A", nombre: "Juego A", precio: 10000, descuento: 0, stock: 3 },
  { codigo: "B", nombre: "Juego B", precio: 20000, descuento: 50, stock: 10 },
];

describe("Lógica del carrito", () => {
  it("agrega un producto nuevo y suma cantidad si ya existe", () => {
    let carrito = agregarItem([], PRODUCTOS[0], 1);
    expect(carrito).toEqual([{ codigo: "A", cantidad: 1 }]);
    carrito = agregarItem(carrito, PRODUCTOS[0], 1);
    expect(carrito).toEqual([{ codigo: "A", cantidad: 2 }]);
  });

  it("no supera el stock disponible", () => {
    const carrito = agregarItem([{ codigo: "A", cantidad: 2 }], PRODUCTOS[0], 5);
    expect(carrito[0].cantidad).toBe(3);
  });

  it("no modifica el carrito original (inmutabilidad)", () => {
    const original = [{ codigo: "A", cantidad: 1 }];
    agregarItem(original, PRODUCTOS[0], 1);
    expect(original[0].cantidad).toBe(1);
  });

  it("ignora productos inexistentes o sin stock", () => {
    expect(agregarItem([], undefined)).toEqual([]);
    expect(agregarItem([], { ...PRODUCTOS[0], stock: 0 })).toEqual([]);
  });

  it("cambiarCantidad elimina la línea cuando baja de 1", () => {
    const carrito = [{ codigo: "A", cantidad: 1 }];
    expect(cambiarCantidad(carrito, PRODUCTOS[0], -1)).toEqual([]);
    expect(cambiarCantidad(carrito, PRODUCTOS[0], 1)).toEqual([{ codigo: "A", cantidad: 2 }]);
  });

  it("quitarItem y contarItems", () => {
    const carrito = [
      { codigo: "A", cantidad: 2 },
      { codigo: "B", cantidad: 3 },
    ];
    expect(contarItems(carrito)).toBe(5);
    expect(quitarItem(carrito, "A")).toEqual([{ codigo: "B", cantidad: 3 }]);
  });

  it("detalleCarrito aplica el precio de oferta y descarta productos inexistentes", () => {
    const lineas = detalleCarrito(
      [
        { codigo: "B", cantidad: 2 },
        { codigo: "X", cantidad: 1 },
      ],
      PRODUCTOS
    );
    expect(lineas.length).toBe(1);
    expect(lineas[0].precioUnitario).toBe(10000);
    expect(lineas[0].totalLinea).toBe(20000);
  });

  it("calcularSubtotal suma todas las líneas", () => {
    expect(calcularSubtotal([{ codigo: "A", cantidad: 2 }, { codigo: "B", cantidad: 1 }], PRODUCTOS)).toBe(30000);
  });

  it("porcentajeCupon reconoce cupones válidos sin importar mayúsculas", () => {
    expect(porcentajeCupon("glitch10")).toBe(10);
    expect(porcentajeCupon(" DUOC15 ")).toBe(15);
    expect(porcentajeCupon("FALSO")).toBe(0);
  });

  it("calcularEnvio: retiro gratis, domicilio con costo y gratis sobre el umbral", () => {
    expect(calcularEnvio("retiro", 10000)).toBe(0);
    expect(calcularEnvio(null, 10000)).toBe(0);
    expect(calcularEnvio("domicilio", 10000)).toBe(3990);
    expect(calcularEnvio("domicilio", 60000)).toBe(0);
  });

  it("calcularTotales combina subtotal, cupón y envío", () => {
    const totales = calcularTotales([{ codigo: "A", cantidad: 2 }], PRODUCTOS, "GLITCH10", "domicilio");
    expect(totales).toEqual({ subtotal: 20000, descuentoCupon: 2000, costoEnvio: 3990, total: 21990 });
  });

  it("lineasSinStock detecta cantidades mayores al stock actual", () => {
    expect(lineasSinStock([{ codigo: "A", cantidad: 5 }], PRODUCTOS).length).toBe(1);
    expect(lineasSinStock([{ codigo: "A", cantidad: 1 }], PRODUCTOS).length).toBe(0);
  });
});
