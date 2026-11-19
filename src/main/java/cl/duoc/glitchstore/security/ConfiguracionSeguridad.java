package cl.duoc.glitchstore.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Reglas de acceso por rol (Anexo 1):
 * - Público: catálogo (productos y categorías), login, registro, renovar token y comprar.
 * - Vendedor: además puede ver la lista y el detalle de órdenes (solo lectura); los productos
 *   los lee desde el catálogo público.
 * - Administrador: acceso total (CRUD de productos, categorías, usuarios y boletas).
 * La API es stateless: no hay sesión en el servidor, cada petición trae su JWT.
 */
@Configuration
@EnableMethodSecurity
public class ConfiguracionSeguridad {

    private static final String ADMIN = "ADMINISTRADOR";
    private static final String VENDEDOR = "VENDEDOR";

    @Bean
    public SecurityFilterChain cadenaSeguridad(HttpSecurity http, FiltroJwt filtroJwt, RespuestasSeguridad respuestas) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // sin cookies de sesión: el token va en el header, no aplica CSRF
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e.authenticationEntryPoint(respuestas.noAutenticado()).accessDeniedHandler(respuestas.sinPermiso()))
                .authorizeHttpRequests(auth -> auth
                        // Documentación
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // Autenticación
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/registro", "/api/v1/auth/refresh").permitAll()
                        // Stock crítico (solo Administrador): antes del catálogo público, porque "/productos/{codigo}" también lo captura
                        .requestMatchers(HttpMethod.GET, "/api/v1/productos/stock-critico").hasRole(ADMIN)
                        // Catálogo público
                        .requestMatchers(HttpMethod.GET, "/api/v1/productos", "/api/v1/productos/{codigo}",
                                "/api/v2/productos", "/api/v2/productos/{codigo}",
                                "/api/v1/categorias", "/api/v1/categorias/**").permitAll()
                        // Compra: invitado o usuario con sesión
                        .requestMatchers(HttpMethod.POST, "/api/v1/boletas").permitAll()
                        // Vendedor: solo lectura de órdenes
                        .requestMatchers(HttpMethod.GET, "/api/v1/boletas").hasAnyRole(ADMIN, VENDEDOR)
                        // Cliente: sus compras y el detalle de una boleta propia (se valida en el servicio)
                        .requestMatchers(HttpMethod.GET, "/api/v1/boletas/mias", "/api/v1/boletas/{id}", "/api/v1/auth/me").authenticated()
                        // Todo lo demás (crear/editar/eliminar, usuarios) es solo del Administrador
                        .requestMatchers("/api/**").hasRole(ADMIN)
                        .anyRequest().denyAll())
                .addFilterBefore(filtroJwt, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /** Evita que Spring Boot registre el filtro JWT una segunda vez fuera de la cadena de seguridad. */
    @Bean
    public FilterRegistrationBean<FiltroJwt> registroFiltroJwt(FiltroJwt filtro) {
        FilterRegistrationBean<FiltroJwt> registro = new FilterRegistrationBean<>(filtro);
        registro.setEnabled(false);
        return registro;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.origenes}") List<String> origenes) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origenes);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/api/**", config);
        return fuente;
    }
}
