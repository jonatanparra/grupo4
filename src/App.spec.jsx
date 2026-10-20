import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { TiendaProvider } from "./context/TiendaContext";
import { crearServiciosPrueba, USUARIO_ADMIN } from "./test/utilidades";

/** Renderiza la aplicación completa (todas las rutas) en una URL dada. */
function renderApp(ruta, opciones) {
  return render(
    <MemoryRouter initialEntries={[ruta]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TiendaProvider servicios={crearServiciosPrueba(opciones)}>
        <App />
      </TiendaProvider>
    </MemoryRouter>
  );
}

describe("App (flujo de navegación)", () => {
  beforeEach(() => spyOn(window, "scrollTo")); // LayoutTienda vuelve arriba al cambiar de página

  it("Home muestra el hero, las categorías y los productos destacados", () => {
    renderApp("/");
    expect(screen.getByRole("heading", { name: /Entra al Glitch/ })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Explora por categoría" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Ofertas del momento" })).toBeTruthy();
  });

  it("navega desde el menú a Categorías y luego a una categoría", () => {
    renderApp("/");
    fireEvent.click(screen.getAllByRole("link", { name: "Categorías" })[0]);
    expect(screen.getByRole("heading", { level: 1, name: "Categorías" })).toBeTruthy();
    fireEvent.click(screen.getAllByRole("link", { name: /Terror/ })[0]);
    expect(screen.getByRole("heading", { level: 1, name: "Terror" })).toBeTruthy();
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("Blogs lista los artículos y abre el detalle", () => {
    renderApp("/blogs");
    expect(screen.getAllByText("Ver caso").length).toBe(3);
    fireEvent.click(screen.getAllByText("Ver caso")[1]);
    expect(screen.getByRole("heading", { level: 1, name: /Red Dead Redemption 2/ })).toBeTruthy();
  });

  it("un blog inexistente muestra mensaje de no encontrado", () => {
    renderApp("/blogs/no-existe");
    expect(screen.getByText("Artículo no encontrado")).toBeTruthy();
  });

  it("Nosotros presenta al equipo", () => {
    renderApp("/nosotros");
    expect(screen.getByText("Jonatan Parra")).toBeTruthy();
  });

  it("una ruta desconocida muestra la página 404", () => {
    renderApp("/no-existe");
    expect(screen.getByText(/404/)).toBeTruthy();
  });

  it("el newsletter del pie valida el correo", () => {
    renderApp("/");
    const campo = screen.getByLabelText("Correo para newsletter");
    fireEvent.change(campo, { target: { value: "malo@yahoo.com" } });
    fireEvent.click(screen.getByText("Unirme"));
    expect(screen.getByText(/Solo se aceptan/)).toBeTruthy();
    fireEvent.change(campo, { target: { value: "bueno@gmail.com" } });
    fireEvent.click(screen.getByText("Unirme"));
    expect(screen.getByText(/Te avisaremos/)).toBeTruthy();
  });

  it("el panel /admin redirige al login sin sesión", () => {
    renderApp("/admin");
    expect(screen.getByRole("heading", { name: "Inicio de sesión" })).toBeTruthy();
  });

  it("el administrador navega por el panel y puede cerrar sesión", () => {
    renderApp("/admin", { sesion: USUARIO_ADMIN });
    expect(screen.getByText("¡Hola, Camila!")).toBeTruthy();

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

  it("un vendedor no ve la sección Usuarios del panel", () => {
    renderApp("/admin", { sesion: { ...USUARIO_ADMIN, tipo: "Vendedor" } });
    expect(screen.queryByRole("link", { name: /Usuarios/ })).toBeNull();
  });
});
