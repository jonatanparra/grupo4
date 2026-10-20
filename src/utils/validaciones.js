/* =========================================================
   Funciones de validación reutilizables (puras).
   Cada función devuelve "" si el valor es válido, o un mensaje
   de error explicando qué corregir.
   ========================================================= */
import { DOMINIOS_CORREO_PERMITIDOS } from "../data/datos";

/** Verifica que el valor no esté vacío (quitando espacios). */
export function validarRequerido(valor, etiqueta = "Este campo") {
  if (valor === null || valor === undefined || String(valor).trim() === "") {
    return `Falta completar: ${etiqueta.toLowerCase()}.`;
  }
  return "";
}

/** Verifica un largo máximo. */
export function validarMaximo(valor, max, etiqueta = "Este campo") {
  if (valor && valor.length > max) {
    return `${etiqueta} no puede superar los ${max} caracteres (llevas ${valor.length}).`;
  }
  return "";
}

/** Verifica un largo mínimo. */
export function validarMinimo(valor, min, etiqueta = "Este campo") {
  if (valor && valor.length < min) {
    return `${etiqueta} debe tener al menos ${min} caracteres.`;
  }
  return "";
}

/** Valida que el correo tenga formato válido y pertenezca a los dominios permitidos. */
export function validarCorreo(valor, requerido = true) {
  if (!valor || valor.trim() === "") {
    return requerido ? "Ingresa un correo electrónico." : "";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    return "El correo no tiene un formato válido. Ej: nombre@gmail.com";
  }
  const dominio = valor.split("@")[1].toLowerCase();
  if (!DOMINIOS_CORREO_PERMITIDOS.includes(dominio)) {
    return `Solo se aceptan correos ${DOMINIOS_CORREO_PERMITIDOS.map((d) => "@" + d).join(", ")}.`;
  }
  return validarMaximo(valor, 100, "El correo");
}

/** Valida contraseña: requerida y entre 4 y 10 caracteres. */
export function validarContrasena(valor) {
  const requerido = validarRequerido(valor, "La contraseña");
  if (requerido) return requerido;
  if (valor.length < 4 || valor.length > 10) {
    return "La contraseña debe tener entre 4 y 10 caracteres.";
  }
  return "";
}

/** Valida que dos contraseñas coincidan. */
export function validarConfirmacion(valor, original) {
  if (!valor) return "Confirma tu contraseña.";
  if (valor !== original) return "Las contraseñas no coinciden.";
  return "";
}

/** Calcula el dígito verificador de un RUN chileno. */
export function calcularDigitoVerificador(cuerpo) {
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return String(resto);
}

/** Valida un RUN chileno sin puntos ni guion (ej: 19011022K): largo 7 a 9 y dígito verificador. */
export function validarRun(valor) {
  const requerido = validarRequerido(valor, "El RUN");
  if (requerido) return requerido;

  const limpio = valor.trim().toUpperCase();
  if (!/^[0-9]+[0-9K]$/.test(limpio)) {
    return "El RUN no debe llevar puntos ni guion. Ej: 19011022K";
  }
  if (limpio.length < 7 || limpio.length > 9) {
    return "El RUN debe tener entre 7 y 9 caracteres (sin puntos ni guion).";
  }
  if (limpio.slice(-1) !== calcularDigitoVerificador(limpio.slice(0, -1))) {
    return "El RUN ingresado no es válido. Revisa el dígito verificador.";
  }
  return "";
}

/** Valida un número dentro de un rango, con opción de solo enteros. */
export function validarNumero(valor, { min = null, max = null, soloEntero = false, etiqueta = "Este campo", requerido = true } = {}) {
  if (valor === "" || valor === null || valor === undefined) {
    return requerido ? `${etiqueta} es obligatorio.` : "";
  }
  const num = Number(valor);
  if (Number.isNaN(num)) return `${etiqueta} debe ser un número.`;
  if (soloEntero && !Number.isInteger(num)) return `${etiqueta} debe ser un número entero.`;
  if (min !== null && num < min) return `${etiqueta} no puede ser menor a ${min}.`;
  if (max !== null && num > max) return `${etiqueta} no puede ser mayor a ${max}.`;
  return "";
}

/** Teléfono opcional: solo números, + y espacios (7 a 15 caracteres). */
export function validarTelefono(valor) {
  if (!valor) return "";
  return /^[0-9+\s]{7,15}$/.test(valor) ? "" : "Ingresa un teléfono válido (solo números, + y espacios).";
}

/** Combina validaciones: devuelve el primer mensaje de error encontrado. */
export function primerError(...mensajes) {
  return mensajes.find((m) => m) || "";
}
