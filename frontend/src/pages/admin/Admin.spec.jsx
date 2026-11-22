import { fireEvent, screen } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { AdminProductoEditar, AdminProductoMostrar, AdminProductoNuevo, AdminProductos } from "./AdminProductos";
import { AdminUsuarioEditar, AdminUsuarioMostrar, AdminUsuarioNuevo, AdminUsuarios } from "./AdminUsuarios";
import { AdminOrdenDetalle, AdminOrdenes } from "./AdminOrdenes";
import AdminReportes from "./AdminReportes";
import { validarProducto } from "../../components/admin/FormularioProducto";
import { validarUsuario } from "../../components/admin/FormularioUsuario";
import { crearApiFalsa, renderConTienda, USUARIO_ADMIN, USUARIO_VENDEDOR, esperarQue } from "../../test/utilidades";

const comoAdmin = () => crearApiFalsa({ sesion: USUARIO_ADMIN });
const comoVendedor = () => crearApiFalsa({ sesion: USUARIO_VENDEDOR });
const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });

describe("Panel admin: Dashboard y reportes", () => {
  it("muestra los indicadores calculados con los datos de la API", async () => {
    await renderConTienda(<AdminDashboard />, { api: comoAdmin() });
    expect(screen.getByText("¡Hola, Camila!")).toBeTruthy();
    expect(screen.getByText("Productos publicados").previousSibling.textContent).toContain("12");
    expect(screen.getByText("Productos con stock crítico").previousSibling.textContent).toContain("2");
  });

  it("reportes calcula el porcentaje de pagos aprobados", async () => {
    await renderConTienda(<AdminReportes />, { api: comoAdmin() });
    expect(screen.getByText("50%")).toBeTruthy();
    expect(screen.getByText("Resident Evil II")).toBeTruthy();
  });
});

