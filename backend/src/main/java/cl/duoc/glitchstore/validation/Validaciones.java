package cl.duoc.glitchstore.validation;

import java.util.List;
import java.util.Locale;

/** Reglas de validación compartidas (las mismas del frontend, src/utils/validaciones.js). */
public final class Validaciones {

    public static final List<String> DOMINIOS_PERMITIDOS = List.of("duoc.cl", "profesor.duoc.cl", "gmail.com");

    private Validaciones() {
    }

    /** Calcula el dígito verificador (módulo 11) del cuerpo numérico de un RUN. */
    public static char digitoVerificador(String cuerpo) {
        int suma = 0;
        int multiplo = 2;
        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            suma += Character.getNumericValue(cuerpo.charAt(i)) * multiplo;
            multiplo = multiplo == 7 ? 2 : multiplo + 1;
        }
        int resto = 11 - (suma % 11);
        if (resto == 11) return '0';
        if (resto == 10) return 'K';
        return (char) ('0' + resto);
    }

    public static boolean runValido(String run) {
        String limpio = run.trim().toUpperCase(Locale.ROOT);
        if (!limpio.matches("^[0-9]+[0-9K]$") || limpio.length() < 7 || limpio.length() > 9) return false;
        String cuerpo = limpio.substring(0, limpio.length() - 1);
        return digitoVerificador(cuerpo) == limpio.charAt(limpio.length() - 1);
    }

    public static boolean correoPermitido(String correo) {
        String valor = correo.trim().toLowerCase(Locale.ROOT);
        if (!valor.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) return false;
        return DOMINIOS_PERMITIDOS.contains(valor.substring(valor.indexOf('@') + 1));
    }
}
