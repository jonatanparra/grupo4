package cl.duoc.glitchstore.controller.v1;

import cl.duoc.glitchstore.dto.AuthResponse;
import cl.duoc.glitchstore.dto.ErrorDTO;
import cl.duoc.glitchstore.dto.LoginRequest;
import cl.duoc.glitchstore.dto.RefreshRequest;
import cl.duoc.glitchstore.dto.RegistroRequest;
import cl.duoc.glitchstore.dto.UsuarioDTO;
import cl.duoc.glitchstore.security.UsuarioAutenticado;
import cl.duoc.glitchstore.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticación", description = "Login, registro y renovación de tokens JWT")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Valida correo y contraseña y entrega un token de acceso (15 min) y uno de renovación (7 días).")
    @ApiResponse(responseCode = "200", description = "Sesión iniciada")
    @ApiResponse(responseCode = "401", description = "Credenciales incorrectas", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return auth.login(req);
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar cliente", description = "Crea una cuenta de tipo Cliente y deja la sesión iniciada.")
    @ApiResponse(responseCode = "201", description = "Cuenta creada")
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    @ApiResponse(responseCode = "409", description = "RUN o correo ya registrado", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public AuthResponse registro(@Valid @RequestBody RegistroRequest req) {
        return auth.registrar(req);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar tokens", description = "Cambia un token de renovación válido por un par nuevo de tokens.")
    @ApiResponse(responseCode = "200", description = "Tokens renovados")
    @ApiResponse(responseCode = "401", description = "Token de renovación inválido o vencido", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest req) {
        return auth.renovar(req.refreshToken());
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Usuario de la sesión", description = "Devuelve los datos actualizados del usuario dueño del token. El frontend lo usa al recargar la página.")
    @ApiResponse(responseCode = "200", description = "Datos del usuario")
    @ApiResponse(responseCode = "401", description = "Sin token o token vencido", content = @Content(schema = @Schema(implementation = ErrorDTO.class)))
    public UsuarioDTO me(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return auth.perfil(usuario.run());
    }
}
