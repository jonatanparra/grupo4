package cl.duoc.glitchstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Token de renovación entregado en el login")
public record RefreshRequest(@NotBlank(message = "El refreshToken es obligatorio.") String refreshToken) {
}
