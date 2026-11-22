import Boton from "./Boton";

/** Aviso cuando no se pudo obtener información del backend, con opción de reintentar. */
export default function ErrorConexion({ mensaje, onReintentar }) {
  return (
    <div className="container py-5">
      <div className="alert alert-danger" role="alert">
        <h2 className="h5">No pudimos cargar la información</h2>
        <p>{mensaje}</p>
        {onReintentar && <Boton etiqueta="Reintentar" variante="contorno" tamano="sm" onClick={onReintentar} />}
      </div>
    </div>
  );
}
