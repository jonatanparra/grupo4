package cl.duoc.glitchstore.security;

import cl.duoc.glitchstore.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Genera y verifica los JWT (firmados con HMAC-SHA256).
 * - Token de acceso: dura pocos minutos y se envía en cada petición.
 * - Token de renovación (refresh): dura días y solo sirve en /api/v1/auth/refresh
 *   para obtener un nuevo par de tokens sin volver a pedir la contraseña.
 * El claim "tipo" impide usar un refresh como token de acceso y viceversa.
 */
@Service
public class JwtService {

    public static final String ACCESO = "acceso";
    public static final String RENOVACION = "renovacion";
    private static final String EMISOR = "glitch-store-api";

    private final SecretKey clave;
    private final Duration duracionAcceso;
    private final Duration duracionRenovacion;

    public JwtService(@Value("${app.jwt.secret}") String secreto,
                      @Value("${app.jwt.access-minutos}") long minutosAcceso,
                      @Value("${app.jwt.refresh-dias}") long diasRenovacion) {
        byte[] bytes = Decoders.BASE64.decode(secreto);
        if (bytes.length < 32) throw new IllegalStateException("app.jwt.secret debe tener al menos 256 bits (32 bytes en Base64).");
        this.clave = Keys.hmacShaKeyFor(bytes);
        this.duracionAcceso = Duration.ofMinutes(minutosAcceso);
        this.duracionRenovacion = Duration.ofDays(diasRenovacion);
    }

    public String generarAcceso(Usuario u) {
        return generar(u, ACCESO, duracionAcceso);
    }

    public String generarRenovacion(Usuario u) {
        return generar(u, RENOVACION, duracionRenovacion);
    }

    public long segundosAcceso() {
        return duracionAcceso.toSeconds();
    }

    /**
     * Verifica firma, emisor, vencimiento y tipo del token.
     * @throws JwtException si el token es inválido, está vencido o es de otro tipo
     */
    public Claims validar(String token, String tipoEsperado) {
        Claims claims = Jwts.parser()
                .verifyWith(clave)
                .requireIssuer(EMISOR)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        if (!tipoEsperado.equals(claims.get("tipo", String.class))) {
            throw new JwtException("El token no es de tipo " + tipoEsperado + ".");
        }
        return claims;
    }

    private String generar(Usuario u, String tipo, Duration duracion) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer(EMISOR)
                .subject(u.getRun())
                .claim("correo", u.getCorreo())
                .claim("rol", u.getRol().name())
                .claim("tipo", tipo)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plus(duracion)))
                .signWith(clave)
                .compact();
    }
}
