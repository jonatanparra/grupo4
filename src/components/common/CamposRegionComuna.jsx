import { REGIONES } from "../../data/datos";
import CampoFormulario from "./CampoFormulario";

/**
 * Selects dependientes de región y comuna. Al cambiar la región,
 * se limpia la comuna (la lista de comunas depende de la región).
 */
export default function CamposRegionComuna({ region, comuna, onChange, errores = {} }) {
  const comunas = REGIONES.find((r) => r.id === region)?.comunas || [];

  function cambiarRegion(evento) {
    onChange(evento);
    onChange({ target: { name: "comuna", value: "" } });
  }

  return (
    <div className="row g-md-3">
      <div className="col-md-6">
        <CampoFormulario como="select" name="region" etiqueta="Región" valor={region} onChange={cambiarRegion} error={errores.region}>
          <option value="">-- Seleccione la región --</option>
          {REGIONES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </CampoFormulario>
      </div>
      <div className="col-md-6">
        <CampoFormulario
          como="select"
          name="comuna"
          etiqueta="Comuna"
          valor={comuna}
          onChange={onChange}
          error={errores.comuna}
          disabled={!region}
        >
          <option value="">-- Seleccione la comuna --</option>
          {comunas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </CampoFormulario>
      </div>
    </div>
  );
}
