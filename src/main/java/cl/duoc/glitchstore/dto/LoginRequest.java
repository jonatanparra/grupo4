package cl.duoc.glitchstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Credenciales de inicio de sesión")
public record LoginRequest(
        @Schema(example = "camila.rojas@duoc.cl") @NotBlank(message = "El correo es obligatorio.") String correo,
        @Schema(example = "admin123") @NotBlank(message = "La contraseña es obligatoria.") String contrasena) {
}
