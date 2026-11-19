package cl.duoc.glitchstore.model;

import java.util.Arrays;

/**
 * Roles del sistema (Anexo 1):
 * - ADMINISTRADOR: acceso total.
 * - VENDEDOR: solo ve productos y órdenes (lista y detalle).
 * - CLIENTE: solo la tienda.
 * En la API se expone con su etiqueta ("Administrador", "Vendedor", "Cliente"),
 * igual que en el frontend.
 */
public enum Rol {
    ADMINISTRADOR("Administrador"),
    VENDEDOR("Vendedor"),
    CLIENTE("Cliente");

    private final String etiqueta;

    Rol(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    /** Autoridad que usa Spring Security (ROLE_ADMINISTRADOR, ...). */
    public String getAutoridad() {
        return "ROLE_" + name();
    }

    /** Acepta la etiqueta ("Vendedor") o el nombre del enum ("VENDEDOR"). */
    public static Rol desde(String valor) {
        return Arrays.stream(values())
                .filter(r -> r.name().equalsIgnoreCase(valor) || r.etiqueta.equalsIgnoreCase(valor))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Tipo de usuario inválido: " + valor));
    }
}
