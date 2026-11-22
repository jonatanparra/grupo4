import { useState } from "react";
import MarcoGrafico, { TablaDatos, Tooltip, useAncho } from "./MarcoGrafico";
import { ordenesPorEstado } from "../../../utils/estadisticas";

const ALTO = 28;
const ESPACIO = 2; // separación entre segmentos, del color de la superficie
const COLOR = {
  Pagado: "var(--estado-pagado)",
  Enviado: "var(--estado-enviado)",
  Entregado: "var(--estado-entregado)",
  Rechazado: "var(--estado-rechazado)",
  Anulado: "var(--estado-anulado)",
};

/**
 * Gráfico 3 — ¿Cómo terminan las órdenes? Una barra al 100% dividida por estado.
 * Cada estado tiene siempre el mismo color, y la leyenda repite nombre, cantidad y %
 * para que el color nunca sea la única pista.
 */
export default function GraficoEstados({ ordenes }) {
  const [ref, ancho] = useAncho();
  const [activo, setActivo] = useState(null);
  const datos = ordenesPorEstado(ordenes);
  const total = ordenes.length;
  const anchoUtil = ancho - ESPACIO * Math.max(0, datos.length - 1);

  let acumulado = 0;
  const segmentos = datos.map((d, i) => {
    const largo = (d.cantidad / total) * anchoUtil;
    const segmento = { ...d, x: acumulado + i * ESPACIO, largo };
    acumulado += largo;
    return segmento;
  });
  const activoDatos = activo !== null ? segmentos[activo] : null;
  const concretadas = datos.filter((d) => ["Pagado", "Enviado", "Entregado"].includes(d.estado)).reduce((t, d) => t + d.cantidad, 0);

  return (
    <MarcoGrafico
      titulo="Estado de las órdenes"
      subtitulo={total ? `${Math.round((concretadas / total) * 100)}% de ${total} órdenes terminó en venta` : "Sin órdenes registradas"}
      tabla={<TablaDatos columnas={["Estado", "Órdenes", "%"]} filas={datos.map((d) => [d.estado, d.cantidad, `${d.porcentaje}%`])} />}
    >
      <div ref={ref} className="grafico-area">
        {!total ? (
          <p className="grafico-vacio mb-0">Aún no hay órdenes.</p>
        ) : (
          <>
            <svg width={ancho} height={ALTO} role="img" aria-label="Distribución de órdenes por estado">
              {segmentos.map((s, i) => (
                <rect
                  key={s.estado}
                  data-testid="segmento-estado"
                  x={s.x}
                  y={0}
                  width={Math.max(1, s.largo)}
                  height={ALTO}
                  rx={i === 0 || i === segmentos.length - 1 ? 4 : 0}
                  fill={COLOR[s.estado]}
                  opacity={activo !== null && activo !== i ? 0.4 : 1}
                  onMouseEnter={() => setActivo(i)}
                  onMouseLeave={() => setActivo(null)}
                />
              ))}
            </svg>
            <ul className="grafico-leyenda">
              {datos.map((d) => (
                <li key={d.estado}>
                  <span className="grafico-leyenda__muestra" style={{ background: COLOR[d.estado] }} aria-hidden="true" />
                  {d.estado} <span className="text-body-secondary">{d.cantidad} · {d.porcentaje}%</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {activoDatos && (
          <Tooltip x={activoDatos.x + activoDatos.largo / 2} y={0}>
            <strong>{activoDatos.estado}</strong>
            {activoDatos.cantidad} {activoDatos.cantidad === 1 ? "orden" : "órdenes"} · {activoDatos.porcentaje}%
          </Tooltip>
        )}
      </div>
    </MarcoGrafico>
  );
}
