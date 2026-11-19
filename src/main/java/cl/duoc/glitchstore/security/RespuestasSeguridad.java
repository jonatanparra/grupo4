package cl.duoc.glitchstore.security;

import cl.duoc.glitchstore.dto.ErrorDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;

/** Respuestas JSON para 401 (sin sesión / token inválido) y 403 (rol sin permiso). */
@Component
public class RespuestasSeguridad {

    private final ObjectMapper mapper;

    public RespuestasSeguridad(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    public AuthenticationEntryPoint noAutenticado() {
        return (req, res, e) -> {
            Object detalle = req.getAttribute(FiltroJwt.ATRIBUTO_ERROR);
            escribir(req, res, HttpStatus.UNAUTHORIZED, detalle != null ? detalle.toString() : "Debes iniciar sesión.");
        };
    }

    public AccessDeniedHandler sinPermiso() {
        return (req, res, e) -> escribir(req, res, HttpStatus.FORBIDDEN, "No tienes permisos para esta acción.");
    }

    private void escribir(HttpServletRequest req, HttpServletResponse res, HttpStatus estado, String mensaje) throws IOException {
        res.setStatus(estado.value());
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding("UTF-8");
        mapper.writeValue(res.getWriter(), new ErrorDTO(estado.value(), estado.getReasonPhrase(), mensaje, null, req.getRequestURI(), Instant.now()));
    }
}
