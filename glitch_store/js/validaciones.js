/** Verifica que el valor no esté vacío (quitando espacios). */
function validarRequerido(valor, etiqueta = "Este campo") {
  if (!valor || valor.trim() === "") {
    return `${etiqueta} es obligatorio.`;
  }
  return "";
}

/** Verifica un largo máximo. */
function validarMaximo(valor, max, etiqueta = "Este campo") {
  if (valor && valor.length > max) {
    return `${etiqueta} no puede superar los ${max} caracteres (llevas ${valor.length}).`;
  }
  return "";
}

/** Verifica un largo mínimo. */
function validarMinimo(valor, min, etiqueta = "Este campo") {
  if (valor && valor.length < min) {
    return `${etiqueta} debe tener al menos ${min} caracteres.`;
  }
  return "";
}

/** Valida que el correo tenga formato válido y pertenezca a los dominios permitidos. */
function validarCorreo(valor, requerido = true) {
  if (!valor || valor.trim() === "") {
    return requerido ? "Ingresa un correo electrónico." : "";
  }
  const formatoOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  if (!formatoOk) {
    return "El correo no tiene un formato válido. Ej: nombre@gmail.com";
  }
  const dominio = valor.split("@")[1]?.toLowerCase();
  const permitido = DOMINIOS_CORREO_PERMITIDOS.some((d) => dominio === d);
  if (!permitido) {
    return `Solo se aceptan correos ${DOMINIOS_CORREO_PERMITIDOS.map((d) => "@" + d).join(", ")}.`;
  }
  return "";
}

/** Valida contraseña: requerida y entre 4 y 10 caracteres. */
function validarContrasena(valor) {
  const req = validarRequerido(valor, "La contraseña");
  if (req) return req;
  if (valor.length < 4 || valor.length > 10) {
    return "La contraseña debe tener entre 4 y 10 caracteres.";
  }
  return "";
}

/** Valida que dos contraseñas coincidan. */
function validarConfirmacion(valor, original) {
  if (!valor) return "Confirma tu contraseña.";
  if (valor !== original) return "Las contraseñas no coinciden.";
  return "";
}

/**
 * Valida un RUN chileno sin puntos ni guion (ej: 19011022K).
 * Verifica largo (7 a 9) y dígito verificador.
 */
function validarRun(valor) {
  const req = validarRequerido(valor, "El RUN");
  if (req) return req;

  const limpio = valor.trim().toUpperCase();

  if (!/^[0-9]+[0-9K]$/.test(limpio)) {
    return "El RUN no debe llevar puntos ni guion. Ej: 19011022K";
  }
  if (limpio.length < 7 || limpio.length > 9) {
    return "El RUN debe tener entre 7 y 9 caracteres (sin puntos ni guion).";
  }

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  let dvEsperado;
  if (resto === 11) dvEsperado = "0";
  else if (resto === 10) dvEsperado = "K";
  else dvEsperado = String(resto);

  if (dv !== dvEsperado) {
    return "El RUN ingresado no es válido. Revisa el dígito verificador.";
  }
  return "";
}

/** Valida un número dentro de un rango, con opción de solo enteros. */
function validarNumero(valor, { min = null, max = null, soloEntero = false, etiqueta = "Este campo", requerido = true } = {}) {
  if (valor === "" || valor === null || valor === undefined) {
    return requerido ? `${etiqueta} es obligatorio.` : "";
  }
  const num = Number(valor);
  if (Number.isNaN(num)) {
    return `${etiqueta} debe ser un número.`;
  }
  if (soloEntero && !Number.isInteger(num)) {
    return `${etiqueta} debe ser un número entero.`;
  }
  if (min !== null && num < min) {
    return `${etiqueta} no puede ser menor a ${min}.`;
  }
  if (max !== null && num > max) {
    return `${etiqueta} no puede ser mayor a ${max}.`;
  }
  return "";
}

/**
 * Motor genérico de validación de formularios.
 * reglas: { idInput: () => mensajeDeError }
 * Muestra el mensaje bajo cada campo (elemento con id = idInput + "-error")
 * y agrega/quita la clase "campo-invalido".
 * Devuelve true si el formulario es válido.
 */
function validarFormulario(reglas) {
  let formularioValido = true;

  Object.entries(reglas).forEach(([idInput, funcionValidadora]) => {
    const input = document.getElementById(idInput);
    const errorEl = document.getElementById(idInput + "-error");
    if (!input) return;

    const mensaje = funcionValidadora();

    if (mensaje) {
      formularioValido = false;
      input.classList.add("campo-invalido");
      if (errorEl) errorEl.textContent = mensaje;
    } else {
      input.classList.remove("campo-invalido");
      if (errorEl) errorEl.textContent = "";
    }
  });

  return formularioValido;
}

/** Ata la validación en tiempo real (evento "input"/"blur") a un campo. */
function validarEnVivo(idInput, funcionValidadora) {
  const input = document.getElementById(idInput);
  if (!input) return;
  const evento = input.tagName === "SELECT" ? "change" : "input";
  input.addEventListener(evento, () => {
    const errorEl = document.getElementById(idInput + "-error");
    const mensaje = funcionValidadora();
    if (mensaje) {
      input.classList.add("campo-invalido");
      if (errorEl) errorEl.textContent = mensaje;
    } else {
      input.classList.remove("campo-invalido");
      if (errorEl) errorEl.textContent = "";
    }
  });
}
