package cl.duoc.glitchstore.dto;

import cl.duoc.glitchstore.model.Producto;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Producto (API v1: datos básicos, misma forma que usa el frontend)")
public record ProductoDTO(
        @Schema(example = "GS-001") String codigo,
        @Schema(example = "Hollow Knight") String nombre,
        @Schema(description = "Nombre de la categoría", example = "Indie") String categoria,
        @Schema(example = "13990") Integer precio,
        @Schema(description = "Porcentaje de oferta (0 = sin oferta)", example = "0") Integer descuento,
        @Schema(example = "22") Integer stock,
        @Schema(example = "5") Integer stockCritico,
        String descripcion,
        @Schema(example = "/img/juegos/GS-001.jpg") String imagen) {

    public static ProductoDTO desde(Producto p) {
        return new ProductoDTO(p.getCodigo(), p.getNombre(), p.getCategoria().getNombre(), p.getPrecio(), p.getDescuento(),
                p.getStock(), p.getStockCritico(), p.getDescripcion(), p.getImagen());
    }
}
