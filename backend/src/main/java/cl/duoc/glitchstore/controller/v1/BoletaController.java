package cl.duoc.glitchstore.controller.v1;

import cl.duoc.glitchstore.dto.BoletaDTO;
import cl.duoc.glitchstore.dto.CompraRequest;
import cl.duoc.glitchstore.dto.ErrorDTO;
import cl.duoc.glitchstore.dto.EstadoBoletaRequest;
import cl.duoc.glitchstore.model.Usuario;
import cl.duoc.glitchstore.security.UsuarioAutenticado;
import cl.duoc.glitchstore.service.BoletaService;
import cl.duoc.glitchstore.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
@RequestMapping("/api/v1/boletas")
@Tag(name = "Boletas", description = "Compras (checkout) y gestión de órdenes")
public class BoletaController {

    private final BoletaService boletas;
    private final UsuarioService usuarios;

    public BoletaController(BoletaService boletas, UsuarioService usuarios) {
        this.boletas = boletas;
        this.usuarios = usuarios;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Comprar (checkout)",
            description = "Público: invitado o usuario con sesión (si envía su token, la boleta queda asociada a su cuenta). "
                    + "El backend calcula precios, cupón y envío. Sin stock o con pago rechazado la boleta queda \"Rechazado\" y no descuenta stock.")
    @ApiResponse(responseCode = "201", description = "Boleta creada (Pagado o Rechazado)")
    @ApiResponse(responseCode = "400", description = "Datos inválidos, cupón inexistente o producto eliminado",
            content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public BoletaDTO comprar(@Valid @RequestBody CompraRequest req, @AuthenticationPrincipal UsuarioAutenticado sesion) {
        Usuario comprador = sesion != null ? usuarios.obtener(sesion.run()) : null;
        return boletas.comprar(req, comprador);
    }

    @GetMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Listar boletas", description = "Administrador o Vendedor. Filtro opcional por estado.")
    @ApiResponse(responseCode = "200", description = "Boletas de la más reciente a la más antigua")
    @ApiResponse(responseCode = "403", description = "Rol sin permiso", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public List<BoletaDTO> listar(@Parameter(description = "Pagado, Rechazado, Enviado, Entregado o Anulado") @RequestParam(required = false) String estado) {
        return boletas.listar(estado);
    }

    @GetMapping("/mias")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mis compras", description = "Cualquier usuario con sesión: sus boletas (por RUN o por correo).")
    @ApiResponse(responseCode = "200", description = "Boletas del usuario")
    public List<BoletaDTO> mias(@AuthenticationPrincipal UsuarioAutenticado sesion) {
        return boletas.delUsuario(usuarios.obtener(sesion.run()));
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Detalle de una boleta", description = "Administrador y Vendedor ven cualquiera; un Cliente solo las suyas.")
    @ApiResponse(responseCode = "200", description = "Boleta encontrada")
    @ApiResponse(responseCode = "403", description = "La boleta es de otro cliente", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    @ApiResponse(responseCode = "404", description = "No existe", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public BoletaDTO obtener(@PathVariable String id, @AuthenticationPrincipal UsuarioAutenticado sesion) {
        return boletas.obtener(id, usuarios.obtener(sesion.run()));
    }

    @PutMapping("/{id}/estado")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cambiar estado", description = "Solo Administrador. Anular devuelve el stock.")
    @ApiResponse(responseCode = "200", description = "Estado actualizado")
    @ApiResponse(responseCode = "400", description = "Cambio de estado no permitido", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public BoletaDTO cambiarEstado(@PathVariable String id, @Valid @RequestBody EstadoBoletaRequest req) {
        return boletas.cambiarEstado(id, req.estado());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Eliminar boleta", description = "Solo Administrador. Elimina también sus líneas de detalle.")
    @ApiResponse(responseCode = "204", description = "Boleta eliminada")
    @ApiResponse(responseCode = "404", description = "No existe", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public void eliminar(@PathVariable String id) {
        boletas.eliminar(id);
    }
}
