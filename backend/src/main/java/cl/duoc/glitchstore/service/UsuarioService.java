package cl.duoc.glitchstore.service;

import cl.duoc.glitchstore.dto.RegistroRequest;
import cl.duoc.glitchstore.dto.UsuarioRequest;
import cl.duoc.glitchstore.exception.ConflictoException;
import cl.duoc.glitchstore.exception.NoEncontradoException;
import cl.duoc.glitchstore.exception.ReglaNegocioException;
import cl.duoc.glitchstore.model.Rol;
import cl.duoc.glitchstore.model.Usuario;
import cl.duoc.glitchstore.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;

    public UsuarioService(UsuarioRepository usuarios, PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.encoder = encoder;
    }

    public List<Usuario> listar() {
        return usuarios.findAllByOrderByNombreAsc();
    }

    public Usuario obtener(String run) {
        return usuarios.findById(normalizarRun(run)).orElseThrow(() -> new NoEncontradoException("No existe un usuario con RUN " + run + "."));
    }

    public Usuario obtenerPorCorreo(String correo) {
        return usuarios.findByCorreoIgnoreCase(correo).orElseThrow(() -> new NoEncontradoException("No existe un usuario con ese correo."));
    }

    /** Alta desde el panel de administración (puede elegir el tipo de usuario). */
    @Transactional
    public Usuario crear(UsuarioRequest req) {
        if (req.run() == null || req.run().isBlank()) throw new ReglaNegocioException("El RUN es obligatorio.");
        if (req.contrasena() == null || req.contrasena().isBlank()) throw new ReglaNegocioException("La contraseña es obligatoria.");
        Usuario u = new Usuario();
        u.setRun(normalizarRun(req.run()));
        validarUnicos(u.getRun(), req.correo());
        u.setContrasena(encoder.encode(req.contrasena()));
        copiar(req, u);
        return usuarios.save(u);
    }

    /** Registro público: siempre crea un Cliente. */
    @Transactional
    public Usuario registrar(RegistroRequest req) {
        Usuario u = new Usuario();
        u.setRun(normalizarRun(req.run()));
        validarUnicos(u.getRun(), req.correo());
        u.setNombre(req.nombre().trim());
        u.setApellidos(req.apellidos().trim());
        u.setCorreo(normalizarCorreo(req.correo()));
        u.setContrasena(encoder.encode(req.contrasena()));
        u.setRol(Rol.CLIENTE);
        u.setFechaNacimiento(req.fechaNacimiento());
        u.setRegion(req.region());
        u.setComuna(req.comuna());
        u.setDireccion(req.direccion());
        return usuarios.save(u);
    }

    /** El RUN no se puede cambiar; la contraseña solo si viene informada. */
    @Transactional
    public Usuario actualizar(String run, UsuarioRequest req, String runAutenticado) {
        Usuario u = obtener(run);
        usuarios.findByCorreoIgnoreCase(req.correo().trim())
                .filter(otro -> !otro.getRun().equals(u.getRun()))
                .ifPresent(otro -> {
                    throw new ConflictoException("Ya existe una cuenta con ese correo.");
                });
        Rol nuevoRol = Rol.desde(req.tipo());
        if (u.getRun().equals(runAutenticado) && nuevoRol != u.getRol()) {
            throw new ReglaNegocioException("No puedes cambiar tu propio tipo de usuario.");
        }
        if (req.contrasena() != null && !req.contrasena().isBlank()) u.setContrasena(encoder.encode(req.contrasena()));
        copiar(req, u);
        return u;
    }

    @Transactional
    public void eliminar(String run, String runAutenticado) {
        Usuario u = obtener(run);
        if (u.getRun().equals(runAutenticado)) throw new ReglaNegocioException("No puedes eliminar tu propia cuenta.");
        usuarios.delete(u);
    }

    private void copiar(UsuarioRequest req, Usuario u) {
        u.setNombre(req.nombre().trim());
        u.setApellidos(req.apellidos().trim());
        u.setCorreo(normalizarCorreo(req.correo()));
        u.setRol(Rol.desde(req.tipo()));
        u.setFechaNacimiento(req.fechaNacimiento());
        u.setRegion(req.region());
        u.setComuna(req.comuna());
        u.setDireccion(req.direccion());
    }

    private void validarUnicos(String run, String correo) {
        if (usuarios.existsById(run)) throw new ConflictoException("Ya existe un usuario con ese RUN.");
        if (usuarios.existsByCorreoIgnoreCase(correo.trim())) throw new ConflictoException("Ya existe una cuenta con ese correo.");
    }

    private static String normalizarRun(String run) {
        return run.trim().toUpperCase(Locale.ROOT);
    }

    private static String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase(Locale.ROOT);
    }
}
