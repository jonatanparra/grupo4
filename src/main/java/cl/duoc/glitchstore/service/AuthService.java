package cl.duoc.glitchstore.service;

import cl.duoc.glitchstore.dto.AuthResponse;
import cl.duoc.glitchstore.dto.LoginRequest;
import cl.duoc.glitchstore.dto.RegistroRequest;
import cl.duoc.glitchstore.dto.UsuarioDTO;
import cl.duoc.glitchstore.model.Usuario;
import cl.duoc.glitchstore.repository.UsuarioRepository;
import cl.duoc.glitchstore.security.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String CREDENCIALES_INVALIDAS = "Correo o contraseña incorrectos.";

    private final UsuarioRepository usuarios;
    private final UsuarioService usuarioService;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UsuarioRepository usuarios, UsuarioService usuarioService, PasswordEncoder encoder, JwtService jwt) {
        this.usuarios = usuarios;
        this.usuarioService = usuarioService;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    /** Verifica correo + contraseña (BCrypt) y entrega el par de tokens. */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        Usuario u = usuarios.findByCorreoIgnoreCase(req.correo().trim())
                .filter(encontrado -> encoder.matches(req.contrasena(), encontrado.getContrasena()))
                .orElseThrow(() -> new BadCredentialsException(CREDENCIALES_INVALIDAS));
        return tokens(u);
    }

    /** Crea la cuenta de Cliente y deja la sesión iniciada. */
    @Transactional
    public AuthResponse registrar(RegistroRequest req) {
        return tokens(usuarioService.registrar(req));
    }

    /**
     * Cambia un refresh token válido por un par nuevo (rotación). Vuelve a leer al
     * usuario en la BD: si fue eliminado o cambió su rol, el nuevo token lo refleja.
     */
    @Transactional(readOnly = true)
    public AuthResponse renovar(String refreshToken) {
        try {
            Claims claims = jwt.validar(refreshToken, JwtService.RENOVACION);
            Usuario u = usuarios.findById(claims.getSubject())
                    .orElseThrow(() -> new BadCredentialsException("La cuenta ya no existe."));
            return tokens(u);
        } catch (JwtException | IllegalArgumentException e) {
            throw new BadCredentialsException("El token de renovación es inválido o expiró. Inicia sesión nuevamente.");
        }
    }

    @Transactional(readOnly = true)
    public UsuarioDTO perfil(String run) {
        return UsuarioDTO.desde(usuarioService.obtener(run));
    }

    private AuthResponse tokens(Usuario u) {
        return new AuthResponse(jwt.generarAcceso(u), jwt.generarRenovacion(u), "Bearer", jwt.segundosAcceso(), UsuarioDTO.desde(u));
    }
}
