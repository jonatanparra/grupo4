package cl.duoc.glitchstore.repository;

import cl.duoc.glitchstore.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, String> {

    List<Producto> findAllByOrderByCodigoAsc();

    List<Producto> findByCategoriaIdOrderByCodigoAsc(String categoriaId);

    long countByCategoriaId(String categoriaId);

    /** Productos en oferta, del mayor al menor descuento. */
    List<Producto> findByDescuentoGreaterThanOrderByDescuentoDesc(int descuento);

    @Query("select p from Producto p where p.stockCritico is not null and p.stock <= p.stockCritico order by p.stock")
    List<Producto> findStockCritico();
}
