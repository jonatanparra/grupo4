package cl.duoc.glitchstore.dto;

import cl.duoc.glitchstore.model.Producto;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Producto (API v2: incluye la categoría completa y datos calculados)")
public record ProductoV2DTO(
        @Schema(example = "GS-004") String codigo,
        @Schema(example = "Outlast") String nombre,
        CategoriaResumen categoria,
        @Schema(example = "13990") Integer precio,
        @Schema(example = "20") Integer descuento,
        @Schema(description = "Precio con el descuento aplicado", example = "11192") Integer precioFinal,
        @Schema(example = "true") boolean enOferta,
        @Schema(example = "10") Integer stock,
        @Schema(example = "3") Integer stockCritico,
        @Schema(description = "true si el stock está en o bajo el nivel crítico", example = "false") boolean alertaStock,
        String descripcion,
        String imagen) {

    @Schema(description = "Categoría resumida")
    public record CategoriaResumen(@Schema(example = "terror") String id, @Schema(example = "Terror") String nombre) {
    }

    public static ProductoV2DTO desde(Producto p) {
        return new ProductoV2DTO(p.getCodigo(), p.getNombre(),
                new CategoriaResumen(p.getCategoria().getId(), p.getCategoria().getNombre()),
                p.getPrecio(), p.getDescuento(), p.precioFinal(), p.getDescuento() != null && p.getDescuento() > 0,
                p.getStock(), p.getStockCritico(), p.stockCritico(), p.getDescripcion(), p.getImagen());
    }
}
