package cl.duoc.glitchstore.service;

import cl.duoc.glitchstore.dto.BoletaDTO;
import cl.duoc.glitchstore.dto.CompraRequest;
import cl.duoc.glitchstore.exception.NoEncontradoException;
import cl.duoc.glitchstore.exception.ReglaNegocioException;
import cl.duoc.glitchstore.model.Boleta;
import cl.duoc.glitchstore.model.DetalleBoleta;
import cl.duoc.glitchstore.model.Producto;
import cl.duoc.glitchstore.model.Rol;
import cl.duoc.glitchstore.model.Usuario;
import cl.duoc.glitchstore.repository.BoletaRepository;
import cl.duoc.glitchstore.repository.ProductoRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Proceso de compra y gestión de boletas.
 * Una compra queda "Pagado" (descuenta stock) o "Rechazado" (no toca el stock)
 * si falta stock o el pago se simula rechazado.
 */
@Service
@Transactional(readOnly = true)
public class BoletaService {

    private final BoletaRepository boletas;
    private final ProductoRepository productos;
    private final CalculadoraCompra calculadora;

    public BoletaService(BoletaRepository boletas, ProductoRepository productos, CalculadoraCompra calculadora) {
        this.boletas = boletas;
        this.productos = productos;
        this.calculadora = calculadora;
    }

    /** @param comprador usuario con sesión iniciada, o null si compra como invitado */
    @Transactional
    public BoletaDTO comprar(CompraRequest req, Usuario comprador) {
        if ("domicilio".equals(req.envio().tipo())
                && (vacio(req.envio().calle()) || vacio(req.envio().region()) || vacio(req.envio().comuna()))) {
            throw new ReglaNegocioException("Para despacho a domicilio la calle, región y comuna son obligatorias.");
        }
        String cupon = vacio(req.cupon()) ? null : req.cupon().trim().toUpperCase(Locale.ROOT);
        if (cupon != null && calculadora.porcentajeCupon(cupon) == 0) throw new ReglaNegocioException("El cupón " + cupon + " no es válido.");

        // Agrupa líneas repetidas del mismo producto
        Map<String, Integer> cantidades = new LinkedHashMap<>();
        req.items().forEach(i -> cantidades.merge(i.codigo().trim().toUpperCase(Locale.ROOT), i.cantidad(), Integer::sum));

        Boleta b = new Boleta();
        long subtotal = 0;
        List<Producto> sinStock = new ArrayList<>();
        for (Map.Entry<String, Integer> linea : cantidades.entrySet()) {
            Producto p = productos.findById(linea.getKey())
                    .orElseThrow(() -> new ReglaNegocioException("El producto " + linea.getKey() + " ya no existe."));
            int precio = p.precioFinal();
            b.agregarDetalle(new DetalleBoleta(p, p.getNombre(), precio, linea.getValue()));
            subtotal += (long) precio * linea.getValue();
            if (linea.getValue() > p.getStock()) sinStock.add(p);
        }

        String motivo = null;
        if (!sinStock.isEmpty()) motivo = "No hay stock suficiente de: " + String.join(", ", sinStock.stream().map(Producto::getNombre).toList()) + ".";
        else if (req.simularRechazo()) motivo = "El medio de pago fue rechazado por el banco emisor.";

        CalculadoraCompra.Totales t = calculadora.calcular(subtotal, cupon, req.envio().tipo());
        b.setId("ORD-" + boletas.siguienteNumero());
        b.setUsuario(comprador);
        b.setFecha(LocalDateTime.now(ZoneOffset.UTC));
        b.setEstado(motivo == null ? "Pagado" : "Rechazado");
        b.setMotivoRechazo(motivo);
        b.setClienteNombre(req.cliente().nombre().trim());
        b.setClienteApellidos(req.cliente().apellidos().trim());
        b.setClienteCorreo(req.cliente().correo().trim().toLowerCase(Locale.ROOT));
        b.setTipoEnvio(req.envio().tipo());
        boolean domicilio = "domicilio".equals(req.envio().tipo());
        b.setCalle(domicilio ? req.envio().calle() : null);
        b.setDepartamento(domicilio ? req.envio().departamento() : null);
        b.setRegion(req.envio().region());
        b.setComuna(req.envio().comuna());
        b.setIndicaciones(req.envio().indicaciones());
        b.setMetodoPago(req.metodoPago());
        b.setCupon(cupon);
        b.setSubtotal(t.subtotal());
        b.setDescuentoCupon(t.descuentoCupon());
        b.setCostoEnvio(t.costoEnvio());
        b.setTotal(t.total());

        if (motivo == null) {
            b.getDetalles().forEach(d -> d.getProducto().setStock(d.getProducto().getStock() - d.getCantidad()));
        }
        return BoletaDTO.desde(boletas.save(b));
    }

    public List<BoletaDTO> listar(String estado) {
        List<Boleta> lista = vacio(estado) ? boletas.findAllByOrderByFechaDesc() : boletas.findByEstadoOrderByFechaDesc(estado);
        return lista.stream().map(BoletaDTO::desde).toList();
    }

    public List<BoletaDTO> delUsuario(Usuario usuario) {
        return boletas.findDelUsuario(usuario.getRun(), usuario.getCorreo()).stream().map(BoletaDTO::desde).toList();
    }

    /** Administrador y Vendedor ven cualquier boleta; un Cliente solo las suyas. */
    public BoletaDTO obtener(String id, Usuario solicitante) {
        Boleta b = buscar(id);
        if (solicitante.getRol() == Rol.CLIENTE && !esDelUsuario(b, solicitante)) {
            throw new AccessDeniedException("La boleta no pertenece al usuario.");
        }
        return BoletaDTO.desde(b);
    }

    @Transactional
    public BoletaDTO cambiarEstado(String id, String estado) {
        Boleta b = buscar(id);
        if ("Rechazado".equals(b.getEstado()) || "Anulado".equals(b.getEstado())) {
            throw new ReglaNegocioException("Una boleta " + b.getEstado().toLowerCase(Locale.ROOT) + " no puede cambiar de estado.");
        }
        if ("Rechazado".equals(estado)) throw new ReglaNegocioException("Solo el proceso de pago puede rechazar una boleta.");
        if ("Anulado".equals(estado)) {
            // Anular devuelve el stock de los productos que aún existen
            b.getDetalles().stream().filter(d -> d.getProducto() != null)
                    .forEach(d -> d.getProducto().setStock(d.getProducto().getStock() + d.getCantidad()));
        }
        b.setEstado(estado);
        return BoletaDTO.desde(b);
    }

    @Transactional
    public void eliminar(String id) {
        boletas.delete(buscar(id));
    }

    private Boleta buscar(String id) {
        return boletas.findWithDetallesById(id.trim().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new NoEncontradoException("No existe la boleta " + id + "."));
    }

    private static boolean esDelUsuario(Boleta b, Usuario u) {
        return (b.getUsuario() != null && b.getUsuario().getRun().equals(u.getRun()))
                || b.getClienteCorreo().equalsIgnoreCase(u.getCorreo());
    }

    private static boolean vacio(String valor) {
        return valor == null || valor.isBlank();
    }
}
