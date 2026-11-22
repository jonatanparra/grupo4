package cl.duoc.glitchstore.dto;

import cl.duoc.glitchstore.validation.CorreoPermitido;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "Datos del checkout. Los precios y totales los calcula el backend.")
public record CompraRequest(
        @Valid @NotNull(message = "Faltan los datos del cliente.") Cliente cliente,
        @Valid @NotNull(message = "Faltan los datos de envío.") Envio envio,
        @Schema(example = "debito") @NotBlank(message = "El método de pago es obligatorio.") String metodoPago,
        @Valid @NotEmpty(message = "El carrito está vacío.") List<Item> items,
        @Schema(example = "GLITCH10") String cupon,
        @Schema(description = "Solo para demostrar el flujo de pago rechazado", example = "false") boolean simularRechazo) {

    public record Cliente(
            @Schema(example = "Javiera") @NotBlank(message = "El nombre es obligatorio.") @Size(max = 50) String nombre,
            @Schema(example = "Contreras Díaz") @NotBlank(message = "Los apellidos son obligatorios.") @Size(max = 100) String apellidos,
            @Schema(example = "javiera.contreras@profesor.duoc.cl") @NotBlank(message = "El correo es obligatorio.") @CorreoPermitido String correo) {
    }

    public record Envio(
            @Schema(description = "domicilio o retiro", example = "domicilio")
            @NotBlank @Pattern(regexp = "domicilio|retiro", message = "El tipo de envío debe ser domicilio o retiro.") String tipo,
            @Schema(example = "Camino Real 789") @Size(max = 300) String calle,
            @Size(max = 100) String departamento,
            @Schema(example = "nuble") @Size(max = 60) String region,
            @Schema(example = "chillan") @Size(max = 60) String comuna,
            @Size(max = 200) String indicaciones) {
    }

    public record Item(
            @Schema(example = "GS-007") @NotBlank String codigo,
            @Schema(example = "1") @NotNull @Min(value = 1, message = "La cantidad mínima es 1.") Integer cantidad) {
    }
}
