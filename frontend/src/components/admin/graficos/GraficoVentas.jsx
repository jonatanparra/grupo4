import { useMemo, useState } from "react";
import MarcoGrafico, { TablaDatos, Tooltip, useAncho } from "./MarcoGrafico";
import { marcasEje, ventasAgrupadas } from "../../../utils/estadisticas";
import { formatoCLP } from "../../../utils/formato";

/** Período → días agrupados por punto: hasta 30 días, un punto por día; 90 días, uno por semana. */
const PERIODOS = [
  { dias: 7, agrupar: 1 },
  { dias: 30, agrupar: 1 },
  { dias: 90, agrupar: 7 },
];
const ALTO = 220;
const MARGEN = { arriba: 12, derecha: 12, abajo: 28, izquierda: 64 };
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-10-05" → "5 oct" (sin pasar por Date para no correr el día por la zona horaria). */
export const fechaCorta = (dia) => `${Number(dia.slice(8))} ${MESES[Number(dia.slice(5, 7)) - 1]}`;
const montoCorto = (valor) => (valor >= 1000 ? `$${Math.round(valor / 1000)} mil` : `$${valor}`);

/** Gráfico 1 — ¿Cómo evolucionan los ingresos? Línea con área de las ventas concretadas (por día o por semana). */
export default function GraficoVentas({ ordenes, hoy }) {
  const [dias, setDias] = useState(30);
  const [activo, setActivo] = useState(null);
  const [ref, ancho] = useAncho();
  const agrupar = PERIODOS.find((p) => p.dias === dias).agrupar;
  const datos = useMemo(() => ventasAgrupadas(ordenes, dias, agrupar, hoy), [ordenes, dias, agrupar, hoy]);
  const porSemana = agrupar > 1;
  const etiqueta = (d) => (porSemana ? `Semana del ${fechaCorta(d.fecha)}` : fechaCorta(d.fecha));
  const total = datos.reduce((t, d) => t + d.total, 0);
  const cantidad = datos.reduce((t, d) => t + d.ordenes, 0);

  const marcas = marcasEje(Math.max(...datos.map((d) => d.total)));
  const maximo = marcas.at(-1);
  const anchoUtil = ancho - MARGEN.izquierda - MARGEN.derecha;
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo;
  const x = (i) => MARGEN.izquierda + (datos.length === 1 ? anchoUtil / 2 : (i / (datos.length - 1)) * anchoUtil);
  const y = (valor) => MARGEN.arriba + altoUtil - (valor / maximo) * altoUtil;
  const linea = datos.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.total)}`).join("");
  const area = `${linea}L${x(datos.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const cadaCuantos = Math.ceil(datos.length / Math.max(2, Math.floor(anchoUtil / 70)));

  function mover(evento) {
    // La zona sensible cubre solo el área de dibujo: su borde izquierdo es el día 0.
    const caja = evento.currentTarget.getBoundingClientRect();
    const proporcion = (evento.clientX - caja.left) / caja.width;
    setActivo(Math.max(0, Math.min(datos.length - 1, Math.round(proporcion * (datos.length - 1)))));
  }

  const controles = (
    <div className="btn-group btn-group-sm" role="group" aria-label="Período">
      {PERIODOS.map(({ dias: p }) => (
        <button key={p} type="button" className={`btn ${p === dias ? "btn-glitch" : "btn-outline-secondary"}`} aria-pressed={p === dias} onClick={() => setDias(p)}>
          {p} días
        </button>
      ))}
    </div>
  );

  const punto = activo !== null ? datos[activo] : null;

  return (
    <MarcoGrafico
      titulo="Ventas en el tiempo"
      subtitulo={`${formatoCLP(total)} en ${cantidad} ${cantidad === 1 ? "venta" : "ventas"} · últimos ${dias} días${porSemana ? " · por semana" : ""}`}
      controles={controles}
      tabla={<TablaDatos columnas={[porSemana ? "Semana" : "Día", "Ventas", "Ingresos"]} filas={datos.filter((d) => d.ordenes).map((d) => [etiqueta(d), d.ordenes, formatoCLP(d.total)])} />}
    >
      <div ref={ref} className="grafico-area">
        {cantidad === 0 && <p className="grafico-vacio position-absolute w-100 mb-0" style={{ top: 0, height: altoUtil }}>Sin ventas en este período.</p>}
        <svg width={ancho} height={ALTO} role="img" aria-label={`Ingresos por ${porSemana ? "semana" : "día"} de los últimos ${dias} días`}>
          <g aria-hidden="true">
            {marcas.map((m) => (
              <g key={m}>
                <line x1={MARGEN.izquierda} x2={ancho - MARGEN.derecha} y1={y(m)} y2={y(m)} stroke={m === 0 ? "var(--grafico-eje)" : "var(--grafico-grilla)"} />
                <text x={MARGEN.izquierda - 8} y={y(m) + 4} textAnchor="end">{montoCorto(m)}</text>
              </g>
            ))}
            {datos.map((d, i) =>
              i % cadaCuantos === 0 ? (
                <text key={d.fecha} x={x(i)} y={ALTO - 8} textAnchor="middle">{fechaCorta(d.fecha)}</text>
              ) : null
            )}
            <path d={area} fill="var(--grafico-serie)" fillOpacity="0.15" />
            <path d={linea} fill="none" stroke="var(--grafico-serie)" strokeWidth="2" strokeLinejoin="round" />
            {punto && (
              <>
                <line x1={x(activo)} x2={x(activo)} y1={MARGEN.arriba} y2={y(0)} stroke="var(--grafico-eje)" strokeDasharray="3 3" />
                <circle cx={x(activo)} cy={y(punto.total)} r="5" fill="var(--grafico-serie)" stroke="var(--grafico-superficie)" strokeWidth="2" />
              </>
            )}
          </g>
          <rect
            data-testid="zona-ventas"
            x={MARGEN.izquierda}
            y={MARGEN.arriba}
            width={anchoUtil}
            height={altoUtil}
            fill="transparent"
            onMouseMove={mover}
            onMouseLeave={() => setActivo(null)}
          />
        </svg>
        {punto && (
          <Tooltip x={x(activo)} y={y(punto.total)}>
            <strong>{etiqueta(punto)}</strong>
            {formatoCLP(punto.total)} · {punto.ordenes} {punto.ordenes === 1 ? "venta" : "ventas"}
          </Tooltip>
        )}
      </div>
    </MarcoGrafico>
  );
}
