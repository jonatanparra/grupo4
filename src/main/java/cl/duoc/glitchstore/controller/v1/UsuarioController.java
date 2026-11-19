package cl.duoc.glitchstore.controller.v1;

import cl.duoc.glitchstore.dto.ErrorDTO;
import cl.duoc.glitchstore.dto.UsuarioDTO;
import cl.duoc.glitchstore.dto.UsuarioRequest;
import cl.duoc.glitchstore.security.UsuarioAutenticado;
import cl.duoc.glitchstore.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Usuarios", description = "Gestión de usuarios (solo Administrador)")
@ApiResponse(responseCode = "401", description = "Sin token o token vencido", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
@ApiResponse(responseCode = "403", description = "El rol no es Administrador", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
public class UsuarioController {

    private final UsuarioService usuarios;

    public UsuarioController(UsuarioService usuarios) {
        this.usuarios = usuarios;
    }

    @GetMapping
    @Operation(summary = "Listar usuarios")
    @ApiResponse(responseCode = "200", description = "Lista de usuarios (sin contraseñas)")
    public List<UsuarioDTO> listar() {
        return usuarios.listar().stream().map(UsuarioDTO::desde).toList();
    }

    @GetMapping("/{run}")
    @Operation(summary = "Obtener un usuario")
    @ApiResponse(responseCode = "200", description = "Usuario encontrado")
    @ApiResponse(responseCode = "404", description = "No existe", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public UsuarioDTO obtener(@PathVariable String run) {
        return UsuarioDTO.desde(usuarios.obtener(run));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear usuario", description = "Permite elegir el tipo (Administrador, Vendedor o Cliente). La contraseña se guarda con BCrypt.")
    @ApiResponse(responseCode = "201", description = "Usuario creado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    @ApiResponse(responseCode = "409", description = "RUN o correo duplicado", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public UsuarioDTO crear(@Valid @RequestBody UsuarioRequest req) {
        return UsuarioDTO.desde(usuarios.crear(req));
    }

    @PutMapping("/{run}")
    @Operation(summary = "Actualizar usuario", description = "El RUN no cambia. Si la contraseña viene vacía se mantiene la actual. Nadie puede cambiar su propio rol.")
    @ApiResponse(responseCode = "200", description = "Usuario actualizado")
    @ApiResponse(responseCode = "404", description = "No existe", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public UsuarioDTO actualizar(@PathVariable String run, @Valid @RequestBody UsuarioRequest req,
                                 @AuthenticationPrincipal UsuarioAutenticado sesion) {
        return UsuarioDTO.desde(usuarios.actualizar(run, req, sesion.run()));
    }

    @DeleteMapping("/{run}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar usuario", description = "No se puede eliminar la propia cuenta. Sus boletas se conservan.")
    @ApiResponse(responseCode = "204", description = "Usuario eliminado")
    @ApiResponse(responseCode = "404", description = "No existe", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public void eliminar(@PathVariable String run, @AuthenticationPrincipal UsuarioAutenticado sesion) {
        usuarios.eliminar(run, sesion.run());
    }
}
