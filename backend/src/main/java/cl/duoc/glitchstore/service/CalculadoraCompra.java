package cl.duoc.glitchstore.service;

import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Map;

/**
 * Reglas de precios de la tienda (las mismas de src/utils/carrito.js del frontend).
 * El backend recalcula todo al comprar: el frontend solo envía códigos y cantidades,
 * así un cliente no puede manipular precios ni totales.
 */
@Component
public class CalculadoraCompra {

    /** Cupones válidos: código → porcentaje de descuento. */
    public static final Map<String, Integer> CUPONES = Map.of("GLITCH10", 10, "DUOC15", 15);
    public static final int COSTO_ENVIO = 3990;
    public static final int ENVIO_GRATIS_DESDE = 50000;

    public record Totales(long subtotal, long descuentoCupon, long costoEnvio, long total) {
    }

    /** Porcentaje del cupón, o 0 si no existe. */
    public int porcentajeCupon(String codigo) {
        if (codigo == null) return 0;
        return CUPONES.getOrDefault(codigo.trim().toUpperCase(Locale.ROOT), 0);
    }

    /** El despacho a domicilio cuesta $3.990, gratis desde $50.000; el retiro en tienda no tiene costo. */
    public long costoEnvio(String tipoEnvio, long subtotalConDescuento) {
        if (!"domicilio".equals(tipoEnvio)) return 0;
        return subtotalConDescuento >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
    }

    public Totales calcular(long subtotal, String cupon, String tipoEnvio) {
        long descuento = Math.round(subtotal * porcentajeCupon(cupon) / 100.0);
        long envio = subtotal > 0 ? costoEnvio(tipoEnvio, subtotal - descuento) : 0;
        return new Totales(subtotal, descuento, envio, subtotal - descuento + envio);
    }
}
