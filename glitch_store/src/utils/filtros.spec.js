import { filtrarProductos, normalizar } from "./filtros";
import { esStockCritico, formatoCLP, nombreComuna, nombreRegion, precioFinal, tieneOferta } from "./formato";

const PRODUCTOS = [
  { codigo: "1", nombre: "Outlast", categoria: "Terror", precio: 10000, descuento: 20, descripcion: "Manicomio" },
  { codigo: "2", nombre: "Minecraft", categoria: "Acción", precio: 30000, descuento: 0, descripcion: "Construcción" },
  { codigo: "3", nombre: "Alan Wake", categoria: "Terror", precio: 5000, descuento: 0, descripcion: "Linterna" },
];

describe("Filtros de búsqueda", () => {
  it("normalizar quita tildes y mayúsculas", () => {
    expect(normalizar("Acción")).toBe("accion");
  });

  it("sin filtros devuelve todos los productos", () => {
    expect(filtrarProductos(PRODUCTOS).length).toBe(3);
  });

  it("filtra por texto en nombre o descripción, ignorando tildes", () => {
    expect(filtrarProductos(PRODUCTOS, { texto: "mine" }).map((p) => p.codigo)).toEqual(["2"]);
    expect(filtrarProductos(PRODUCTOS, { texto: "construccion" }).map((p) => p.codigo)).toEqual(["2"]);
  });

  it("filtra por categoría y solo ofertas", () => {
    expect(filtrarProductos(PRODUCTOS, { categoria: "Terror" }).length).toBe(2);
    expect(filtrarProductos(PRODUCTOS, { soloOfertas: true }).map((p) => p.codigo)).toEqual(["1"]);
  });

  it("ordena por precio final y por nombre", () => {
    expect(filtrarProductos(PRODUCTOS, { orden: "precio-asc" }).map((p) => p.codigo)).toEqual(["3", "1", "2"]);
    expect(filtrarProductos(PRODUCTOS, { orden: "precio-desc" }).map((p) => p.codigo)).toEqual(["2", "1", "3"]);
    expect(filtrarProductos(PRODUCTOS, { orden: "nombre" }).map((p) => p.codigo)).toEqual(["3", "2", "1"]);
  });
});

describe("Utilidades de formato", () => {
  it("formatoCLP usa separador de miles chileno", () => {
    expect(formatoCLP(13990)).toContain("13.990");
  });

  it("precioFinal y tieneOferta aplican el descuento", () => {
    expect(tieneOferta(PRODUCTOS[0])).toBeTrue();
    expect(precioFinal(PRODUCTOS[0])).toBe(8000);
    expect(precioFinal(PRODUCTOS[1])).toBe(30000);
  });

  it("esStockCritico compara stock con el nivel crítico", () => {
    expect(esStockCritico({ stock: 3, stockCritico: 3 })).toBeTrue();
    expect(esStockCritico({ stock: 10, stockCritico: 3 })).toBeFalse();
    expect(esStockCritico({ stock: 0, stockCritico: null })).toBeFalse();
  });

  it("traduce ids de región y comuna a nombres", () => {
    expect(nombreRegion("nuble")).toBe("Región de Ñuble");
    expect(nombreComuna("nuble", "chillan")).toBe("Chillán");
    expect(nombreRegion("inexistente")).toBe("inexistente");
  });
});
