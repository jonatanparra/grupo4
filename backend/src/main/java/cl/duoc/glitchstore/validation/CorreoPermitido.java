package cl.duoc.glitchstore.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Correo con formato válido y de un dominio permitido (@duoc.cl, @profesor.duoc.cl, @gmail.com). */
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CorreoPermitidoValidator.class)
public @interface CorreoPermitido {
    String message() default "Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
