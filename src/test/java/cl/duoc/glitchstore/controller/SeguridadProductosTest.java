package cl.duoc.glitchstore.controller;

import cl.duoc.glitchstore.controller.v1.ProductoController;
import cl.duoc.glitchstore.model.Categoria;
import cl.duoc.glitchstore.model.Producto;
import cl.duoc.glitchstore.model.Rol;
import cl.duoc.glitchstore.model.Usuario;
import cl.duoc.glitchstore.security.ConfiguracionSeguridad;
import cl.duoc.glitchstore.security.FiltroJwt;
import cl.duoc.glitchstore.security.JwtService;
import cl.duoc.glitchstore.security.RespuestasSeguridad;
import cl.duoc.glitchstore.service.ProductoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Prueba las reglas de acceso de Spring Security con JWT reales sobre el controlador
 * de productos. El servicio es un mock: no se usa la base de datos.
 */
@WebMvcTest(ProductoController.class)
@Import({ConfiguracionSeguridad.class, FiltroJwt.class, JwtService.class, RespuestasSeguridad.class})
@TestPropertySource(properties = {
        "app.jwt.secret=dW5hLWNsYXZlLWRlLXBydWViYS1kZS1hbC1tZW5vcy0zMi1ieXRlcyEh",
        "app.jwt.access-minutos=15", "app.jwt.refresh-dias=7",
        "app.cors.origenes=http://localhost:5173"})
class SeguridadProductosTest {

    private static final String NUEVO = """
            {"codigo":"GS-100","nombre":"Hades","categoria":"Indie","precio":15990,"descuento":0,"stock":5}""";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JwtService jwt;
    @MockBean
    private ProductoService productos;

    private String token(Rol rol) {
        Usuario u = new Usuario();
        u.setRun("191102207");
        u.setCorreo("prueba@duoc.cl");
        u.setRol(rol);
        return "Bearer " + jwt.generarAcceso(u);
    }

    private static Producto producto() {
        Producto p = new Producto();
        p.setCodigo("GS-100");
        p.setNombre("Hades");
        p.setCategoria(new Categoria("indie", "Indie", null, null));
        p.setPrecio(15990);
        p.setDescuento(0);
        p.setStock(5);
        return p;
    }

    @Test
    void elCatalogoEsPublico() throws Exception {
        when(productos.listar(isNull(), anyBoolean(), isNull())).thenReturn(List.of(producto()));
        mvc.perform(get("/api/v1/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("GS-100"))
                .andExpect(jsonPath("$[0].categoria").value("Indie"));
    }

    @Test
    void crearSinTokenResponde401() throws Exception {
        mvc.perform(post("/api/v1/productos").contentType(MediaType.APPLICATION_JSON).content(NUEVO))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("Debes iniciar sesión."));
    }

    @Test
    void crearConTokenInvalidoResponde401() throws Exception {
        mvc.perform(post("/api/v1/productos").header("Authorization", "Bearer basura")
                        .contentType(MediaType.APPLICATION_JSON).content(NUEVO))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("Token inválido."));
    }

    @Test
    void elVendedorNoPuedeCrearProductos() throws Exception {
        mvc.perform(post("/api/v1/productos").header("Authorization", token(Rol.VENDEDOR))
                        .contentType(MediaType.APPLICATION_JSON).content(NUEVO))
                .andExpect(status().isForbidden());
    }

    @Test
    void elVendedorYElClienteNoVenElStockCritico() throws Exception {
        mvc.perform(get("/api/v1/productos/stock-critico").header("Authorization", token(Rol.VENDEDOR)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/productos/stock-critico").header("Authorization", token(Rol.CLIENTE)))
                .andExpect(status().isForbidden());
    }

    @Test
    void elAdministradorVeElStockCritico() throws Exception {
        when(productos.stockCritico()).thenReturn(List.of());
        mvc.perform(get("/api/v1/productos/stock-critico").header("Authorization", token(Rol.ADMINISTRADOR)))
                .andExpect(status().isOk());
    }

    @Test
    void elAdministradorCreaProductos() throws Exception {
        when(productos.crear(any())).thenReturn(producto());
        mvc.perform(post("/api/v1/productos").header("Authorization", token(Rol.ADMINISTRADOR))
                        .contentType(MediaType.APPLICATION_JSON).content(NUEVO))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigo").value("GS-100"));
    }

    @Test
    void datosInvalidosResponden400ConElDetalleDeCampos() throws Exception {
        mvc.perform(post("/api/v1/productos").header("Authorization", token(Rol.ADMINISTRADOR))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"codigo\":\"GS-1\",\"nombre\":\"\",\"categoria\":\"Indie\",\"precio\":-5,\"stock\":1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.precio").value("El precio no puede ser negativo."))
                .andExpect(jsonPath("$.campos.nombre").exists());
    }
}
