package cl.duoc.glitchstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Nuevo estado de la boleta")
public record EstadoBoletaRequest(
        @Schema(example = "Enviado")
        @NotBlank @Pattern(regexp = "Pagado|Rechazado|Enviado|Entregado|Anulado",
                message = "Estado inválido (Pagado, Rechazado, Enviado, Entregado o Anulado).") String estado) {
}
