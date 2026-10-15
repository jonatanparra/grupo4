/**
 * Campo de formulario con etiqueta, ayuda y mensaje de error (estilos Bootstrap).
 * como: "input" (por defecto), "textarea" o "select" (las <option> van como children).
 * El mensaje de error solo se renderiza cuando la prop "error" tiene contenido.
 */
export default function CampoFormulario({
  name,
  id,
  etiqueta,
  tipo = "text",
  valor,
  onChange,
  error,
  ayuda,
  opcional = false,
  como = "input",
  children,
  className = "",
  ...resto
}) {
  const idCampo = id || name;
  const claseBase = como === "select" ? "form-select" : "form-control";
  const propiedades = {
    id: idCampo,
    name,
    value: valor ?? "",
    onChange,
    className: `${claseBase}${error ? " is-invalid" : ""}`,
    "aria-invalid": error ? "true" : "false",
    "aria-describedby": error ? `${idCampo}-error` : undefined,
    ...resto,
  };

  let control;
  if (como === "textarea") control = <textarea {...propiedades} />;
  else if (como === "select") control = <select {...propiedades}>{children}</select>;
  else control = <input type={tipo} {...propiedades} />;

  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={idCampo} className="form-label">
        {etiqueta} {opcional && <span className="text-body-secondary small fw-normal">(opcional)</span>}
      </label>
      {control}
      {ayuda && <div className="form-text">{ayuda}</div>}
      {error && (
        <div className="invalid-feedback d-block" id={`${idCampo}-error`} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
