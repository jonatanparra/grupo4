package cl.duoc.glitchstore.service;

import cl.duoc.glitchstore.dto.ProductoRequest;
import cl.duoc.glitchstore.exception.ConflictoException;
import cl.duoc.glitchstore.exception.NoEncontradoException;
import cl.duoc.glitchstore.exception.ReglaNegocioException;
import cl.duoc.glitchstore.model.Producto;
import cl.duoc.glitchstore.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class ProductoService {

    private final ProductoRepository productos;
    private final CategoriaService categorias;

    public ProductoService(ProductoRepository productos, CategoriaService categorias) {
        this.productos = productos;
        this.categorias = categorias;
    }

    /**
     * Lista productos con filtros opcionales.
     * @param categoria id o nombre de la categoría
     * @param soloOfertas true para traer solo productos con descuento (del mayor al menor)
     * @param texto búsqueda por nombre o código
     */
    public List<Producto> listar(String categoria, boolean soloOfertas, String texto) {
        List<Producto> lista;
        if (soloOfertas) lista = productos.findByDescuentoGreaterThanOrderByDescuentoDesc(0);
        else if (categoria != null && !categoria.isBlank()) {
            lista = productos.findByCategoriaIdOrderByCodigoAsc(categorias.buscarPorIdONombre(categoria).getId());
        } else lista = productos.findAllByOrderByCodigoAsc();

        if (soloOfertas && categoria != null && !categoria.isBlank()) {
            String id = categorias.buscarPorIdONombre(categoria).getId();
            lista = lista.stream().filter(p -> p.getCategoria().getId().equals(id)).toList();
        }
        if (texto != null && !texto.isBlank()) {
            String buscado = texto.trim().toLowerCase(Locale.ROOT);
            lista = lista.stream()
                    .filter(p -> p.getNombre().toLowerCase(Locale.ROOT).contains(buscado)
                            || p.getCodigo().toLowerCase(Locale.ROOT).contains(buscado))
                    .toList();
        }
        return lista;
    }

    public List<Producto> stockCritico() {
        return productos.findStockCritico();
    }

    public Producto obtener(String codigo) {
        return productos.findById(codigo).orElseThrow(() -> new NoEncontradoException("No existe el producto con código \"" + codigo + "\"."));
    }

    @Transactional
    public Producto crear(ProductoRequest req) {
        if (req.codigo() == null || req.codigo().isBlank()) throw new ReglaNegocioException("El código es obligatorio.");
        String codigo = req.codigo().trim().toUpperCase(Locale.ROOT);
        if (productos.existsById(codigo)) throw new ConflictoException("Ya existe un producto con el código " + codigo + ".");
        Producto p = new Producto();
        p.setCodigo(codigo);
        copiar(req, p);
        return productos.save(p);
    }

    @Transactional
    public Producto actualizar(String codigo, ProductoRequest req) {
        Producto p = obtener(codigo);
        copiar(req, p);
        return p;
    }

    @Transactional
    public void eliminar(String codigo) {
        productos.delete(obtener(codigo));
    }

    private void copiar(ProductoRequest req, Producto p) {
        p.setNombre(req.nombre().trim());
        p.setCategoria(categorias.buscarPorIdONombre(req.categoria()));
        p.setPrecio(req.precio());
        p.setDescuento(req.descuento() == null ? 0 : req.descuento());
        p.setStock(req.stock());
        p.setStockCritico(req.stockCritico());
        p.setDescripcion(req.descripcion());
        p.setImagen(req.imagen());
    }
}
