package cl.duoc.glitchstore.dto;

import cl.duoc.glitchstore.model.Usuario;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Usuario (nunca incluye la contraseña)")
public record UsuarioDTO(
        @Schema(example = "191102207") String run,
        @Schema(example = "Camila") String nombre,
        @Schema(example = "Rojas Muñoz") String apellidos,
        @Schema(example = "camila.rojas@duoc.cl") String correo,
        @Schema(description = "Administrador, Vendedor o Cliente", example = "Administrador") String tipo,
        @Schema(example = "1996-04-12") LocalDate fechaNacimiento,
        @Schema(example = "metropolitana") String region,
        @Schema(example = "santiago") String comuna,
        @Schema(example = "Av. Siempre Viva 123") String direccion) {

    public static UsuarioDTO desde(Usuario u) {
        return new UsuarioDTO(u.getRun(), u.getNombre(), u.getApellidos(), u.getCorreo(), u.getRol().getEtiqueta(),
                u.getFechaNacimiento(), u.getRegion(), u.getComuna(), u.getDireccion());
    }
}
