import { crearColeccion, crearValor } from "./db";
import { crearAlmacenamientoFalso } from "../test/utilidades";

const SEMILLA = [
  { id: "1", nombre: "Uno" },
  { id: "2", nombre: "Dos" },
];

describe("Base de datos simulada (CRUD sobre localStorage)", () => {
  let almacenamiento;
  let coleccion;

  beforeEach(() => {
    // Mock del almacenamiento: no se usa el localStorage real del navegador.
    almacenamiento = crearAlmacenamientoFalso();
    coleccion = crearColeccion("prueba", SEMILLA, "id", almacenamiento);
  });

  it("listar inicializa la colección con los datos semilla", () => {
    spyOn(almacenamiento, "setItem").and.callThrough();
    expect(coleccion.listar().length).toBe(2);
    expect(almacenamiento.setItem).toHaveBeenCalledWith("prueba", jasmine.any(String));
  });

  it("obtener devuelve el registro o null", () => {
    expect(coleccion.obtener("2").nombre).toBe("Dos");
    expect(coleccion.obtener("99")).toBeNull();
  });

  it("crear agrega un registro y lo persiste", () => {
    coleccion.crear({ id: "3", nombre: "Tres" });
    const otraInstancia = crearColeccion("prueba", SEMILLA, "id", almacenamiento);
    expect(otraInstancia.listar().length).toBe(3);
  });

  it("crear lanza error si el id ya existe", () => {
    expect(() => coleccion.crear({ id: "1", nombre: "Repetido" })).toThrowError(/Ya existe/);
  });

  it("actualizar modifica campos pero no permite cambiar el id", () => {
    const actualizado = coleccion.actualizar("1", { nombre: "Uno editado", id: "otro" });
    expect(actualizado).toEqual({ id: "1", nombre: "Uno editado" });
    expect(coleccion.obtener("1").nombre).toBe("Uno editado");
  });

  it("actualizar lanza error si el registro no existe", () => {
    expect(() => coleccion.actualizar("99", { nombre: "x" })).toThrowError(/No existe/);
  });

  it("eliminar quita el registro e informa si existía", () => {
    expect(coleccion.eliminar("1")).toBeTrue();
    expect(coleccion.eliminar("1")).toBeFalse();
    expect(coleccion.listar().map((r) => r.id)).toEqual(["2"]);
  });

  it("reiniciar vuelve a los datos semilla", () => {
    coleccion.eliminar("1");
    coleccion.reiniciar();
    expect(coleccion.listar().length).toBe(2);
  });

  it("si el almacenamiento tiene datos corruptos, usa la semilla", () => {
    spyOn(console, "error");
    const corrupto = crearAlmacenamientoFalso({ prueba: "{no es json" });
    expect(crearColeccion("prueba", SEMILLA, "id", corrupto).listar().length).toBe(2);
    expect(console.error).toHaveBeenCalled();
  });

  it("no comparte referencias con la semilla", () => {
    coleccion.listar()[0].nombre = "Mutado";
    expect(SEMILLA[0].nombre).toBe("Uno");
  });

  it("crearValor guarda, lee y elimina un valor único", () => {
    const sesion = crearValor("sesion", null, almacenamiento);
    expect(sesion.leer()).toBeNull();
    sesion.guardar({ nombre: "Ana" });
    expect(sesion.leer()).toEqual({ nombre: "Ana" });
    sesion.guardar(null);
    expect(almacenamiento.getItem("sesion")).toBeNull();
  });
});
