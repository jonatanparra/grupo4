import { useState } from "react";

/**
 * Hook para manejar el estado y la validación de un formulario.
 * @param {object}   valoresIniciales  { campo: valor }
 * @param {function} validar           (valores) => { campo: "mensaje de error" | "" }
 *
 * Los errores se calculan siempre a partir de los valores actuales, pero solo
 * se muestran en los campos ya modificados o después de intentar enviar.
 */
export function useFormulario(valoresIniciales, validar) {
  const [valores, setValores] = useState(valoresIniciales);
  const [tocados, setTocados] = useState({});
  const [enviado, setEnviado] = useState(false);

  const errores = validar(valores);
  const erroresVisibles = {};
  Object.entries(errores).forEach(([campo, mensaje]) => {
    if (mensaje && (enviado || tocados[campo])) erroresVisibles[campo] = mensaje;
  });

  function cambiar(evento) {
    const { name, value, type, checked } = evento.target;
    setValores((previos) => ({ ...previos, [name]: type === "checkbox" ? checked : value }));
    setTocados((previos) => ({ ...previos, [name]: true }));
  }

  function asignar(campo, valor) {
    setValores((previos) => ({ ...previos, [campo]: valor }));
  }

  /** Marca el formulario como enviado y devuelve true si no hay errores. */
  function validarTodo() {
    setEnviado(true);
    return Object.values(errores).every((mensaje) => !mensaje);
  }

  function reiniciar(nuevosValores = valoresIniciales) {
    setValores(nuevosValores);
    setTocados({});
    setEnviado(false);
  }

  return { valores, errores: erroresVisibles, cambiar, asignar, validarTodo, reiniciar };
}
