package cl.duoc.glitchstore.dto;

import cl.duoc.glitchstore.validation.CorreoPermitido;
import cl.duoc.glitchstore.validation.RunValido;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Schema(description = "Registro público de un cliente nuevo")
public record RegistroRequest(
        @Schema(example = "200123456") @NotBlank(message = "El RUN es obligatorio.") @RunValido String run,
        @Schema(example = "Ignacio") @NotBlank(message = "El nombre es obligatorio.") @Size(max = 50) String nombre,
        @Schema(example = "Pérez Lagos") @NotBlank(message = "Los apellidos son obligatorios.") @Size(max = 100) String apellidos,
        @Schema(example = "ignacio.perez@gmail.com") @NotBlank(message = "El correo es obligatorio.") @Size(max = 100) @CorreoPermitido String correo,
        @Schema(example = "clave123") @NotBlank(message = "La contraseña es obligatoria.")
        @Size(min = 4, max = 10, message = "La contraseña debe tener entre 4 y 10 caracteres.") String contrasena,
        @Schema(example = "1999-05-20") @Past(message = "La fecha de nacimiento debe ser pasada.") LocalDate fechaNacimiento,
        @Schema(example = "metropolitana") @Size(max = 60) String region,
        @Schema(example = "providencia") @Size(max = 60) String comuna,
        @Schema(example = "Los Leones 100") @Size(max = 300) String direccion) {
}
