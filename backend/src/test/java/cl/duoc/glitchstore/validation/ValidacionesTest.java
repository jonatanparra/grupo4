package cl.duoc.glitchstore.validation;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ValidacionesTest {

    @Test
    void aceptaRunConDigitoVerificadorCorrecto() {
        assertThat(Validaciones.runValido("191102207")).isTrue();
        assertThat(Validaciones.runValido("10000013K")).isTrue();
        assertThat(Validaciones.runValido("10000013k")).isTrue();
    }

    @Test
    void rechazaRunConDigitoIncorrectoPuntosOGuion() {
        assertThat(Validaciones.runValido("191102203")).isFalse();
        assertThat(Validaciones.runValido("19.110.220-7")).isFalse();
        assertThat(Validaciones.runValido("123")).isFalse();
    }

    @Test
    void soloAceptaDominiosPermitidos() {
        assertThat(Validaciones.correoPermitido("ana@duoc.cl")).isTrue();
        assertThat(Validaciones.correoPermitido("ANA@Profesor.Duoc.cl")).isTrue();
        assertThat(Validaciones.correoPermitido("ana@gmail.com")).isTrue();
        assertThat(Validaciones.correoPermitido("ana@hotmail.com")).isFalse();
        assertThat(Validaciones.correoPermitido("ana.gmail.com")).isFalse();
    }
}
