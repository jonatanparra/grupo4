package cl.duoc.glitchstore.security;

import cl.duoc.glitchstore.model.Rol;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Lee el header "Authorization: Bearer <token>", verifica el JWT de acceso y,
 * si es válido, registra al usuario (RUN + rol) en el contexto de seguridad.
 * Un token inválido o vencido deja la petición sin autenticar: si el recurso
 * es privado, Spring Security responde 401.
 */
@Component
public class FiltroJwt extends OncePerRequestFilter {

    public static final String ATRIBUTO_ERROR = "jwt.error";

    private final JwtService jwt;

    public FiltroJwt(JwtService jwt) {
        this.jwt = jwt;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwt.validar(header.substring(7), JwtService.ACCESO);
                Rol rol = Rol.valueOf(claims.get("rol", String.class));
                UsuarioAutenticado principal = new UsuarioAutenticado(claims.getSubject(), claims.get("correo", String.class), rol);
                var auth = new UsernamePasswordAuthenticationToken(principal, null, List.of(new SimpleGrantedAuthority(rol.getAutoridad())));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException | IllegalArgumentException e) {
                // Se informa en la respuesta 401 (PuntoEntradaJwt)
                request.setAttribute(ATRIBUTO_ERROR, e instanceof io.jsonwebtoken.ExpiredJwtException
                        ? "La sesión expiró: renueva el token." : "Token inválido.");
            }
        }
        chain.doFilter(request, response);
    }
}
