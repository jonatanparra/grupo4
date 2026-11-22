package cl.duoc.glitchstore.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** RUN chileno sin puntos ni guion, de 7 a 9 caracteres y con dígito verificador correcto. */
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = RunValidoValidator.class)
public @interface RunValido {
    String message() default "El RUN no es válido (sin puntos ni guion, con dígito verificador correcto).";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
