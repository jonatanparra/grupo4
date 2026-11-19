package cl.duoc.glitchstore.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class RunValidoValidator implements ConstraintValidator<RunValido, String> {

    @Override
    public boolean isValid(String valor, ConstraintValidatorContext contexto) {
        if (valor == null || valor.isBlank()) return true; // @NotBlank se encarga del campo vacío
        return Validaciones.runValido(valor);
    }
}
