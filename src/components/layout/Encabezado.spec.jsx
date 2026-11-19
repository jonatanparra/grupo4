import { fireEvent, screen } from "@testing-library/react";
import Encabezado from "./Encabezado";
import RutaProtegida from "../common/RutaProtegida";
import { crearApiFalsa, renderConTienda, USUARIO_ADMIN, USUARIO_CLIENTE } from "../../test/utilidades";

describe("Encabezado", () => {
  it("abre y cierra el menú móvil (estado menuAbierto)", async () => {
    await renderConTienda(<Encabezado />);
    const boton = screen.getByLabelText("Abrir menú");
    const menu = document.getElementById("menu-principal");
    expect(menu.classList.contains("show")).toBeFalse();

    fireEvent.click(boton);
    expect(menu.classList.contains("show")).toBeTrue();
    expect(boton.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(screen.getByText("Ofertas"));
    expect(menu.classList.contains("show")).toBeFalse();
  });

  it("muestra la cantidad total de productos del carrito", async () => {
    const api = crearApiFalsa({ carrito: [{ codigo: "GS-001", cantidad: 2 }, { codigo: "GS-002", cantidad: 1 }] });
    await renderConTienda(<Encabezado />, { api });
    expect(screen.getByTestId("contador-carrito").textContent).toBe("3");
  });

  it("sin sesión muestra los enlaces de login y registro", async () => {
    await renderConTienda(<Encabezado />);
    expect(screen.getByText("Iniciar sesión")).toBeTruthy();
    expect(screen.getByText("Registrarse")).toBeTruthy();
    expect(screen.queryByText("Mis compras")).toBeNull();
  });

  it("con sesión de cliente saluda, ofrece sus compras y no muestra el panel admin", async () => {
    await renderConTienda(<Encabezado />, { api: crearApiFalsa({ sesion: USUARIO_CLIENTE }) });
    expect(screen.getByText("Hola, Javiera")).toBeTruthy();
    expect(screen.getByText("Mis compras")).toBeTruthy();
    expect(screen.queryByText("Panel admin")).toBeNull();
  });

  it("con sesión de administrador muestra el panel y al cerrar sesión borra los tokens", async () => {
    const { api } = await renderConTienda(<Encabezado />, { api: crearApiFalsa({ sesion: USUARIO_ADMIN }) });
    expect(screen.getByText("Panel admin")).toBeTruthy();
    fireEvent.click(screen.getByText("Cerrar sesión"));
    expect(screen.getByText("Iniciar sesión")).toBeTruthy();
    expect(api.tokens.leer()).toBeNull();
  });
});

describe("RutaProtegida (restricción de acceso por rol)", () => {
  const protegida = <RutaProtegida roles={["Administrador"]}><p>Secreto</p></RutaProtegida>;

  it("redirige al login si no hay sesión", async () => {
    await renderConTienda(protegida, { ruta: "/admin", patron: "/admin" });
    expect(screen.queryByText("Secreto")).toBeNull();
    expect(screen.getByTestId("ubicacion").textContent).toBe("/login");
  });

  it("muestra 'Acceso denegado' si el rol no está permitido", async () => {
    await renderConTienda(protegida, { ruta: "/admin", patron: "/admin", api: crearApiFalsa({ sesion: USUARIO_CLIENTE }) });
    expect(screen.queryByText("Secreto")).toBeNull();
    expect(screen.getByText("Acceso denegado")).toBeTruthy();
    expect(screen.getByText(/Tu perfil \(Cliente\)/)).toBeTruthy();
  });

  it("muestra el contenido si el rol está permitido", async () => {
    await renderConTienda(protegida, { ruta: "/admin", patron: "/admin", api: crearApiFalsa({ sesion: USUARIO_ADMIN }) });
    expect(screen.getByText("Secreto")).toBeTruthy();
  });

  it("si los tokens guardados ya no son válidos, la sesión no se restaura y pide login", async () => {
    const api = crearApiFalsa({ sesion: USUARIO_ADMIN });
    spyOn(api.auth, "perfil").and.returnValue(Promise.reject(new Error("Token inválido.")));
    await renderConTienda(protegida, { ruta: "/admin", patron: "/admin", api });
    expect(screen.queryByText("Secreto")).toBeNull();
    expect(screen.getByTestId("ubicacion").textContent).toBe("/login");
    expect(api.tokens.leer()).toBeNull();
  });
});
