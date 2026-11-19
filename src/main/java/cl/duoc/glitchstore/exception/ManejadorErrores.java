package cl.duoc.glitchstore.exception;

import cl.duoc.glitchstore.dto.ErrorDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/** Convierte las excepciones en respuestas JSON uniformes (ErrorDTO). */
@RestControllerAdvice
public class ManejadorErrores {

    private static final Logger log = LoggerFactory.getLogger(ManejadorErrores.class);

    @ExceptionHandler(NoEncontradoException.class)
    public ResponseEntity<ErrorDTO> noEncontrado(NoEncontradoException e, HttpServletRequest req) {
        return respuesta(HttpStatus.NOT_FOUND, e.getMessage(), null, req);
    }

    @ExceptionHandler(ConflictoException.class)
    public ResponseEntity<ErrorDTO> conflicto(ConflictoException e, HttpServletRequest req) {
        return respuesta(HttpStatus.CONFLICT, e.getMessage(), null, req);
    }

    @ExceptionHandler({ReglaNegocioException.class, IllegalArgumentException.class})
    public ResponseEntity<ErrorDTO> reglaNegocio(RuntimeException e, HttpServletRequest req) {
        return respuesta(HttpStatus.BAD_REQUEST, e.getMessage(), null, req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDTO> validacion(MethodArgumentNotValidException e, HttpServletRequest req) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError error : e.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return respuesta(HttpStatus.BAD_REQUEST, "Hay datos inválidos.", campos, req);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorDTO> jsonInvalido(HttpMessageNotReadableException e, HttpServletRequest req) {
        return respuesta(HttpStatus.BAD_REQUEST, "El cuerpo de la solicitud no es un JSON válido.", null, req);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorDTO> credenciales(BadCredentialsException e, HttpServletRequest req) {
        return respuesta(HttpStatus.UNAUTHORIZED, e.getMessage(), null, req);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorDTO> accesoDenegado(AccessDeniedException e, HttpServletRequest req) {
        return respuesta(HttpStatus.FORBIDDEN, "No tienes permisos para esta acción.", null, req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDTO> inesperado(Exception e, HttpServletRequest req) {
        log.error("Error no controlado en {}", req.getRequestURI(), e);
        return respuesta(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado en el servidor.", null, req);
    }

    private ResponseEntity<ErrorDTO> respuesta(HttpStatus estado, String mensaje, Map<String, String> campos, HttpServletRequest req) {
        ErrorDTO cuerpo = new ErrorDTO(estado.value(), estado.getReasonPhrase(), mensaje, campos, req.getRequestURI(), Instant.now());
        return ResponseEntity.status(estado).body(cuerpo);
    }
}
