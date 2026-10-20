import { Link } from "react-router-dom";

/** Bloque para listas vacías o recursos no encontrados, con una acción opcional. */
export default function EstadoVacio({ titulo, mensaje, enlace, textoEnlace }) {
  return (
    <div className="text-center py-5 estado-vacio">
      <h2 className="h4">{titulo}</h2>
      {mensaje && <p className="mx-auto">{mensaje}</p>}
      {enlace && (
        <Link to={enlace} className="btn btn-glitch">
          {textoEnlace}
        </Link>
      )}
    </div>
  );
}
