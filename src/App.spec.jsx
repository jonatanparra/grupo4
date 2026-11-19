import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { TiendaProvider } from "./context/TiendaContext";
import { crearApiFalsa, esperarCarga, USUARIO_ADMIN, USUARIO_VENDEDOR } from "./test/utilidades";
import { useTienda } from "./context/TiendaContext";

function Sonda({ sonda }) {
  sonda.contexto = useTienda();
  return null;
}

/** Renderiza la aplicación completa (todas las rutas) en una URL dada y espera la carga desde la API. */
async function renderApp(ruta, opciones) {
  const sonda = {};
  const api = crearApiFalsa(opciones);
  const resultado = render(
    <MemoryRouter initialEntries={[ruta]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TiendaProvider api={api}>
        <Sonda sonda={sonda} />
        <App />
      </TiendaProvider>
    </MemoryRouter>
  );
  await esperarCarga(sonda);
  return { ...resultado, api };
}

describe("App (flujo de navegación)", () => {
  beforeEach(() => spyOn(window, "scrollTo")); // LayoutTienda vuelve arriba al cambiar de página

  it("Home muestra el hero, las categorías y los productos destacados", async () => {
    await renderApp("/");
    expect(screen.getByRole("heading", { name: /Entra al Glitch/ })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Explora por categoría" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Ofertas del momento" })).toBeTruthy();
  });

  it("si el backend no responde, muestra el error y permite reintentar", async () => {
    await renderApp("/", { errorCatalogo: "No se pudo conectar con el servidor." });
    expect(screen.getByText("No pudimos cargar la información")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeTruthy();
  });

  it("navega desde el menú a Categorías y luego a una categoría", async () => {
    await renderApp("/");
    fireEvent.click(screen.getAllByRole("link", { name: "Categorías" })[0]);
    expect(screen.getByRole("heading", { level: 1, name: "Categorías" })).toBeTruthy();
    fireEvent.click(screen.getAllByRole("link", { name: /Terror/ })[0]);
    expect(screen.getByRole("heading", { level: 1, name: "Terror" })).toBeTruthy();
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("Blogs lista los artículos y abre el detalle", async () => {
    await renderApp("/blogs");
    expect(screen.getAllByText("Ver caso").length).toBe(3);
    fireEvent.click(screen.getAllByText("Ver caso")[1]);
    expect(screen.getByRole("heading", { level: 1, name: /Red Dead Redemption 2/ })).toBeTruthy();
  });

  it("un blog inexistente muestra mensaje de no encontrado", async () => {
    await renderApp("/blogs/no-existe");
    expect(screen.getByText("Artículo no encontrado")).toBeTruthy();
  });

  it("Nosotros presenta al equipo", async () => {
    await renderApp("/nosotros");
    expect(screen.getByText("Jonatan Parra")).toBeTruthy();
  });

  it("una ruta desconocida muestra la página 404", async () => {
    await renderApp("/no-existe");
    expect(screen.getByText(/404/)).toBeTruthy();
  });

  it("el newsletter del pie valida el correo", async () => {
    await renderApp("/");
    const campo = screen.getByLabelText("Correo para newsletter");
    fireEvent.change(campo, { target: { value: "malo@yahoo.com" } });
    fireEvent.click(screen.getByText("Unirme"));
    expect(screen.getByText(/Solo se aceptan/)).toBeTruthy();
    fireEvent.change(campo, { target: { value: "bueno@gmail.com" } });
    fireEvent.click(screen.getByText("Unirme"));
    expect(screen.getByText(/Te avisaremos/)).toBeTruthy();
  });

  it("el panel /admin redirige al login sin sesión", async () => {
    await renderApp("/admin");
    expect(screen.getByRole("heading", { name: "Inicio de sesión" })).toBeTruthy();
  });

  it("Mis compras exige iniciar sesión", async () => {
    await renderApp("/mis-compras");
    expect(screen.getByRole("heading", { name: "Inicio de sesión" })).toBeTruthy();
  });

  it("el administrador navega por todo el panel y puede cerrar sesión", async () => {
    await renderApp("/admin", { sesion: USUARIO_ADMIN });
    expect(screen.getByText("¡Hola, Camila!")).toBeTruthy();
    ["Dashboard", "Órdenes", "Productos", "Stock crítico", "Usuarios", "Reportes"].forEach((seccion) =>
      expect(screen.getByRole("link", { name: new RegExp(seccion) })).toBeTruthy()
    );

    fireEvent.click(screen.getByRole("link", { name: /Órdenes/ }));
    expect(screen.getByRole("heading", { name: "Órdenes" })).toBeTruthy();
    fireEvent.click(screen.getAllByText("Ver boleta")[0]);
    expect(screen.getByRole("heading", { name: /Boleta ORD-/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("link", { name: /Stock crítico/ }));
    expect(screen.getByRole("heading", { name: "Productos con stock crítico" })).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Mostrar menú del panel"));
    fireEvent.click(screen.getByText("Cerrar sesión"));
    expect(screen.getByRole("heading", { name: "Inicio de sesión" })).toBeTruthy();
  });

  describe("Vendedor (Anexo 1: solo productos y órdenes)", () => {
    it("entra directo a Órdenes y solo ve Órdenes y Productos en el menú", async () => {
      await renderApp("/admin", { sesion: USUARIO_VENDEDOR });
      expect(screen.getByRole("heading", { name: "Órdenes" })).toBeTruthy();
      expect(screen.getByRole("link", { name: /Órdenes/ })).toBeTruthy();
      expect(screen.getByRole("link", { name: /Productos/ })).toBeTruthy();
      ["Dashboard", "Stock crítico", "Usuarios", "Reportes"].forEach((seccion) =>
        expect(screen.queryByRole("link", { name: new RegExp(seccion) })).toBeNull()
      );
    });

    it("si escribe la URL de una sección restringida, ve 'Acceso denegado'", async () => {
      for (const ruta of ["/admin/usuarios", "/admin/reportes", "/admin/productos-criticos", "/admin/productos/nuevo", "/admin/productos/GS-001/editar"]) {
        const { unmount } = await renderApp(ruta, { sesion: USUARIO_VENDEDOR });
        expect(screen.getByText("Acceso denegado")).withContext(ruta).toBeTruthy();
        unmount();
      }
    });

    it("puede abrir el detalle de un producto y de una boleta", async () => {
      await renderApp("/admin/productos/GS-001", { sesion: USUARIO_VENDEDOR });
      expect(screen.getByRole("heading", { name: "Hollow Knight" })).toBeTruthy();
      expect(screen.queryByRole("link", { name: "Editar" })).toBeNull();
    });
  });
});
