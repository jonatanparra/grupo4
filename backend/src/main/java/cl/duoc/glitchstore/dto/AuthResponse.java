package cl.duoc.glitchstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Tokens JWT y datos del usuario autenticado")
public record AuthResponse(
        @Schema(description = "JWT de acceso; se envía en el header Authorization: Bearer <token>") String accessToken,
        @Schema(description = "JWT para pedir un nuevo accessToken en /api/v1/auth/refresh") String refreshToken,
        @Schema(example = "Bearer") String tipoToken,
        @Schema(description = "Segundos de vigencia del accessToken", example = "900") long expiraEn,
        UsuarioDTO usuario) {
}
