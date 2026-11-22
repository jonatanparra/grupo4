package cl.duoc.glitchstore.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CorreoPermitidoValidator implements ConstraintValidator<CorreoPermitido, String> {

    @Override
    public boolean isValid(String valor, ConstraintValidatorContext contexto) {
        if (valor == null || valor.isBlank()) return true;
        return Validaciones.correoPermitido(valor);
    }
}
