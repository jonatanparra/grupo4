package cl.duoc.glitchstore.model;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Producto (videojuego) de la tienda. */
@Entity
@Table(name = "PRODUCTO")
public class Producto {

    @Id
    @Column(name = "CODIGO", length = 20)
    private String codigo;

    @Column(name = "NOMBRE", nullable = false, length = 100)
    private String nombre;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "CATEGORIA_ID", nullable = false)
    private Categoria categoria;

    @Column(name = "PRECIO", nullable = false)
    private Integer precio;

    /** Porcentaje de oferta (0 = sin oferta). */
    @Column(name = "DESCUENTO", nullable = false)
    private Integer descuento = 0;

    @Column(name = "STOCK", nullable = false)
    private Integer stock;

    @Column(name = "STOCK_CRITICO")
    private Integer stockCritico;

    @Column(name = "DESCRIPCION", length = 1000)
    private String descripcion;

    /** Ruta (/img/...) o imagen subida en Base64 (data URL), por eso es CLOB. */
    @Lob
    @Basic(fetch = FetchType.EAGER)
    @Column(name = "IMAGEN")
    private String imagen;

    /** Precio aplicando el descuento de oferta, redondeado a pesos. */
    public int precioFinal() {
        if (descuento == null || descuento <= 0) return precio;
        return (int) Math.round(precio * (1 - descuento / 100.0));
    }

    public boolean stockCritico() {
        return stockCritico != null && stock <= stockCritico;
    }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
    public Integer getPrecio() { return precio; }
    public void setPrecio(Integer precio) { this.precio = precio; }
    public Integer getDescuento() { return descuento; }
    public void setDescuento(Integer descuento) { this.descuento = descuento; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public Integer getStockCritico() { return stockCritico; }
    public void setStockCritico(Integer stockCritico) { this.stockCritico = stockCritico; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
}
