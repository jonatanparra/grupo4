package cl.duoc.glitchstore.service;

import cl.duoc.glitchstore.dto.CategoriaDTO;
import cl.duoc.glitchstore.dto.CategoriaRequest;
import cl.duoc.glitchstore.exception.ConflictoException;
import cl.duoc.glitchstore.exception.NoEncontradoException;
import cl.duoc.glitchstore.exception.ReglaNegocioException;
import cl.duoc.glitchstore.model.Categoria;
import cl.duoc.glitchstore.repository.CategoriaRepository;
import cl.duoc.glitchstore.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categorias;
    private final ProductoRepository productos;

    public CategoriaService(CategoriaRepository categorias, ProductoRepository productos) {
        this.categorias = categorias;
        this.productos = productos;
    }

    public List<CategoriaDTO> listar() {
        return categorias.findAll().stream()
                .sorted((a, b) -> a.getNombre().compareToIgnoreCase(b.getNombre()))
                .map(this::aDto)
                .toList();
    }

    public CategoriaDTO obtener(String id) {
        return aDto(buscar(id));
    }

    @Transactional
    public CategoriaDTO crear(CategoriaRequest req) {
        if (req.id() == null || req.id().isBlank()) throw new ReglaNegocioException("El id de la categoría es obligatorio.");
        if (categorias.existsById(req.id())) throw new ConflictoException("Ya existe una categoría con el id \"" + req.id() + "\".");
        validarNombreUnico(req.nombre(), null);
        Categoria c = new Categoria(req.id(), req.nombre().trim(), req.descripcion(), req.imagen());
        return aDto(categorias.save(c));
    }

    @Transactional
    public CategoriaDTO actualizar(String id, CategoriaRequest req) {
        Categoria c = buscar(id);
        validarNombreUnico(req.nombre(), id);
        c.setNombre(req.nombre().trim());
        c.setDescripcion(req.descripcion());
        c.setImagen(req.imagen());
        return aDto(c);
    }

    @Transactional
    public void eliminar(String id) {
        Categoria c = buscar(id);
        long cantidad = productos.countByCategoriaId(id);
        if (cantidad > 0) {
            throw new ConflictoException("No se puede eliminar \"" + c.getNombre() + "\": tiene " + cantidad + " producto(s) asociados.");
        }
        categorias.delete(c);
    }

    /** Busca por id ("terror") o por nombre ("Terror"). */
    public Categoria buscarPorIdONombre(String valor) {
        return categorias.findById(valor)
                .or(() -> categorias.findByNombreIgnoreCase(valor.trim()))
                .orElseThrow(() -> new ReglaNegocioException("La categoría \"" + valor + "\" no existe."));
    }

    private Categoria buscar(String id) {
        return categorias.findById(id).orElseThrow(() -> new NoEncontradoException("No existe la categoría \"" + id + "\"."));
    }

    private void validarNombreUnico(String nombre, String idActual) {
        categorias.findByNombreIgnoreCase(nombre.trim())
                .filter(otra -> !otra.getId().equals(idActual))
                .ifPresent(otra -> {
                    throw new ConflictoException("Ya existe una categoría llamada \"" + nombre.trim() + "\".");
                });
    }

    private CategoriaDTO aDto(Categoria c) {
        return CategoriaDTO.desde(c, productos.countByCategoriaId(c.getId()));
    }
}
