package cl.duoc.glitchstore.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Boleta (orden de compra). Guarda una copia de los datos del cliente y del
 * despacho al momento de la compra, así la boleta no cambia si después se
 * edita o elimina el usuario.
 */
@Entity
@Table(name = "BOLETA")
public class Boleta {

    /** Número correlativo con formato ORD-1001 (secuencia SEQ_BOLETA). */
    @Id
    @Column(name = "ID", length = 20)
    private String id;

    /** Usuario con sesión iniciada que compró (null si compró como invitado). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USUARIO_RUN")
    private Usuario usuario;

    @Column(name = "FECHA", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "ESTADO", nullable = false, length = 20)
    private String estado;

    @Column(name = "MOTIVO_RECHAZO", length = 200)
    private String motivoRechazo;

    @Column(name = "CLIENTE_NOMBRE", nullable = false, length = 50)
    private String clienteNombre;

    @Column(name = "CLIENTE_APELLIDOS", nullable = false, length = 100)
    private String clienteApellidos;

    @Column(name = "CLIENTE_CORREO", nullable = false, length = 100)
    private String clienteCorreo;

    @Column(name = "TIPO_ENVIO", nullable = false, length = 20)
    private String tipoEnvio;

    @Column(name = "CALLE", length = 300)
    private String calle;

    @Column(name = "DEPARTAMENTO", length = 100)
    private String departamento;

    @Column(name = "REGION", length = 60)
    private String region;

    @Column(name = "COMUNA", length = 60)
    private String comuna;

    @Column(name = "INDICACIONES", length = 200)
    private String indicaciones;

    @Column(name = "METODO_PAGO", length = 30)
    private String metodoPago;

    @Column(name = "CUPON", length = 20)
    private String cupon;

    @Column(name = "SUBTOTAL", nullable = false)
    private Long subtotal;

    @Column(name = "DESCUENTO_CUPON", nullable = false)
    private Long descuentoCupon;

    @Column(name = "COSTO_ENVIO", nullable = false)
    private Long costoEnvio;

    @Column(name = "TOTAL", nullable = false)
    private Long total;

    @OneToMany(mappedBy = "boleta", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<DetalleBoleta> detalles = new ArrayList<>();

    public void agregarDetalle(DetalleBoleta detalle) {
        detalle.setBoleta(this);
        detalles.add(detalle);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }
    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }
    public String getClienteApellidos() { return clienteApellidos; }
    public void setClienteApellidos(String clienteApellidos) { this.clienteApellidos = clienteApellidos; }
    public String getClienteCorreo() { return clienteCorreo; }
    public void setClienteCorreo(String clienteCorreo) { this.clienteCorreo = clienteCorreo; }
    public String getTipoEnvio() { return tipoEnvio; }
    public void setTipoEnvio(String tipoEnvio) { this.tipoEnvio = tipoEnvio; }
    public String getCalle() { return calle; }
    public void setCalle(String calle) { this.calle = calle; }
    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getComuna() { return comuna; }
    public void setComuna(String comuna) { this.comuna = comuna; }
    public String getIndicaciones() { return indicaciones; }
    public void setIndicaciones(String indicaciones) { this.indicaciones = indicaciones; }
    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    public String getCupon() { return cupon; }
    public void setCupon(String cupon) { this.cupon = cupon; }
    public Long getSubtotal() { return subtotal; }
    public void setSubtotal(Long subtotal) { this.subtotal = subtotal; }
    public Long getDescuentoCupon() { return descuentoCupon; }
    public void setDescuentoCupon(Long descuentoCupon) { this.descuentoCupon = descuentoCupon; }
    public Long getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(Long costoEnvio) { this.costoEnvio = costoEnvio; }
    public Long getTotal() { return total; }
    public void setTotal(Long total) { this.total = total; }
    public List<DetalleBoleta> getDetalles() { return detalles; }
}
