package cl.duoc.glitchstore.dto;

import cl.duoc.glitchstore.model.Categoria;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Categoría de productos")
public record CategoriaDTO(
        @Schema(example = "terror") String id,
        @Schema(example = "Terror") String nombre,
        @Schema(example = "Survival horror y experiencias que te quitan el sueño.") String descripcion,
        @Schema(example = "/img/categorias/terror.jpg") String imagen,
        @Schema(description = "Cantidad de productos de la categoría", example = "3") long cantidadProductos) {

    public static CategoriaDTO desde(Categoria c, long cantidadProductos) {
        return new CategoriaDTO(c.getId(), c.getNombre(), c.getDescripcion(), c.getImagen(), cantidadProductos);
    }
}
