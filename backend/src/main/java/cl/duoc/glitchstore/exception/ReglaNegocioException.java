package cl.duoc.glitchstore.exception;

/** Los datos son válidos en forma pero rompen una regla de negocio (HTTP 400). */
public class ReglaNegocioException extends RuntimeException {

    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
