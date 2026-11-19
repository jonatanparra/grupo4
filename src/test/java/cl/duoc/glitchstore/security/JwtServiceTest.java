package cl.duoc.glitchstore.security;

import cl.duoc.glitchstore.model.Rol;
import cl.duoc.glitchstore.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRETO = Base64.getEncoder().encodeToString("una-clave-de-prueba-de-al-menos-32-bytes!!".getBytes());

    private final JwtService jwt = new JwtService(SECRETO, 15, 7);

    private static Usuario usuario() {
        Usuario u = new Usuario();
        u.setRun("178456326");
        u.setCorreo("matias.fernandez@gmail.com");
        u.setRol(Rol.VENDEDOR);
        return u;
    }

    @Test
    void elTokenDeAccesoLlevaRunCorreoYRol() {
        Claims claims = jwt.validar(jwt.generarAcceso(usuario()), JwtService.ACCESO);
        assertThat(claims.getSubject()).isEqualTo("178456326");
        assertThat(claims.get("correo", String.class)).isEqualTo("matias.fernandez@gmail.com");
        assertThat(claims.get("rol", String.class)).isEqualTo("VENDEDOR");
        assertThat(jwt.segundosAcceso()).isEqualTo(900);
    }

    @Test
    void noSePuedeUsarUnTokenComoSiFueraDelOtroTipo() {
        assertThatThrownBy(() -> jwt.validar(jwt.generarRenovacion(usuario()), JwtService.ACCESO)).isInstanceOf(JwtException.class);
        assertThatThrownBy(() -> jwt.validar(jwt.generarAcceso(usuario()), JwtService.RENOVACION)).isInstanceOf(JwtException.class);
    }

    @Test
    void rechazaTokenAlterado() {
        String token = jwt.generarAcceso(usuario());
        String alterado = token.substring(0, token.length() - 4) + "AAAA";
        assertThatThrownBy(() -> jwt.validar(alterado, JwtService.ACCESO)).isInstanceOf(JwtException.class);
    }

    @Test
    void rechazaTokenFirmadoConOtraClave() {
        JwtService otro = new JwtService(Base64.getEncoder().encodeToString("otra-clave-distinta-tambien-de-32-bytes!!".getBytes()), 15, 7);
        assertThatThrownBy(() -> jwt.validar(otro.generarAcceso(usuario()), JwtService.ACCESO)).isInstanceOf(JwtException.class);
    }

    @Test
    void rechazaTokenVencido() {
        JwtService vencido = new JwtService(SECRETO, -1, 7);
        assertThatThrownBy(() -> jwt.validar(vencido.generarAcceso(usuario()), JwtService.ACCESO)).isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    void exigeUnSecretoDeAlMenos256Bits() {
        assertThatThrownBy(() -> new JwtService(Base64.getEncoder().encodeToString("corta".getBytes()), 15, 7))
                .isInstanceOf(IllegalStateException.class);
    }
}
