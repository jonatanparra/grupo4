import { useState } from "react";
import { CATEGORIAS } from "../../data/datos";
import { useFormulario } from "../../hooks/useFormulario";
import CampoFormulario from "../common/CampoFormulario";
import Alerta from "../common/Alerta";
import Boton from "../common/Boton";
import { primerError, validarMaximo, validarMinimo, validarNumero, validarRequerido } from "../../utils/validaciones";

const TAMANO_MAXIMO_IMAGEN = 500 * 1024; // 500 KB (se guarda en localStorage)

export const validarProducto = (v) => ({
  codigo: primerError(validarRequerido(v.codigo, "El código"), validarMinimo(v.codigo.trim(), 3, "El código")),
  nombre: primerError(validarRequerido(v.nombre, "El nombre"), validarMaximo(v.nombre, 100, "El nombre")),
  descripcion: validarMaximo(v.descripcion, 500, "La descripción"),
  precio: validarNumero(v.precio, { min: 0, etiqueta: "El precio" }),
  descuento: validarNumero(v.descuento, { min: 0, max: 90, soloEntero: true, etiqueta: "El descuento", requerido: false }),
  categoria: validarRequerido(v.categoria, "La categoría"),
  stock: validarNumero(v.stock, { min: 0, soloEntero: true, etiqueta: "El stock" }),
  stockCritico: validarNumero(v.stockCritico, { min: 0, soloEntero: true, etiqueta: "El stock crítico", requerido: false }),
});

/** Convierte un producto a valores de formulario (los inputs trabajan con strings). */
function aValoresFormulario(producto) {
  if (!producto) {
    return { codigo: "", nombre: "", descripcion: "", precio: "", descuento: "0", categoria: "", stock: "", stockCritico: "", imagen: "" };
  }
  return {
    ...producto,
    precio: String(producto.precio),
    descuento: String(producto.descuento ?? 0),
    stock: String(producto.stock),
    stockCritico: producto.stockCritico === null || producto.stockCritico === undefined ? "" : String(producto.stockCritico),
  };
}

/** Formulario de creación/edición de productos. onGuardar recibe el producto ya convertido. */
export default function FormularioProducto({ producto, onGuardar, textoBoton = "Guardar producto" }) {
  const esEdicion = Boolean(producto);
  const { valores, errores, cambiar, asignar, validarTodo, reiniciar } = useFormulario(aValoresFormulario(producto), validarProducto);
  const [resultado, setResultado] = useState(null);
  const [errorImagen, setErrorImagen] = useState("");

  function cargarImagen(evento) {
    const archivo = evento.target.files[0];
    setErrorImagen("");
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) return setErrorImagen("El archivo debe ser una imagen.");
    if (archivo.size > TAMANO_MAXIMO_IMAGEN) return setErrorImagen("La imagen no puede superar los 500 KB.");
    const lector = new FileReader();
    lector.onload = () => asignar("imagen", lector.result);
    lector.readAsDataURL(archivo);
  }

  function enviar(evento) {
    evento.preventDefault();
    if (!validarTodo() || errorImagen) {
      setResultado({ tipo: "danger", texto: "Revisa los campos marcados en rojo." });
      return;
    }
    const datos = {
      codigo: valores.codigo.trim().toUpperCase(),
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      categoria: valores.categoria,
      precio: Number(valores.precio),
      descuento: Number(valores.descuento || 0),
      stock: Number(valores.stock),
      stockCritico: valores.stockCritico === "" ? null : Number(valores.stockCritico),
      imagen: valores.imagen || "/img/logo.png",
    };
    try {
      onGuardar(datos);
      setResultado({ tipo: "success", texto: esEdicion ? "Producto actualizado correctamente." : "Producto creado correctamente." });
      if (!esEdicion) reiniciar();
    } catch (error) {
      setResultado({ tipo: "danger", texto: error.message });
    }
  }

  return (
    <form className="card card-body p-4" onSubmit={enviar} noValidate>
      <Alerta tipo={resultado?.tipo} mensaje={resultado?.texto} onCerrar={() => setResultado(null)} />

      <div className="row g-md-3">
        <div className="col-md-4">
          <CampoFormulario
            name="codigo"
            etiqueta="Código producto"
            valor={valores.codigo}
            onChange={cambiar}
            error={errores.codigo}
            placeholder="Ej: GS-013"
            readOnly={esEdicion}
            ayuda={esEdicion ? "El código no se puede modificar." : "Mínimo 3 caracteres."}
          />
        </div>
        <div className="col-md-8">
          <CampoFormulario name="nombre" etiqueta="Nombre" valor={valores.nombre} onChange={cambiar} error={errores.nombre} maxLength={100} />
        </div>
      </div>

      <CampoFormulario como="textarea" name="descripcion" etiqueta="Descripción" opcional valor={valores.descripcion} onChange={cambiar} error={errores.descripcion} maxLength={500} rows={3} />

      <div className="row g-md-3">
        <div className="col-md-4">
          <CampoFormulario name="precio" tipo="number" etiqueta="Precio (CLP)" valor={valores.precio} onChange={cambiar} error={errores.precio} min="0" placeholder="0 = gratis" />
        </div>
        <div className="col-md-4">
          <CampoFormulario name="descuento" tipo="number" etiqueta="Descuento oferta (%)" valor={valores.descuento} onChange={cambiar} error={errores.descuento} min="0" max="90" ayuda="0 = sin oferta." />
        </div>
        <div className="col-md-4">
          <CampoFormulario como="select" name="categoria" etiqueta="Categoría" valor={valores.categoria} onChange={cambiar} error={errores.categoria}>
            <option value="">-- Seleccione --</option>
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </CampoFormulario>
        </div>
      </div>

      <div className="row g-md-3">
        <div className="col-md-6">
          <CampoFormulario name="stock" tipo="number" etiqueta="Stock" valor={valores.stock} onChange={cambiar} error={errores.stock} min="0" step="1" />
        </div>
        <div className="col-md-6">
          <CampoFormulario
            name="stockCritico"
            tipo="number"
            etiqueta="Stock crítico"
            opcional
            valor={valores.stockCritico}
            onChange={cambiar}
            error={errores.stockCritico}
            min="0"
            step="1"
            ayuda="Se mostrará una alerta cuando el stock llegue a este valor o menos."
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="imagen" className="form-label">
          Imagen <span className="text-body-secondary small fw-normal">(opcional, máx. 500 KB)</span>
        </label>
        <input type="file" id="imagen" accept="image/*" className={`form-control ${errorImagen ? "is-invalid" : ""}`} onChange={cargarImagen} />
        {errorImagen && <div className="invalid-feedback d-block">{errorImagen}</div>}
        {valores.imagen && <img src={valores.imagen} alt="Vista previa" className="mt-2 rounded vista-previa-imagen" />}
      </div>

      <Boton tipo="submit" etiqueta={textoBoton} />
    </form>
  );
}
