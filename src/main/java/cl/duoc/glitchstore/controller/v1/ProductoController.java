package cl.duoc.glitchstore.controller.v1;

import cl.duoc.glitchstore.dto.ErrorDTO;
import cl.duoc.glitchstore.dto.ProductoDTO;
import cl.duoc.glitchstore.dto.ProductoRequest;
import cl.duoc.glitchstore.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/productos")
@Tag(name = "Productos v1", description = "Catálogo de productos (datos básicos) y su CRUD")
public class ProductoController {

    private final ProductoService productos;

    public ProductoController(ProductoService productos) {
        this.productos = productos;
    }

    @GetMapping
    @Operation(summary = "Listar productos", description = "Público. Filtros opcionales por categoría, ofertas y texto.")
    @ApiResponse(responseCode = "200", description = "Lista de productos")
    public List<ProductoDTO> listar(
            @Parameter(description = "Id o nombre de la categoría", example = "Terror") @RequestParam(required = false) String categoria,
            @Parameter(description = "true = solo productos con descuento") @RequestParam(defaultValue = "false") boolean ofertas,
            @Parameter(description = "Busca por nombre o código", example = "resident") @RequestParam(required = false) String q) {
        return productos.listar(categoria, ofertas, q).stream().map(ProductoDTO::desde).toList();
    }

    @GetMapping("/stock-critico")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Productos con stock crítico", description = "Administrador o Vendedor.")
    @ApiResponse(responseCode = "200", description = "Productos con stock en o bajo su nivel crítico")
    @ApiResponse(responseCode = "403", description = "Rol sin permiso", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public List<ProductoDTO> stockCritico() {
        return productos.stockCritico().stream().map(ProductoDTO::desde).toList();
    }

    @GetMapping("/{codigo}")
    @Operation(summary = "Obtener un producto", description = "Público.")
    @ApiResponse(responseCode = "200", description = "Producto encontrado")
    @ApiResponse(responseCode = "404", description = "No existe", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public ProductoDTO obtener(@PathVariable String codigo) {
        return ProductoDTO.desde(productos.obtener(codigo));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Crear producto", description = "Solo Administrador.")
    @ApiResponse(responseCode = "201", description = "Producto creado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    @ApiResponse(responseCode = "409", description = "Código duplicado", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public ProductoDTO crear(@Valid @RequestBody ProductoRequest req) {
        return ProductoDTO.desde(productos.crear(req));
    }

    @PutMapping("/{codigo}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Actualizar producto", description = "Solo Administrador. El código no se modifica.")
    @ApiResponse(responseCode = "200", description = "Producto actualizado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    @ApiResponse(responseCode = "404", description = "No existe", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public ProductoDTO actualizar(@PathVariable String codigo, @Valid @RequestBody ProductoRequest req) {
        return ProductoDTO.desde(productos.actualizar(codigo, req));
    }

    @DeleteMapping("/{codigo}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Eliminar producto", description = "Solo Administrador. Las boletas antiguas conservan el nombre y precio cobrado.")
    @ApiResponse(responseCode = "204", description = "Producto eliminado")
    @ApiResponse(responseCode = "404", description = "No existe", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public void eliminar(@PathVariable String codigo) {
        productos.eliminar(codigo);
    }
}
