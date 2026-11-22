package cl.duoc.glitchstore.exception;

/** El registro choca con uno existente, ej: código o correo duplicado (HTTP 409). */
public class ConflictoException extends RuntimeException {

    public ConflictoException(String mensaje) {
        super(mensaje);
    }
}
