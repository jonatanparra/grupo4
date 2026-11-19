package cl.duoc.glitchstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.Map;

@Schema(description = "Respuesta de error uniforme de la API")
public record ErrorDTO(
        @Schema(example = "400") int estado,
        @Schema(example = "Bad Request") String error,
        @Schema(example = "Hay datos inválidos.") String mensaje,
        @Schema(description = "Errores por campo (validaciones)") Map<String, String> campos,
        @Schema(example = "/api/v1/productos") String ruta,
        Instant fecha) {
}
