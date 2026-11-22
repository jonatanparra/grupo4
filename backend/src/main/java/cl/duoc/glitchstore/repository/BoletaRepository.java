package cl.duoc.glitchstore.repository;

import cl.duoc.glitchstore.model.Boleta;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BoletaRepository extends JpaRepository<Boleta, String> {

    /** Carga la boleta con sus líneas y el usuario en una sola consulta. */
    @EntityGraph(attributePaths = {"detalles", "detalles.producto", "usuario"})
    Optional<Boleta> findWithDetallesById(String id);

    @EntityGraph(attributePaths = {"detalles", "detalles.producto", "usuario"})
    List<Boleta> findAllByOrderByFechaDesc();

    @EntityGraph(attributePaths = {"detalles", "detalles.producto", "usuario"})
    List<Boleta> findByEstadoOrderByFechaDesc(String estado);

    /** Compras de un usuario: las asociadas a su RUN o hechas con su correo como invitado. */
    @EntityGraph(attributePaths = {"detalles", "detalles.producto", "usuario"})
    @Query("select b from Boleta b where b.usuario.run = :run or lower(b.clienteCorreo) = lower(:correo) order by b.fecha desc")
    List<Boleta> findDelUsuario(String run, String correo);

    /** Siguiente número de boleta desde la secuencia de Oracle. */
    @Query(value = "SELECT SEQ_BOLETA.NEXTVAL FROM DUAL", nativeQuery = true)
    Long siguienteNumero();
}
