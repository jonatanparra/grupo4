package cl.duoc.glitchstore.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

/** Usuario del sistema. La contraseña se guarda cifrada con BCrypt. */
@Entity
@Table(name = "USUARIO")
public class Usuario {

    /** RUN sin puntos ni guion (ej: 19011022K). */
    @Id
    @Column(name = "RUN", length = 9)
    private String run;

    @Column(name = "NOMBRE", nullable = false, length = 50)
    private String nombre;

    @Column(name = "APELLIDOS", nullable = false, length = 100)
    private String apellidos;

    @Column(name = "CORREO", nullable = false, length = 100, unique = true)
    private String correo;

    @Column(name = "CONTRASENA", nullable = false, length = 100)
    private String contrasena;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROL", nullable = false, length = 20)
    private Rol rol;

    @Column(name = "FECHA_NACIMIENTO")
    private LocalDate fechaNacimiento;

    @Column(name = "REGION", length = 60)
    private String region;

    @Column(name = "COMUNA", length = 60)
    private String comuna;

    @Column(name = "DIRECCION", length = 300)
    private String direccion;

    public String getRun() { return run; }
    public void setRun(String run) { this.run = run; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getComuna() { return comuna; }
    public void setComuna(String comuna) { this.comuna = comuna; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
}
