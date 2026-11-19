package cl.duoc.glitchstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos para crear o actualizar una categoría")
public record CategoriaRequest(
        @Schema(description = "Identificador (solo al crear)", example = "estrategia")
        @Pattern(regexp = "^[a-z0-9-]{3,40}$", message = "El id debe tener de 3 a 40 letras minúsculas, números o guiones.")
        String id,
        @Schema(example = "Estrategia") @NotBlank(message = "El nombre es obligatorio.") @Size(max = 60) String nombre,
        @Schema(example = "Planifica, construye y conquista.") @Size(max = 300) String descripcion,
        @Schema(example = "/img/categorias/estrategia.jpg") @Size(max = 300) String imagen) {
}
