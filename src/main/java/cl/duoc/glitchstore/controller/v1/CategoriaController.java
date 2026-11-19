package cl.duoc.glitchstore.controller.v1;

import cl.duoc.glitchstore.dto.CategoriaDTO;
import cl.duoc.glitchstore.dto.CategoriaRequest;
import cl.duoc.glitchstore.dto.ErrorDTO;
import cl.duoc.glitchstore.service.CategoriaService;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categorias")
@Tag(name = "Categorías", description = "Categorías de productos y su CRUD")
public class CategoriaController {

    private final CategoriaService categorias;

    public CategoriaController(CategoriaService categorias) {
        this.categorias = categorias;
    }

    @GetMapping
    @Operation(summary = "Listar categorías", description = "Público. Incluye la cantidad de productos de cada una.")
    @ApiResponse(responseCode = "200", description = "Lista de categorías")
    public List<CategoriaDTO> listar() {
        return categorias.listar();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una categoría", description = "Público.")
    @ApiResponse(responseCode = "200", description = "Categoría encontrada")
    @ApiResponse(responseCode = "404", description = "No existe", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public CategoriaDTO obtener(@PathVariable String id) {
        return categorias.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Crear categoría", description = "Solo Administrador.")
    @ApiResponse(responseCode = "201", description = "Categoría creada")
    @ApiResponse(responseCode = "409", description = "Id o nombre duplicado", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public CategoriaDTO crear(@Valid @RequestBody CategoriaRequest req) {
        return categorias.crear(req);
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Actualizar categoría", description = "Solo Administrador. El id no se modifica.")
    @ApiResponse(responseCode = "200", description = "Categoría actualizada")
    @ApiResponse(responseCode = "404", description = "No existe", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public CategoriaDTO actualizar(@PathVariable String id, @Valid @RequestBody CategoriaRequest req) {
        return categorias.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Eliminar categoría", description = "Solo Administrador. No se puede eliminar si tiene productos.")
    @ApiResponse(responseCode = "204", description = "Categoría eliminada")
    @ApiResponse(responseCode = "409", description = "Tiene productos asociados", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public void eliminar(@PathVariable String id) {
        categorias.eliminar(id);
    }
}
