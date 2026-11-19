package cl.duoc.glitchstore.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CalculadoraCompraTest {

    private final CalculadoraCompra calc = new CalculadoraCompra();

    @Test
    void cuponesValidosSinImportarMayusculasNiEspacios() {
        assertThat(calc.porcentajeCupon(" glitch10 ")).isEqualTo(10);
        assertThat(calc.porcentajeCupon("DUOC15")).isEqualTo(15);
        assertThat(calc.porcentajeCupon("FALSO")).isZero();
        assertThat(calc.porcentajeCupon(null)).isZero();
    }

    @Test
    void envioDomicilioCuesta3990yEsGratisDesde50000() {
        assertThat(calc.costoEnvio("domicilio", 49_999)).isEqualTo(3990);
        assertThat(calc.costoEnvio("domicilio", 50_000)).isZero();
        assertThat(calc.costoEnvio("retiro", 10_000)).isZero();
    }

    @Test
    void calculaTotalesConCuponYEnvio() {
        CalculadoraCompra.Totales t = calc.calcular(39_980, "GLITCH10", "domicilio");
        assertThat(t.descuentoCupon()).isEqualTo(3998);
        assertThat(t.costoEnvio()).isEqualTo(3990);
        assertThat(t.total()).isEqualTo(39_980 - 3998 + 3990);
    }

    @Test
    void elEnvioGratisSeEvaluaDespuesDelDescuento() {
        // 52.000 - 15% = 44.200 → ya no alcanza el envío gratis
        CalculadoraCompra.Totales t = calc.calcular(52_000, "DUOC15", "domicilio");
        assertThat(t.costoEnvio()).isEqualTo(3990);
    }

    @Test
    void carritoVacioNoCobraEnvio() {
        assertThat(calc.calcular(0, null, "domicilio").total()).isZero();
    }
}
