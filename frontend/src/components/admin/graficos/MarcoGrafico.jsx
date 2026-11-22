import { useEffect, useRef, useState } from "react";

/** Mide el ancho disponible para dibujar el SVG a su tamaño real (texto nítido en cualquier pantalla). */
export function useAncho(anchoInicial = 560) {
  const ref = useRef(null);
  const [ancho, setAncho] = useState(anchoInicial);
  useEffect(() => {
    const nodo = ref.current;
    if (!nodo || typeof ResizeObserver === "undefined") return undefined;
    const observador = new ResizeObserver(([entrada]) => {
      const medido = Math.floor(entrada.contentRect.width);
      if (medido > 0) setAncho(medido);
    });
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);
  return [ref, ancho];
}

/** Globo con el detalle del elemento bajo el cursor. */
export function Tooltip({ x, y, children }) {
  return (
    <div className="grafico-tooltip" role="status" style={{ left: x, top: y }}>
      {children}
    </div>
  );
}

/**
 * Tarjeta común de los gráficos: título, subtítulo, controles (filtros),
 * el gráfico y una tabla con los mismos datos para lectores de pantalla
 * o para quien prefiera los números.
 */
export default function MarcoGrafico({ titulo, subtitulo, controles, tabla, children }) {
  return (
    <section className="card card-body h-100 grafico" aria-label={titulo}>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
        <div>
          <h2 className="h6 mb-0">{titulo}</h2>
          {subtitulo && <p className="small text-body-secondary mb-0">{subtitulo}</p>}
        </div>
        {controles}
      </div>
      {children}
      {tabla && (
        <details className="mt-2 small">
          <summary className="text-body-secondary">Ver datos en tabla</summary>
          <div className="table-responsive mt-2">{tabla}</div>
        </details>
      )}
    </section>
  );
}

/** Tabla simple para la vista de datos de cada gráfico. */
export function TablaDatos({ columnas, filas }) {
  return (
    <table className="table table-sm mb-0">
      <thead>
        <tr>
          {columnas.map((c) => (
            <th key={c} scope="col">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila, i) => (
          <tr key={i}>
            {fila.map((celda, j) => (
              <td key={j}>{celda}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
