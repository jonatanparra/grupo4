import EstadoVacio from "../components/common/EstadoVacio";

export default function NoEncontrado() {
  return (
    <div className="container py-5">
      <EstadoVacio titulo="404 · Página no encontrada" mensaje="Parece que caíste en un glitch. Esta página no existe." enlace="/" textoEnlace="Volver al inicio" />
    </div>
  );
}
