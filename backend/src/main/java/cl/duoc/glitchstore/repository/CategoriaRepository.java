package cl.duoc.glitchstore.repository;

import cl.duoc.glitchstore.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, String> {

    Optional<Categoria> findByNombreIgnoreCase(String nombre);
}
