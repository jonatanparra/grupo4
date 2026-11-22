package cl.duoc.glitchstore.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.orm.jpa.EntityManagerFactoryDependsOnPostProcessor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Crea las tablas ejecutando database/schema.sql la primera vez (si la tabla USUARIO
 * no existe en el esquema GLITCH_STORE). Se ejecuta antes que JPA, que luego solo
 * valida que las entidades coincidan con las tablas (ddl-auto=validate).
 */
@Component("esquemaBaseDatos")
public class EsquemaBaseDatos {

    private static final Logger log = LoggerFactory.getLogger(EsquemaBaseDatos.class);

    public EsquemaBaseDatos(DataSource dataSource) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        Integer tablas = jdbc.queryForObject("SELECT COUNT(*) FROM USER_TABLES WHERE TABLE_NAME = 'USUARIO'", Integer.class);
        if (tablas != null && tablas > 0) {
            log.info("Esquema existente en Oracle: no se ejecuta schema.sql.");
            return;
        }
        log.info("Creando tablas en Oracle con database/schema.sql...");
        new ResourceDatabasePopulator(new ClassPathResource("database/schema.sql")).execute(dataSource);
        log.info("Tablas creadas.");
    }

    /** Hace que JPA (EntityManagerFactory) espere a que exista el esquema. */
    @Component
    static class JpaDependeDelEsquema extends EntityManagerFactoryDependsOnPostProcessor {
        JpaDependeDelEsquema() {
            super("esquemaBaseDatos");
        }
    }
}
