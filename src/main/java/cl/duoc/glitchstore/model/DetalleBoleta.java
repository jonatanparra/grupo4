package cl.duoc.glitchstore.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Línea de una boleta: producto, cantidad y precio cobrado. */
@Entity
@Table(name = "DETALLE_BOLETA")
public class DetalleBoleta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "BOLETA_ID", nullable = false)
    private Boleta boleta;

    /** Puede quedar en null si después se elimina el producto (ON DELETE SET NULL). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRODUCTO_CODIGO")
    private Producto producto;

    /** Copia del nombre al momento de la compra. */
    @Column(name = "NOMBRE_PRODUCTO", nullable = false, length = 100)
    private String nombreProducto;

    @Column(name = "PRECIO_UNITARIO", nullable = false)
    private Integer precioUnitario;

    @Column(name = "CANTIDAD", nullable = false)
    private Integer cantidad;

    @Column(name = "TOTAL_LINEA", nullable = false)
    private Long totalLinea;

    public DetalleBoleta() {
    }

    public DetalleBoleta(Producto producto, String nombreProducto, int precioUnitario, int cantidad) {
        this.producto = producto;
        this.nombreProducto = nombreProducto;
        this.precioUnitario = precioUnitario;
        this.cantidad = cantidad;
        this.totalLinea = (long) precioUnitario * cantidad;
    }

    public Long getId() { return id; }
    public Boleta getBoleta() { return boleta; }
    public void setBoleta(Boleta boleta) { this.boleta = boleta; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public String getNombreProducto() { return nombreProducto; }
    public Integer getPrecioUnitario() { return precioUnitario; }
    public Integer getCantidad() { return cantidad; }
    public Long getTotalLinea() { return totalLinea; }
}
