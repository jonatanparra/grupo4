import { useState } from "react";
import MarcoGrafico, { TablaDatos, Tooltip, useAncho } from "./MarcoGrafico";
import { ingresosPorCategoria } from "../../../utils/estadisticas";
import { formatoCLP } from "../../../utils/formato";

const ALTO_FILA = 34;
const GROSOR = 16;
const ETIQUETAS = 110; // columna de nombres
const VALORES = 84; // espacio para el monto al final de la barra

/** Barra horizontal con el extremo de datos redondeado (4px) y la base recta en el eje. */
function barra(x0, y0, largo, alto, radio = 4) {
  if (largo <= 0) return "";
  const r = Math.min(radio, largo, alto / 2);
  return `M${x0},${y0}H${x0 + largo - r}Q${x0 + largo},${y0} ${x0 + largo},${y0 + r}V${y0 + alto - r}Q${x0 + largo},${y0 + alto} ${x0 + largo - r},${y0 + alto}H${x0}Z`;
}

/** Gráfico 2 — ¿Qué categoría genera más ingresos? Barras horizontales ordenadas de mayor a menor. */
export default function GraficoCategorias({ ordenes, productos, categorias }) {
  const [ref, ancho] = useAncho();
  const [activa, setActiva] = useState(null);
  const datos = ingresosPorCategoria(ordenes, productos, categorias);
  const maximo = Math.max(1, ...datos.map((d) => d.ingresos));
  const anchoUtil = Math.max(40, ancho - ETIQUETAS - VALORES);
  const alto = datos.length * ALTO_FILA;
  const sinVentas = datos.every((d) => d.ingresos === 0);
  const fila = activa !== null ? datos[activa] : null;

  return (
    <MarcoGrafico
      titulo="Ingresos por categoría"
      subtitulo="Ventas concretadas, de mayor a menor"
      tabla={<TablaDatos columnas={["Categoría", "Unidades", "Ingresos"]} filas={datos.map((d) => [d.nombre, d.unidades, formatoCLP(d.ingresos)])} />}
    >
      <div ref={ref} className="grafico-area">
        {sinVentas ? (
          <p className="grafico-vacio mb-0">Aún no hay ventas registradas.</p>
        ) : (
          <svg width={ancho} height={alto} role="img" aria-label="Ingresos por categoría">
            <line x1={ETIQUETAS} x2={ETIQUETAS} y1={0} y2={alto} stroke="var(--grafico-eje)" aria-hidden="true" />
            {datos.map((d, i) => {
              const largo = (d.ingresos / maximo) * anchoUtil;
              const yFila = i * ALTO_FILA;
              const atenuada = activa !== null && activa !== i;
              return (
                <g
                  key={d.id}
                  data-testid="barra-categoria"
                  onMouseEnter={() => setActiva(i)}
                  onMouseLeave={() => setActiva(null)}
                >
                  {/* zona sensible de toda la fila, más grande que la barra */}
                  <rect x={0} y={yFila} width={ancho} height={ALTO_FILA} fill="transparent" />
                  <text x={ETIQUETAS - 8} y={yFila + ALTO_FILA / 2 + 4} textAnchor="end" style={{ fill: "var(--grafico-texto)" }}>
                    {d.nombre}
                  </text>
                  <path d={barra(ETIQUETAS, yFila + (ALTO_FILA - GROSOR) / 2, largo, GROSOR)} fill="var(--grafico-barra)" opacity={atenuada ? 0.4 : 1} />
                  <text x={ETIQUETAS + largo + 6} y={yFila + ALTO_FILA / 2 + 4}>{formatoCLP(d.ingresos)}</text>
                </g>
              );
            })}
          </svg>
        )}
        {fila && (
          <Tooltip x={ETIQUETAS + (fila.ingresos / maximo) * anchoUtil} y={activa * ALTO_FILA + 6}>
            <strong>{fila.nombre}</strong>
            {fila.unidades} {fila.unidades === 1 ? "unidad" : "unidades"} · {formatoCLP(fila.ingresos)}
          </Tooltip>
        )}
      </div>
    </MarcoGrafico>
  );
}
