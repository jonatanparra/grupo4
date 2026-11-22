package cl.duoc.glitchstore.dto;

import cl.duoc.glitchstore.model.Boleta;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.ZoneOffset;
import java.util.List;

@Schema(description = "Boleta (orden de compra) con sus líneas")
public record BoletaDTO(
        @Schema(example = "ORD-1001") String id,
        @Schema(description = "Fecha en UTC (ISO-8601)", example = "2026-10-01T15:32:00Z") String fecha,
        @Schema(description = "Pagado, Rechazado, Enviado, Entregado o Anulado", example = "Pagado") String estado,
        String motivoRechazo,
        @Schema(description = "RUN del usuario que compró (null si fue como invitado)") String usuarioRun,
        Cliente cliente,
        Envio envio,
        String metodoPago,
        List<Item> items,
        String cupon,
        long subtotal,
        long descuentoCupon,
        long costoEnvio,
        long total) {

    public record Cliente(String nombre, String apellidos, String correo) {
    }

    public record Envio(String tipo, String calle, String departamento, String region, String comuna, String indicaciones) {
    }

    public record Item(String codigo, String nombre, int precioUnitario, int cantidad, long totalLinea) {
    }

    public static BoletaDTO desde(Boleta b) {
        List<Item> items = b.getDetalles().stream()
                .map(d -> new Item(d.getProducto() != null ? d.getProducto().getCodigo() : null, d.getNombreProducto(),
                        d.getPrecioUnitario(), d.getCantidad(), d.getTotalLinea()))
                .toList();
        return new BoletaDTO(b.getId(), b.getFecha().toInstant(ZoneOffset.UTC).toString(), b.getEstado(), texto(b.getMotivoRechazo()),
                b.getUsuario() != null ? b.getUsuario().getRun() : null,
                new Cliente(b.getClienteNombre(), b.getClienteApellidos(), b.getClienteCorreo()),
                new Envio(b.getTipoEnvio(), texto(b.getCalle()), texto(b.getDepartamento()), texto(b.getRegion()), texto(b.getComuna()),
                        texto(b.getIndicaciones())),
                b.getMetodoPago(), items, texto(b.getCupon()), b.getSubtotal(), b.getDescuentoCupon(), b.getCostoEnvio(), b.getTotal());
    }

    /** Oracle guarda "" como NULL; el frontend espera textos vacíos. */
    private static String texto(String valor) {
        return valor == null ? "" : valor;
    }
}
