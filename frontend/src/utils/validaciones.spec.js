import {
  calcularDigitoVerificador,
  primerError,
  validarConfirmacion,
  validarContrasena,
  validarCorreo,
  validarMaximo,
  validarMinimo,
  validarNumero,
  validarRequerido,
  validarRun,
  validarTelefono,
} from "./validaciones";

describe("Validaciones (funciones puras)", () => {
  describe("validarRequerido", () => {
    it("devuelve error si el valor está vacío o solo tiene espacios", () => {
      expect(validarRequerido("", "El nombre")).toContain("el nombre");
      expect(validarRequerido("   ")).not.toBe("");
      expect(validarRequerido(null)).not.toBe("");
    });

    it("devuelve cadena vacía si hay contenido", () => {
      expect(validarRequerido("Glitch")).toBe("");
    });
  });

  it("validarMaximo y validarMinimo controlan el largo", () => {
    expect(validarMaximo("abcdef", 5)).toContain("5 caracteres");
    expect(validarMaximo("abc", 5)).toBe("");
    expect(validarMinimo("ab", 3)).toContain("al menos 3");
    expect(validarMinimo("abcd", 3)).toBe("");
  });

  describe("validarCorreo", () => {
    it("acepta los dominios permitidos", () => {
      expect(validarCorreo("ana@duoc.cl")).toBe("");
      expect(validarCorreo("ana@profesor.duoc.cl")).toBe("");
      expect(validarCorreo("ana@gmail.com")).toBe("");
    });

    it("rechaza formatos inválidos y dominios no permitidos", () => {
      expect(validarCorreo("ana@")).toContain("formato");
      expect(validarCorreo("ana@hotmail.com")).toContain("Solo se aceptan");
    });

    it("permite vacío solo cuando no es requerido", () => {
      expect(validarCorreo("", true)).not.toBe("");
      expect(validarCorreo("", false)).toBe("");
    });
  });

  it("validarContrasena exige entre 4 y 10 caracteres", () => {
    expect(validarContrasena("")).not.toBe("");
    expect(validarContrasena("abc")).toContain("entre 4 y 10");
    expect(validarContrasena("abcdefghijk")).toContain("entre 4 y 10");
    expect(validarContrasena("clave1")).toBe("");
  });

  it("validarConfirmacion compara ambas contraseñas", () => {
    expect(validarConfirmacion("", "abcd")).toContain("Confirma");
    expect(validarConfirmacion("abce", "abcd")).toContain("no coinciden");
    expect(validarConfirmacion("abcd", "abcd")).toBe("");
  });

  describe("validarRun", () => {
    it("calcula el dígito verificador correcto (incluye K)", () => {
      expect(calcularDigitoVerificador("19110220")).toBe("7");
      expect(calcularDigitoVerificador("11111111")).toBe("1");
      expect(calcularDigitoVerificador("10000013")).toBe("K");
    });

    it("acepta un RUN válido sin puntos ni guion (minúscula o mayúscula)", () => {
      expect(validarRun("191102207")).toBe("");
      expect(validarRun("10000013k")).toBe("");
    });

    it("rechaza RUN con puntos/guion, largo incorrecto o DV erróneo", () => {
      expect(validarRun("19.110.220-3")).toContain("puntos ni guion");
      expect(validarRun("12345")).toContain("entre 7 y 9");
      expect(validarRun("191102203")).toContain("dígito verificador");
      expect(validarRun("")).not.toBe("");
    });
  });

  it("validarNumero valida número, entero y rango", () => {
    expect(validarNumero("", { etiqueta: "El precio" })).toContain("obligatorio");
    expect(validarNumero("", { requerido: false })).toBe("");
    expect(validarNumero("abc")).toContain("número");
    expect(validarNumero("2.5", { soloEntero: true })).toContain("entero");
    expect(validarNumero("-1", { min: 0 })).toContain("menor a 0");
    expect(validarNumero("95", { max: 90 })).toContain("mayor a 90");
    expect(validarNumero("10", { min: 0, max: 90, soloEntero: true })).toBe("");
  });

  it("validarTelefono es opcional pero valida el formato", () => {
    expect(validarTelefono("")).toBe("");
    expect(validarTelefono("+56 9 1234 5678")).toBe("");
    expect(validarTelefono("abc123")).not.toBe("");
  });

  it("primerError devuelve el primer mensaje no vacío", () => {
    expect(primerError("", "error 2", "error 3")).toBe("error 2");
    expect(primerError("", "")).toBe("");
  });
});
