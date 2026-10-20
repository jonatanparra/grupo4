import { fireEvent, screen } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { AdminProductoEditar, AdminProductoMostrar, AdminProductoNuevo, AdminProductos } from "./AdminProductos";
import { AdminUsuarioEditar, AdminUsuarioMostrar, AdminUsuarioNuevo, AdminUsuarios } from "./AdminUsuarios";
import { AdminOrdenDetalle, AdminOrdenes } from "./AdminOrdenes";
import AdminReportes from "./AdminReportes";
import { validarProducto } from "../../components/admin/FormularioProducto";
import { validarUsuario } from "../../components/admin/FormularioUsuario";
import { crearServiciosPrueba, renderConTienda, USUARIO_ADMIN } from "../../test/utilidades";

const comoAdmin = () => crearServiciosPrueba({ sesion: USUARIO_ADMIN });
const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });

describe("Panel admin: Dashboard y reportes", () => {
  it("muestra los indicadores calculados con los datos", () => {
    renderConTienda(<AdminDashboard />, { servicios: comoAdmin() });
    expect(screen.getByText("¡Hola, Camila!")).toBeTruthy();
    expect(screen.getByText("Productos publicados").previousSibling.textContent).toContain("12");
    expect(screen.getByText("Productos con stock crítico").previousSibling.textContent).toContain("2");
  });

  it("reportes calcula el porcentaje de pagos aprobados", () => {
    renderConTienda(<AdminReportes />, { servicios: comoAdmin() });
    expect(screen.getByText("50%")).toBeTruthy();
    expect(screen.getByText("Resident Evil II")).toBeTruthy();
  });
});

