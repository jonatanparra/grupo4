package cl.duoc.glitchstore.security;

import cl.duoc.glitchstore.model.Rol;

/** Datos del usuario que vienen en el JWT (se obtienen con @AuthenticationPrincipal). */
public record UsuarioAutenticado(String run, String correo, Rol rol) {
}
