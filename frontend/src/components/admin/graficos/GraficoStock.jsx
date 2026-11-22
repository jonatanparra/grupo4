import { useState } from "react";
import { Link } from "react-router-dom";
import MarcoGrafico, { TablaDatos, Tooltip, useAncho } from "./MarcoGrafico";
import { stockFrenteACritico } from "../../../utils/estadisticas";

const ALTO_FILA = 32;
const GROSOR = 12;
const ETIQUETAS = 150;
const VALORES = 56;

const corto = (texto, max = 20) => (texto.length > max ? `${texto.slice(0, max - 1)}…` : texto);

/**
 * Gráfico 4 — ¿Qué hay que reponer primero? Gráfico de viñeta (bullet): la barra es el
 * stock actual y la marca vertical es el nivel crítico. Los productos están ordenados por
 * urgencia (stock / nivel crítico); los que ya están en o bajo el nivel se pintan en
 * color de advertencia y llevan el ícono ⚠ (el color no es la única pista).
 */
export default function GraficoStock({ productos }) {
  const [ref, ancho] = useAncho();
  const [activo, setActivo] = useState(null);
  const datos = stockFrenteACritico(productos);
  const maximo = Math.max(1, ...datos.map((d) => Math.max(d.stock, d.stockCritico)));
  const anchoUtil = Math.max(40, ancho - ETIQUETAS - VALORES);
  const escala = (valor) => ETIQUETAS + (valor / maximo) * anchoUtil;
  const criticos = datos.filter((d) => d.critico).length;
  const fila = activo !== null ? datos[activo] : null;

  return (
    <MarcoGrafico
      titulo="Stock frente a nivel crítico"
      subtitulo={`${criticos} ${criticos === 1 ? "producto necesita" : "productos necesitan"} reposición · los más urgentes primero`}
      controles={<Link to="/admin/productos-criticos" className="small link-danger">Ver stock crítico</Link>}
      tabla={
        <TablaDatos
          columnas={["Producto", "Stock", "Nivel crítico", "Estado"]}
          filas={datos.map((d) => [d.nombre, d.stock, d.stockCritico, d.critico ? "⚠ Reponer" : "OK"])}
        />
      }
    >
      <div ref={ref} className="grafico-area">
        {!datos.length ? (
          <p className="grafico-vacio mb-0">Ningún producto tiene nivel crítico definido.</p>
        ) : (
          <svg width={ancho} height={datos.length * ALTO_FILA} role="img" aria-label="Stock actual y nivel crítico por producto">
            <line x1={ETIQUETAS} x2={ETIQUETAS} y1={0} y2={datos.length * ALTO_FILA} stroke="var(--grafico-eje)" aria-hidden="true" />
            {datos.map((d, i) => {
              const yFila = i * ALTO_FILA;
              const centro = yFila + ALTO_FILA / 2;
              const color = d.critico ? "var(--grafico-advertencia)" : "var(--grafico-neutro)";
              return (
                <g key={d.codigo} data-testid="fila-stock" onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)}>
                  <rect x={0} y={yFila} width={ancho} height={ALTO_FILA} fill="transparent" />
                  <text x={ETIQUETAS - 8} y={centro + 4} textAnchor="end" style={{ fill: "var(--grafico-texto)" }}>
                    {d.critico ? "⚠ " : ""}
                    {corto(d.nombre)}
                  </text>
                  <rect x={ETIQUETAS} y={centro - GROSOR / 2} width={Math.max(2, escala(d.stock) - ETIQUETAS)} height={GROSOR} rx="3" fill={color} opacity={activo !== null && activo !== i ? 0.45 : 1} />
                  <line x1={escala(d.stockCritico)} x2={escala(d.stockCritico)} y1={centro - GROSOR} y2={centro + GROSOR} stroke="var(--grafico-texto)" strokeWidth="2" />
                  <text x={Math.max(escala(d.stock), escala(d.stockCritico)) + 8} y={centro + 4}>{d.stock}</text>
                </g>
              );
            })}
          </svg>
        )}
        {datos.length > 0 && (
          <ul className="grafico-leyenda">
            <li><span className="grafico-leyenda__muestra" style={{ background: "var(--grafico-neutro)" }} aria-hidden="true" />Stock suficiente</li>
            <li><span className="grafico-leyenda__muestra" style={{ background: "var(--grafico-advertencia)" }} aria-hidden="true" />⚠ En o bajo el nivel crítico</li>
            <li><span className="grafico-leyenda__muestra" style={{ background: "var(--grafico-texto)", width: 2 }} aria-hidden="true" />Nivel crítico</li>
          </ul>
        )}
        {fila && (
          <Tooltip x={escala(Math.max(fila.stock, fila.stockCritico))} y={activo * ALTO_FILA + 4}>
            <strong>{fila.nombre}</strong>
            Stock {fila.stock} · crítico {fila.stockCritico}
            {fila.critico ? " · reponer" : ""}
          </Tooltip>
        )}
      </div>
    </MarcoGrafico>
  );
}
