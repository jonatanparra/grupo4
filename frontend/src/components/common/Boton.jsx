const VARIANTES = {
  primario: "btn-glitch",
  contorno: "btn-outline-light",
  peligro: "btn-outline-danger",
  secundario: "btn-secondary",
};

/**
 * Botón reutilizable con los estilos de la tienda (Bootstrap + tema glitch).
 * Recibe el texto por la prop "etiqueta" (o como children) y la función onClick.
 */
export default function Boton({
  etiqueta,
  children,
  onClick,
  variante = "primario",
  tipo = "button",
  tamano,
  ancho = false,
  disabled = false,
  className = "",
  ...resto
}) {
  const clases = [
    "btn",
    VARIANTES[variante] || VARIANTES.primario,
    tamano === "sm" && "btn-sm",
    tamano === "lg" && "btn-lg",
    ancho && "w-100",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={tipo} className={clases} onClick={onClick} disabled={disabled} {...resto}>
      {etiqueta ?? children}
    </button>
  );
}