describe("Panel admin: Productos", () => {
  it("lista los productos y filtra con la búsqueda", async () => {
    await renderConTienda(<AdminProductos />, { api: comoAdmin() });
    expect(screen.getAllByRole("row").length).toBe(13); // encabezado + 12
    escribir("Buscar productos", "souls");
    expect(screen.getAllByRole("row").length).toBe(2);
  });

  it("elimina un producto en el backend solo si el usuario confirma (mock de window.confirm)", async () => {
    const confirmar = spyOn(window, "confirm").and.returnValues(false, true);
    const { api } = await renderConTienda(<AdminProductos />, { api: comoAdmin() });
    const eliminar = spyOn(api.productos, "eliminar").and.callThrough();

    fireEvent.click(screen.getByLabelText("Eliminar Minecraft"));
    expect(eliminar).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Eliminar Minecraft"));
    expect(confirmar).toHaveBeenCalledTimes(2);
    expect(eliminar).toHaveBeenCalledWith("GS-011");
    expect(await screen.findByText('Producto "Minecraft" eliminado.')).toBeTruthy();
    expect(api.datos.productos.some((p) => p.codigo === "GS-011")).toBeFalse();
  });

  it("si el backend rechaza la eliminación, muestra el error", async () => {
    spyOn(window, "confirm").and.returnValue(true);
    const { api } = await renderConTienda(<AdminProductos />, { api: comoAdmin() });
    spyOn(api.productos, "eliminar").and.returnValue(Promise.reject(new Error("No tienes permisos para esta acción.")));
    fireEvent.click(screen.getByLabelText("Eliminar Minecraft"));
    expect(await screen.findByText("No tienes permisos para esta acción.")).toBeTruthy();
    expect(screen.getAllByRole("row").length).toBe(13);
  });

  it("un vendedor no ve las acciones de edición", async () => {
    await renderConTienda(<AdminProductos />, { api: comoVendedor() });
    expect(screen.queryByText("+ Nuevo producto")).toBeNull();
    expect(screen.queryAllByText("Editar").length).toBe(0);
    expect(screen.queryAllByLabelText(/^Eliminar/).length).toBe(0);
  });

  it("crea un producto nuevo enviándolo a la API", async () => {
    const { api } = await renderConTienda(<AdminProductoNuevo />, { api: comoAdmin() });
    escribir("Código producto", "gs-050");
    escribir("Nombre", "Silent Hill 2");
    escribir("Precio (CLP)", "25990");
    escribir("Stock", "10");
    fireEvent.change(screen.getByLabelText("Categoría"), { target: { name: "categoria", value: "Terror" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    expect(await screen.findByText("Producto creado correctamente.")).toBeTruthy();
    const creado = api.datos.productos.find((p) => p.codigo === "GS-050");
    expect(creado).toEqual(jasmine.objectContaining({ nombre: "Silent Hill 2", precio: 25990, stock: 10, stockCritico: null }));
  });

  it("muestra el error 409 del backend si el código ya existe", async () => {
    await renderConTienda(<AdminProductoNuevo />, { api: comoAdmin() });
    escribir("Código producto", "GS-001");
    escribir("Nombre", "Duplicado");
    escribir("Precio (CLP)", "1000");
    escribir("Stock", "1");
    fireEvent.change(screen.getByLabelText("Categoría"), { target: { name: "categoria", value: "Indie" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));
    expect(await screen.findByText("Ya existe un producto con el código GS-001.")).toBeTruthy();
  });

  it("edita un producto existente (el código queda de solo lectura)", async () => {
    const { api } = await renderConTienda(<AdminProductoEditar />, { ruta: "/p/GS-003", patron: "/p/:codigo", api: comoAdmin() });
    expect(screen.getByLabelText("Código producto").readOnly).toBeTrue();
    escribir("Stock", "2");
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByText("Producto actualizado correctamente.")).toBeTruthy();
    expect(api.datos.productos.find((p) => p.codigo === "GS-003").stock).toBe(2);
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
  it("filtra usuarios por tipo y no permite eliminarse a sí mismo", async () => {
    await renderConTienda(<AdminUsuarios />, { api: comoAdmin() });
    expect(screen.getByLabelText("Eliminar Camila").disabled).toBeTrue();
    fireEvent.change(screen.getByLabelText("Filtrar por tipo"), { target: { value: "Cliente" } });
    expect(screen.getAllByRole("row").length).toBe(2);
  });

  it("la ficha del usuario muestra su historial de compras", async () => {
    await renderConTienda(<AdminUsuarioMostrar />, { ruta: "/u/203344112", patron: "/u/:run", api: comoAdmin() });
    expect(screen.getByText("ORD-1001")).toBeTruthy();
  });

  it("validarUsuario: en edición la contraseña es opcional", () => {
    const base = { run: "", nombre: "A", apellidos: "B", correo: "a@duoc.cl", contrasena: "", fechaNacimiento: "", tipo: "Cliente", region: "nuble", comuna: "chillan", direccion: "X" };
    expect(validarUsuario(base, true).contrasena).toBe("");
    expect(validarUsuario(base, false).contrasena).not.toBe("");
    expect(validarUsuario({ ...base, fechaNacimiento: "2999-01-01" }, true).fechaNacimiento).toContain("futura");
  });

  it("crea un usuario nuevo desde el formulario del administrador", async () => {
    const { api } = await renderConTienda(<AdminUsuarioNuevo />, { api: comoAdmin() });
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

    expect(await screen.findByText("Usuario creado correctamente.")).toBeTruthy();
    expect(api.datos.usuarios.find((u) => u.run === "111111111")).toEqual(jasmine.objectContaining({ tipo: "Vendedor", contrasena: "clave1", fechaNacimiento: null }));
  });

  it("muestra aviso general si el formulario de usuario tiene errores", async () => {
    await renderConTienda(<AdminUsuarioNuevo />, { api: comoAdmin() });
    fireEvent.click(screen.getByRole("button", { name: "Guardar usuario" }));
    expect(screen.getByText("Revisa los campos marcados en rojo.")).toBeTruthy();
  });

  it("edita un usuario sin enviar contraseña si se deja vacía", async () => {
    const { api } = await renderConTienda(<AdminUsuarioEditar />, { ruta: "/u/203344112", patron: "/u/:run", api: comoAdmin() });
    const actualizar = spyOn(api.usuarios, "actualizar").and.callThrough();
    expect(screen.getByLabelText("RUN (sin puntos ni guion)").readOnly).toBeTrue();
    escribir("Dirección", "Nueva dirección 456");
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByText("Usuario actualizado correctamente.")).toBeTruthy();
    const enviado = actualizar.calls.mostRecent().args[1];
    expect(enviado.direccion).toBe("Nueva dirección 456");
    expect("contrasena" in enviado).toBeFalse();
    expect(api.datos.usuarios.find((u) => u.run === "203344112").contrasena).toBe("cliente1");
  });

  it("elimina un usuario tras confirmar", async () => {
    spyOn(window, "confirm").and.returnValue(true);
    const { api } = await renderConTienda(<AdminUsuarios />, { api: comoAdmin() });
    fireEvent.click(screen.getByLabelText("Eliminar Javiera"));
    await esperarQue(() => !api.datos.usuarios.some((u) => u.run === "203344112"), "!api.datos.usuarios.some((u) => u.run === \"203344112\")");
  });

  it("la ficha del producto muestra sus datos y el precio de oferta", async () => {
    await renderConTienda(<AdminProductoMostrar />, { ruta: "/p/GS-012", patron: "/p/:codigo", api: comoAdmin() });
    expect(screen.getByRole("heading", { name: "Call of Duty Black Ops III" })).toBeTruthy();
    expect(screen.getByText(/40% →/)).toBeTruthy();
  });

  it("rechaza imágenes que superan 500 KB", async () => {
    await renderConTienda(<AdminProductoNuevo />, { api: comoAdmin() });
    const archivo = new File([new Uint8Array(600 * 1024)], "grande.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/Imagen/), { target: { files: [archivo] } });
    expect(screen.getByText("La imagen no puede superar los 500 KB.")).toBeTruthy();
  });

  it("la boleta de una orden inexistente muestra mensaje", async () => {
    await renderConTienda(<AdminOrdenDetalle />, { ruta: "/o/ORD-9", patron: "/o/:id", api: comoAdmin() });
    expect(screen.getByText("Orden no encontrada")).toBeTruthy();
  });

  it("las órdenes se pueden filtrar por estado", async () => {
    await renderConTienda(<AdminOrdenes />, { api: comoAdmin() });
    expect(screen.getAllByRole("row").length).toBe(3);
    fireEvent.change(screen.getByLabelText("Filtrar por estado"), { target: { value: "Rechazado" } });
    expect(screen.getAllByRole("row").length).toBe(2);
    expect(screen.getByText("ORD-1002")).toBeTruthy();
  });

  it("el Administrador cambia el estado de una boleta pagada", async () => {
    const { api } = await renderConTienda(<AdminOrdenDetalle />, { ruta: "/o/ORD-1001", patron: "/o/:id", api: comoAdmin() });
    fireEvent.change(screen.getByLabelText("Cambiar estado"), { target: { value: "Enviado" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar estado" }));
    expect(await screen.findByText("Estado actualizado a Enviado.")).toBeTruthy();
    expect(api.datos.ordenes.find((o) => o.id === "ORD-1001").estado).toBe("Enviado");
  });

  it("el Vendedor ve la boleta pero no puede cambiar su estado", async () => {
    await renderConTienda(<AdminOrdenDetalle />, { ruta: "/o/ORD-1001", patron: "/o/:id", api: comoVendedor() });
    expect(screen.getByText("Boleta ORD-1001")).toBeTruthy();
    expect(screen.queryByLabelText("Cambiar estado")).toBeNull();
  });

  it("una boleta rechazada no ofrece cambio de estado", async () => {
    await renderConTienda(<AdminOrdenDetalle />, { ruta: "/o/ORD-1002", patron: "/o/:id", api: comoAdmin() });
    expect(screen.getByText(/no puede cambiar de estado/)).toBeTruthy();
  });
});
