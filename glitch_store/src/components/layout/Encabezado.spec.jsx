import { fireEvent, screen } from "@testing-library/react";
import Encabezado from "./Encabezado";
import RutaProtegida from "../common/RutaProtegida";
import { crearServiciosPrueba, renderConTienda, USUARIO_ADMIN, USUARIO_CLIENTE } from "../../test/utilidades";

describe("Encabezado", () => {
  it("abre y cierra el menú móvil (estado menuAbierto)", () => {
    renderConTienda(<Encabezado />);
    const boton = screen.getByLabelText("Abrir menú");
    const menu = document.getElementById("menu-principal");
    expect(menu.classList.contains("show")).toBeFalse();

    fireEvent.click(boton);
    expect(menu.classList.contains("show")).toBeTrue();
    expect(boton.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(screen.getByText("Ofertas"));
    expect(menu.classList.contains("show")).toBeFalse();
  });

  it("muestra la cantidad total de productos del carrito", () => {
    const servicios = crearServiciosPrueba({ carrito: [{ codigo: "GS-001", cantidad: 2 }, { codigo: "GS-002", cantidad: 1 }] });
    renderConTienda(<Encabezado />, { servicios });
    expect(screen.getByTestId("contador-carrito").textContent).toBe("3");
  });

  it("sin sesión muestra los enlaces de login y registro", () => {
    renderConTienda(<Encabezado />);
    expect(screen.getByText("Iniciar sesión")).toBeTruthy();
    expect(screen.getByText("Registrarse")).toBeTruthy();
  });

  it("con sesión de cliente saluda y no muestra el panel admin", () => {
    renderConTienda(<Encabezado />, { servicios: crearServiciosPrueba({ sesion: USUARIO_CLIENTE }) });
    expect(screen.getByText("Hola, Javiera")).toBeTruthy();
    expect(screen.queryByText("Panel admin")).toBeNull();
  });

  it("con sesión de administrador muestra el panel y permite cerrar sesión", () => {
    renderConTienda(<Encabezado />, { servicios: crearServiciosPrueba({ sesion: USUARIO_ADMIN }) });
    expect(screen.getByText("Panel admin")).toBeTruthy();
    fireEvent.click(screen.getByText("Cerrar sesión"));
    expect(screen.getByText("Iniciar sesión")).toBeTruthy();
  });
});

describe("RutaProtegida", () => {
  it("redirige al login si no hay sesión", () => {
    renderConTienda(<RutaProtegida roles={["Administrador"]}><p>Secreto</p></RutaProtegida>, { ruta: "/admin", patron: "/admin" });
    expect(screen.queryByText("Secreto")).toBeNull();
    expect(screen.getByTestId("ubicacion").textContent).toBe("/login");
  });

  it("redirige al inicio si el rol no está permitido", () => {
    renderConTienda(<RutaProtegida roles={["Administrador"]}><p>Secreto</p></RutaProtegida>, {
      ruta: "/admin",
      patron: "/admin",
      servicios: crearServiciosPrueba({ sesion: USUARIO_CLIENTE }),
    });
    expect(screen.getByTestId("ubicacion").textContent).toBe("/");
  });

  it("muestra el contenido si el rol está permitido", () => {
    renderConTienda(<RutaProtegida roles={["Administrador"]}><p>Secreto</p></RutaProtegida>, {
      ruta: "/admin",
      patron: "/admin",
      servicios: crearServiciosPrueba({ sesion: USUARIO_ADMIN }),
    });
    expect(screen.getByText("Secreto")).toBeTruthy();
  });
});
