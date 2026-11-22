package cl.duoc.glitchstore.controller.v2;

import cl.duoc.glitchstore.dto.ErrorDTO;
import cl.duoc.glitchstore.dto.ProductoV2DTO;
import cl.duoc.glitchstore.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Versión 2 del catálogo: misma fuente de datos que v1, pero la respuesta incluye la
 * categoría completa y campos calculados (precio final, oferta, alerta de stock).
 * La v1 se mantiene sin cambios para no romper a los clientes que ya la usan.
 */
@RestController
@RequestMapping("/api/v2/productos")
@Tag(name = "Productos v2", description = "Catálogo con categoría completa y datos calculados")
public class ProductoV2Controller {

    private final ProductoService productos;

    public ProductoV2Controller(ProductoService productos) {
        this.productos = productos;
    }

    @GetMapping
    @Operation(summary = "Listar productos (v2)", description = "Público. Incluye precioFinal, enOferta y alertaStock.")
    @ApiResponse(responseCode = "200", description = "Lista de productos")
    public List<ProductoV2DTO> listar(
            @Parameter(description = "Id o nombre de la categoría") @RequestParam(required = false) String categoria,
            @Parameter(description = "true = solo productos con descuento") @RequestParam(defaultValue = "false") boolean ofertas,
            @Parameter(description = "Busca por nombre o código") @RequestParam(required = false) String q) {
        return productos.listar(categoria, ofertas, q).stream().map(ProductoV2DTO::desde).toList();
    }

    @GetMapping("/{codigo}")
    @Operation(summary = "Obtener un producto (v2)", description = "Público.")
    @ApiResponse(responseCode = "200", description = "Producto encontrado")
    @ApiResponse(responseCode = "404", description = "No existe", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public ProductoV2DTO obtener(@PathVariable String codigo) {
        return ProductoV2DTO.desde(productos.obtener(codigo));
    }
}
