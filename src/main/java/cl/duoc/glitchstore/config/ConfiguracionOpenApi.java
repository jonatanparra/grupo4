package cl.duoc.glitchstore.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Documentación Swagger: http://localhost:8080/swagger-ui.html
 * El botón "Authorize" acepta el accessToken del login para probar los endpoints privados.
 */
@Configuration
public class ConfiguracionOpenApi {

    @Bean
    public OpenAPI glitchStoreOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Glitch Store API")
                        .version("1.0.0")
                        .description("""
                                API REST de la tienda de videojuegos Glitch Store (DSY1104 - Evaluación Parcial 3).

                                **Cómo probar endpoints privados:** ejecuta `POST /api/v1/auth/login`, copia el `accessToken` \
                                y pégalo en **Authorize**.

                                Usuarios de prueba: `camila.rojas@duoc.cl / admin123` (Administrador), \
                                `matias.fernandez@gmail.com / vende123` (Vendedor), \
                                `javiera.contreras@profesor.duoc.cl / cliente1` (Cliente).""")
                        .contact(new Contact().name("Grupo 4 - Duoc UC")))
                .servers(List.of(new Server().url("http://localhost:8080").description("Local")))
                .components(new Components().addSecuritySchemes("bearerAuth", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Token de acceso obtenido en /api/v1/auth/login")));
    }
}
