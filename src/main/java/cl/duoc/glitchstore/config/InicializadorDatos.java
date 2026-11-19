package cl.duoc.glitchstore.config;

import cl.duoc.glitchstore.model.Boleta;
import cl.duoc.glitchstore.model.Categoria;
import cl.duoc.glitchstore.model.DetalleBoleta;
import cl.duoc.glitchstore.model.Producto;
import cl.duoc.glitchstore.model.Rol;
import cl.duoc.glitchstore.model.Usuario;
import cl.duoc.glitchstore.repository.BoletaRepository;
import cl.duoc.glitchstore.repository.CategoriaRepository;
import cl.duoc.glitchstore.repository.ProductoRepository;
import cl.duoc.glitchstore.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

/**
 * Carga los datos de ejemplo (los mismos de la EV2: src/data/datos.js) si la base
 * de datos está vacía. Las contraseñas se guardan cifradas con BCrypt.
 * Las tablas las crea EsquemaBaseDatos antes de que arranque JPA.
 */
@Component
public class InicializadorDatos {

    private static final Logger log = LoggerFactory.getLogger(InicializadorDatos.class);

    private final CategoriaRepository categorias;
    private final ProductoRepository productos;
    private final UsuarioRepository usuarios;
    private final BoletaRepository boletas;
    private final PasswordEncoder encoder;
    private final ObjectMapper mapper;

    public InicializadorDatos(CategoriaRepository categorias, ProductoRepository productos, UsuarioRepository usuarios,
                              BoletaRepository boletas, PasswordEncoder encoder, ObjectMapper mapper) {
        this.categorias = categorias;
        this.productos = productos;
        this.usuarios = usuarios;
        this.boletas = boletas;
        this.encoder = encoder;
        this.mapper = mapper;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void cargar() throws IOException {
        if (categorias.count() > 0) {
            log.info("La base de datos ya tiene datos: no se cargan los datos de ejemplo.");
            return;
        }
        JsonNode datos;
        try (InputStream in = new ClassPathResource("database/datos-iniciales.json").getInputStream()) {
            datos = mapper.readTree(in);
        }

        for (JsonNode c : datos.get("categorias")) {
            categorias.save(new Categoria(c.get("id").asText(), c.get("nombre").asText(), texto(c, "descripcion"), texto(c, "imagen")));
        }
        for (JsonNode p : datos.get("productos")) {
            Producto prod = new Producto();
            prod.setCodigo(p.get("codigo").asText());
            prod.setNombre(p.get("nombre").asText());
            prod.setCategoria(categorias.findByNombreIgnoreCase(p.get("categoria").asText()).orElseThrow());
            prod.setPrecio(p.get("precio").asInt());
            prod.setDescuento(p.path("descuento").asInt(0));
            prod.setStock(p.get("stock").asInt());
            prod.setStockCritico(p.hasNonNull("stockCritico") ? p.get("stockCritico").asInt() : null);
            prod.setDescripcion(texto(p, "descripcion"));
            prod.setImagen(texto(p, "imagen"));
            productos.save(prod);
        }
        for (JsonNode u : datos.get("usuarios")) {
            Usuario usr = new Usuario();
            usr.setRun(u.get("run").asText());
            usr.setNombre(u.get("nombre").asText());
            usr.setApellidos(u.get("apellidos").asText());
            usr.setCorreo(u.get("correo").asText().toLowerCase());
            usr.setContrasena(encoder.encode(u.get("contrasena").asText()));
            usr.setRol(Rol.desde(u.get("tipo").asText()));
            usr.setFechaNacimiento(u.hasNonNull("fechaNacimiento") ? LocalDate.parse(u.get("fechaNacimiento").asText()) : null);
            usr.setRegion(texto(u, "region"));
            usr.setComuna(texto(u, "comuna"));
            usr.setDireccion(texto(u, "direccion"));
            usuarios.save(usr);
        }
        for (JsonNode o : datos.get("ordenes")) {
            boletas.save(boletaEjemplo(o));
        }
        log.info("Datos de ejemplo cargados: {} categorías, {} productos, {} usuarios, {} boletas.",
                categorias.count(), productos.count(), usuarios.count(), boletas.count());
    }

    /** Boletas de ejemplo: toman su número de la secuencia (ORD-1001, ORD-1002). */
    private Boleta boletaEjemplo(JsonNode o) {
        Boleta b = new Boleta();
        b.setId("ORD-" + boletas.siguienteNumero());
        b.setFecha(LocalDateTime.ofInstant(Instant.parse(o.get("fecha").asText()), ZoneOffset.UTC));
        b.setEstado(o.get("estado").asText());
        JsonNode cliente = o.get("cliente");
        b.setClienteNombre(cliente.get("nombre").asText());
        b.setClienteApellidos(cliente.get("apellidos").asText());
        b.setClienteCorreo(cliente.get("correo").asText());
        usuarios.findByCorreoIgnoreCase(b.getClienteCorreo()).ifPresent(b::setUsuario);
        JsonNode envio = o.get("envio");
        b.setTipoEnvio(envio.get("tipo").asText());
        b.setCalle(texto(envio, "calle"));
        b.setDepartamento(texto(envio, "departamento"));
        b.setRegion(texto(envio, "region"));
        b.setComuna(texto(envio, "comuna"));
        b.setIndicaciones(texto(envio, "indicaciones"));
        b.setMetodoPago("debito");
        b.setSubtotal(o.get("subtotal").asLong());
        b.setDescuentoCupon(o.get("descuentoCupon").asLong());
        b.setCostoEnvio(o.get("costoEnvio").asLong());
        b.setTotal(o.get("total").asLong());
        if ("Rechazado".equals(b.getEstado())) b.setMotivoRechazo("El medio de pago fue rechazado por el banco emisor.");
        for (JsonNode i : o.get("items")) {
            Producto p = productos.findById(i.get("codigo").asText()).orElse(null);
            b.agregarDetalle(new DetalleBoleta(p, i.get("nombre").asText(), i.get("precioUnitario").asInt(), i.get("cantidad").asInt()));
        }
        return b;
    }

    private static String texto(JsonNode nodo, String campo) {
        JsonNode valor = nodo.get(campo);
        return valor == null || valor.isNull() || valor.asText().isEmpty() ? null : valor.asText();
    }
}
