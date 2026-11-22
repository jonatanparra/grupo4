package cl.duoc.glitchstore.service;

import cl.duoc.glitchstore.dto.BoletaDTO;
import cl.duoc.glitchstore.dto.CompraRequest;
import cl.duoc.glitchstore.exception.ReglaNegocioException;
import cl.duoc.glitchstore.model.Boleta;
import cl.duoc.glitchstore.model.Categoria;
import cl.duoc.glitchstore.model.Producto;
import cl.duoc.glitchstore.repository.BoletaRepository;
import cl.duoc.glitchstore.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Prueba la lógica de compra con repositorios simulados (mocks), sin base de datos. */
@ExtendWith(MockitoExtension.class)
class BoletaServiceTest {

    @Mock
    private BoletaRepository boletas;
    @Mock
    private ProductoRepository productos;

    private BoletaService servicio;
    private Producto outlast;

    @BeforeEach
    void preparar() {
        servicio = new BoletaService(boletas, productos, new CalculadoraCompra());
        outlast = new Producto();
        outlast.setCodigo("GS-004");
        outlast.setNombre("Outlast");
        outlast.setCategoria(new Categoria("terror", "Terror", null, null));
        outlast.setPrecio(13990);
        outlast.setDescuento(20);
        outlast.setStock(3);
    }

    private static CompraRequest compra(int cantidad, String cupon, String tipoEnvio, boolean rechazo) {
        return new CompraRequest(
                new CompraRequest.Cliente("Ana", "Soto", "ana@gmail.com"),
                new CompraRequest.Envio(tipoEnvio, "Calle 1", "", "metropolitana", "santiago", ""),
                "debito", List.of(new CompraRequest.Item("gs-004", cantidad)), cupon, rechazo);
    }

    private void prepararRepositorios() {
        when(productos.findById("GS-004")).thenReturn(Optional.of(outlast));
        when(boletas.siguienteNumero()).thenReturn(1003L);
        when(boletas.save(any(Boleta.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void compraPagadaUsaElPrecioConOfertaYDescuentaStock() {
        prepararRepositorios();
        BoletaDTO b = servicio.comprar(compra(2, "glitch10", "domicilio", false), null);

        assertThat(b.id()).isEqualTo("ORD-1003");
        assertThat(b.estado()).isEqualTo("Pagado");
        assertThat(b.items().get(0).precioUnitario()).isEqualTo(11192); // 13.990 - 20%
        assertThat(b.subtotal()).isEqualTo(22384);
        assertThat(b.descuentoCupon()).isEqualTo(2238);
        assertThat(b.costoEnvio()).isEqualTo(3990);
        assertThat(b.total()).isEqualTo(22384 - 2238 + 3990);
        assertThat(outlast.getStock()).isEqualTo(1);
    }

    @Test
    void sinStockLaBoletaQuedaRechazadaYNoTocaElStock() {
        prepararRepositorios();
        BoletaDTO b = servicio.comprar(compra(5, null, "retiro", false), null);

        assertThat(b.estado()).isEqualTo("Rechazado");
        assertThat(b.motivoRechazo()).contains("Outlast");
        assertThat(outlast.getStock()).isEqualTo(3);
    }

    @Test
    void pagoRechazadoSimuladoNoDescuentaStock() {
        prepararRepositorios();
        BoletaDTO b = servicio.comprar(compra(1, null, "retiro", true), null);

        assertThat(b.estado()).isEqualTo("Rechazado");
        assertThat(b.motivoRechazo()).contains("rechazado");
        assertThat(outlast.getStock()).isEqualTo(3);
    }

    @Test
    void cuponInexistenteSeRechazaAntesDeGuardar() {
        assertThatThrownBy(() -> servicio.comprar(compra(1, "REGALO", "retiro", false), null))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("REGALO");
        verify(boletas, never()).save(any());
    }

    @Test
    void despachoADomicilioExigeDireccion() {
        CompraRequest sinCalle = new CompraRequest(
                new CompraRequest.Cliente("Ana", "Soto", "ana@gmail.com"),
                new CompraRequest.Envio("domicilio", "", "", "", "", ""),
                "debito", List.of(new CompraRequest.Item("GS-004", 1)), null, false);
        assertThatThrownBy(() -> servicio.comprar(sinCalle, null)).isInstanceOf(ReglaNegocioException.class);
    }
}
