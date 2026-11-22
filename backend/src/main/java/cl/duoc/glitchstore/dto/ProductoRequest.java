package cl.duoc.glitchstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos para crear o actualizar un producto")
public record ProductoRequest(
        @Schema(description = "Código único (solo al crear; mínimo 3 caracteres)", example = "GS-013")
        @Size(min = 3, max = 20, message = "El código debe tener entre 3 y 20 caracteres.") String codigo,
        @Schema(example = "Hades") @NotBlank(message = "El nombre es obligatorio.") @Size(max = 100) String nombre,
        @Schema(description = "Nombre o id de la categoría", example = "Indie") @NotBlank(message = "La categoría es obligatoria.") String categoria,
        @Schema(example = "15990") @NotNull(message = "El precio es obligatorio.") @Min(value = 0, message = "El precio no puede ser negativo.") Integer precio,
        @Schema(example = "10") @Min(value = 0, message = "El descuento va de 0 a 90.") @Max(value = 90, message = "El descuento va de 0 a 90.") Integer descuento,
        @Schema(example = "25") @NotNull(message = "El stock es obligatorio.") @Min(value = 0, message = "El stock no puede ser negativo.") Integer stock,
        @Schema(example = "5") @Min(value = 0, message = "El stock crítico no puede ser negativo.") Integer stockCritico,
        @Schema(example = "Roguelike de acción en el inframundo griego.") @Size(max = 1000) String descripcion,
        @Schema(description = "Ruta de la imagen o data URL en Base64", example = "/img/juegos/GS-013.jpg") String imagen) {
}
