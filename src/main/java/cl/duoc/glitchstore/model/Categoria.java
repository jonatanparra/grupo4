package cl.duoc.glitchstore.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Categoría de productos (Terror, Acción, Indie...). */
@Entity
@Table(name = "CATEGORIA")
public class Categoria {

    @Id
    @Column(name = "ID", length = 40)
    private String id;

    @Column(name = "NOMBRE", nullable = false, length = 60, unique = true)
    private String nombre;

    @Column(name = "DESCRIPCION", length = 300)
    private String descripcion;

    @Column(name = "IMAGEN", length = 300)
    private String imagen;

    public Categoria() {
    }

    public Categoria(String id, String nombre, String descripcion, String imagen) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.imagen = imagen;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
}