describe("Panel admin: Productos", () => {
  it("lista los productos y filtra con la búsqueda", () => {
    renderConTienda(<AdminProductos />, { servicios: comoAdmin() });
    expect(screen.getAllByRole("row").length).toBe(13); // encabezado + 12
    escribir("Buscar productos", "souls");
    expect(screen.getAllByRole("row").length).toBe(2);
  });

  it("elimina un producto solo si el usuario confirma (mock de window.confirm)", () => {
    const confirmar = spyOn(window, "confirm").and.returnValues(false, true);
    const { servicios } = renderConTienda(<AdminProductos />, { servicios: comoAdmin() });

    fireEvent.click(screen.getByLabelText("Eliminar Minecraft"));
    expect(servicios.productosDB.obtener("GS-011")).not.toBeNull();

    fireEvent.click(screen.getByLabelText("Eliminar Minecraft"));
    expect(confirmar).toHaveBeenCalledTimes(2);
    expect(servicios.productosDB.obtener("GS-011")).toBeNull();
    expect(screen.getByText('Producto "Minecraft" eliminado.')).toBeTruthy();
  });

  it("un vendedor no ve las acciones de edición", () => {
    const servicios = crearServiciosPrueba({ sesion: { ...USUARIO_ADMIN, tipo: "Vendedor" } });
    renderConTienda(<AdminProductos />, { servicios });
    expect(screen.queryByText("+ Nuevo producto")).toBeNull();
    expect(screen.queryAllByText("Editar").length).toBe(0);
  });

  it("crea un producto nuevo desde el formulario", () => {
    const { servicios } = renderConTienda(<AdminProductoNuevo />, { servicios: comoAdmin() });
    escribir("Código producto", "gs-050");
    escribir("Nombre", "Silent Hill 2");
    escribir("Precio (CLP)", "25990");
    escribir("Stock", "10");
    fireEvent.change(screen.getByLabelText("Categoría"), { target: { name: "categoria", value: "Terror" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    expect(screen.getByText("Producto creado correctamente.")).toBeTruthy();
    const creado = servicios.productosDB.obtener("GS-050");
    expect(creado).toEqual(jasmine.objectContaining({ nombre: "Silent Hill 2", precio: 25990, stock: 10, stockCritico: null }));
  });

  it("no crea el producto si el código ya existe", () => {
    renderConTienda(<AdminProductoNuevo />, { servicios: comoAdmin() });
    escribir("Código producto", "GS-001");
    escribir("Nombre", "Duplicado");
    escribir("Precio (CLP)", "1000");
    escribir("Stock", "1");
    fireEvent.change(screen.getByLabelText("Categoría"), { target: { name: "categoria", value: "Indie" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));
    expect(screen.getByText("Ya existe un producto con el código GS-001.")).toBeTruthy();
  });

  it("edita un producto existente (el código queda de solo lectura)", () => {
    const { servicios } = renderConTienda(<AdminProductoEditar />, { ruta: "/p/GS-003", patron: "/p/:codigo", servicios: comoAdmin() });
    expect(screen.getByLabelText("Código producto").readOnly).toBeTrue();
    escribir("Stock", "2");
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(servicios.productosDB.obtener("GS-003").stock).toBe(2);
  });

  it("validarProducto aplica las reglas de negocio", () => {
    const errores = validarProducto({ codigo: "ab", nombre: "", descripcion: "", precio: "-5", descuento: "95", categoria: "", stock: "1.5", stockCritico: "" });
    expect(errores.codigo).toContain("al menos 3");
    expect(errores.nombre).not.toBe("");
    expect(errores.precio).toContain("menor a 0");
    expect(errores.descuento).toContain("mayor a 90");
    expect(errores.stock).toContain("entero");
    expect(errores.stockCritico).toBe("");
  });
});

describe("Panel admin: Usuarios y órdenes", () => {
  it("filtra usuarios por tipo y no permite eliminarse a sí mismo", () => {
    renderConTienda(<AdminUsuarios />, { servicios: comoAdmin() });
    expect(screen.getByLabelText("Eliminar Camila").disabled).toBeTrue();
    fireEvent.change(screen.getByLabelText("Filtrar por tipo"), { target: { value: "Cliente" } });
    expect(screen.getAllByRole("row").length).toBe(2);
  });

  it("la ficha del usuario muestra su historial de compras", () => {
    renderConTienda(<AdminUsuarioMostrar />, { ruta: "/u/203344112", patron: "/u/:run", servicios: comoAdmin() });
    expect(screen.getByText("ORD-1001")).toBeTruthy();
  });

  it("validarUsuario: en edición la contraseña es opcional", () => {
    const base = { run: "", nombre: "A", apellidos: "B", correo: "a@duoc.cl", contrasena: "", fechaNacimiento: "", tipo: "Cliente", region: "nuble", comuna: "chillan", direccion: "X" };
    expect(validarUsuario(base, true).contrasena).toBe("");
    expect(validarUsuario(base, false).contrasena).not.toBe("");
    expect(validarUsuario({ ...base, fechaNacimiento: "2999-01-01" }, true).fechaNacimiento).toContain("futura");
  });

  it("crea un usuario nuevo desde el formulario del administrador", () => {
    const { servicios } = renderConTienda(<AdminUsuarioNuevo />, { servicios: comoAdmin() });
    escribir("RUN (sin puntos ni guion)", "111111111");
    escribir("Nombre", "Pedro");
    escribir("Apellidos", "Soto");
    escribir("Correo", "pedro.soto@duoc.cl");
    escribir("Contraseña", "clave1");
    fireEvent.change(screen.getByLabelText("Tipo de usuario"), { target: { name: "tipo", value: "Vendedor" } });
    fireEvent.change(screen.getByLabelText("Región"), { target: { name: "region", value: "nuble" } });
    fireEvent.change(screen.getByLabelText("Comuna"), { target: { name: "comuna", value: "bulnes" } });
    escribir("Dirección", "Calle 1");
    fireEvent.click(screen.getByRole("button", { name: "Guardar usuario" }));

    expect(screen.getByText("Usuario creado correctamente.")).toBeTruthy();
    expect(servicios.usuariosDB.obtener("111111111")).toEqual(jasmine.objectContaining({ tipo: "Vendedor", contrasena: "clave1" }));
  });

  it("muestra aviso general si el formulario de usuario tiene errores", () => {
    renderConTienda(<AdminUsuarioNuevo />, { servicios: comoAdmin() });
    fireEvent.click(screen.getByRole("button", { name: "Guardar usuario" }));
    expect(screen.getByText("Revisa los campos marcados en rojo.")).toBeTruthy();
  });

  it("edita un usuario manteniendo su contraseña si se deja vacía", () => {
    const { servicios } = renderConTienda(<AdminUsuarioEditar />, { ruta: "/u/203344112", patron: "/u/:run", servicios: comoAdmin() });
    expect(screen.getByLabelText("RUN (sin puntos ni guion)").readOnly).toBeTrue();
    escribir("Dirección", "Nueva dirección 456");
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    const editado = servicios.usuariosDB.obtener("203344112");
    expect(editado.direccion).toBe("Nueva dirección 456");
    expect(editado.contrasena).toBe("cliente1");
  });

  it("elimina un usuario tras confirmar", () => {
    spyOn(window, "confirm").and.returnValue(true);
    const { servicios } = renderConTienda(<AdminUsuarios />, { servicios: comoAdmin() });
    fireEvent.click(screen.getByLabelText("Eliminar Javiera"));
    expect(servicios.usuariosDB.obtener("203344112")).toBeNull();
  });

  it("la ficha del producto muestra sus datos y el precio de oferta", () => {
    renderConTienda(<AdminProductoMostrar />, { ruta: "/p/GS-012", patron: "/p/:codigo", servicios: comoAdmin() });
    expect(screen.getByRole("heading", { name: "Call of Duty Black Ops III" })).toBeTruthy();
    expect(screen.getByText(/40% →/)).toBeTruthy();
  });

  it("rechaza imágenes que superan 500 KB", () => {
    renderConTienda(<AdminProductoNuevo />, { servicios: comoAdmin() });
    const archivo = new File([new Uint8Array(600 * 1024)], "grande.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/Imagen/), { target: { files: [archivo] } });
    expect(screen.getByText("La imagen no puede superar los 500 KB.")).toBeTruthy();
  });

  it("la boleta de una orden inexistente muestra mensaje", () => {
    renderConTienda(<AdminOrdenDetalle />, { ruta: "/o/ORD-9", patron: "/o/:id", servicios: comoAdmin() });
    expect(screen.getByText("Orden no encontrada")).toBeTruthy();
  });

  it("las órdenes se pueden filtrar por estado", () => {
    renderConTienda(<AdminOrdenes />, { servicios: comoAdmin() });
    expect(screen.getAllByRole("row").length).toBe(3);
    fireEvent.change(screen.getByLabelText("Filtrar por estado"), { target: { value: "Rechazado" } });
    expect(screen.getAllByRole("row").length).toBe(2);
    expect(screen.getByText("ORD-1002")).toBeTruthy();
  });
});
