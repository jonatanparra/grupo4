import { fireEvent, screen } from "@testing-library/react";
import Login from "./Login";
import Registro from "./Registro";
import Contacto from "./Contacto";
import { renderConTienda } from "../test/utilidades";

const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });

describe("Página Login", () => {
  it("muestra errores de validación al enviar vacío", () => {
    renderConTienda(<Login />, { ruta: "/login", patron: "/login" });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(screen.getByText("Ingresa un correo electrónico.")).toBeTruthy();
    expect(screen.getByText("Falta completar: la contraseña.")).toBeTruthy();
  });

  it("el mensaje de credenciales incorrectas solo aparece cuando fallan", () => {
    renderConTienda(<Login />, { ruta: "/login", patron: "/login" });
    expect(screen.queryByText("Correo o contraseña incorrectos.")).toBeNull();
    escribir("Correo", "camila.rojas@duoc.cl");
    escribir("Contraseña", "otra1234");
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(screen.getByText("Correo o contraseña incorrectos.")).toBeTruthy();
  });

  it("un administrador que inicia sesión es enviado al panel /admin", () => {
    renderConTienda(<Login />, { ruta: "/login", patron: "/login" });
    escribir("Correo", "camila.rojas@duoc.cl");
    escribir("Contraseña", "admin123");
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(screen.getByTestId("ubicacion").textContent).toBe("/admin");
  });

  it("un cliente que inicia sesión vuelve a la tienda", () => {
    renderConTienda(<Login />, { ruta: "/login", patron: "/login" });
    escribir("Correo", "javiera.contreras@profesor.duoc.cl");
    escribir("Contraseña", "cliente1");
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(screen.getByTestId("ubicacion").textContent).toBe("/");
  });
});

describe("Página Registro", () => {
  function completarFormulario(run = "111111111") {
    escribir("RUN (sin puntos ni guion)", run);
    escribir("Nombre", "Ana");
    escribir("Apellidos", "Pérez Soto");
    escribir("Correo", "ana.perez@gmail.com");
    escribir("Contraseña", "clave12");
    escribir("Confirmar contraseña", "clave12");
    fireEvent.change(screen.getByLabelText("Región"), { target: { name: "region", value: "nuble" } });
    fireEvent.change(screen.getByLabelText("Comuna"), { target: { name: "comuna", value: "chillan" } });
    escribir("Dirección", "Calle 123");
  }

  beforeEach(() => spyOn(window, "scrollTo")); // mock: evita el scroll real del navegador

  it("valida el RUN y la confirmación de contraseña en vivo", () => {
    renderConTienda(<Registro />);
    escribir("RUN (sin puntos ni guion)", "123456789");
    expect(screen.getByText(/dígito verificador/)).toBeTruthy();
    escribir("Contraseña", "abcd");
    escribir("Confirmar contraseña", "abce");
    expect(screen.getByText("Las contraseñas no coinciden.")).toBeTruthy();
  });

  it("al elegir región se cargan sus comunas", () => {
    renderConTienda(<Registro />);
    const comuna = screen.getByLabelText("Comuna");
    expect(comuna.disabled).toBeTrue();
    fireEvent.change(screen.getByLabelText("Región"), { target: { name: "region", value: "araucania" } });
    expect(comuna.disabled).toBeFalse();
    expect(screen.getByRole("option", { name: "Temuco" })).toBeTruthy();
  });

  it("registra al usuario como Cliente en la base de datos", () => {
    const { servicios } = renderConTienda(<Registro />);
    completarFormulario();
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(screen.getByText(/Cuenta creada correctamente/)).toBeTruthy();
    const creado = servicios.usuariosDB.obtener("111111111");
    expect(creado.tipo).toBe("Cliente");
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("muestra error si el RUN ya está registrado", () => {
    renderConTienda(<Registro />);
    completarFormulario("203344112"); // RUN que ya existe en los datos semilla
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(screen.getByText("Ya existe un usuario con ese RUN.")).toBeTruthy();
  });
});

describe("Página Contacto", () => {
  it("actualiza el contador de caracteres al escribir el mensaje", () => {
    renderConTienda(<Contacto />);
    escribir("Mensaje", "Hola Glitch");
    expect(screen.getByText("11 / 500 caracteres")).toBeTruthy();
  });

  it("el correo es opcional pero, si se escribe, debe ser válido", () => {
    renderConTienda(<Contacto />);
    escribir("Nombre completo", "Ana");
    escribir("Mensaje", "Consulta");
    escribir(/^Correo/, "ana@yahoo.com");
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    expect(screen.getByText(/Solo se aceptan/)).toBeTruthy();
    expect(screen.queryByText(/Gracias/)).toBeNull();
  });

  it("muestra confirmación y limpia el formulario al enviar correctamente", () => {
    renderConTienda(<Contacto />);
    escribir("Nombre completo", "Ana");
    escribir("Mensaje", "Consulta");
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    expect(screen.getByText(/Gracias/)).toBeTruthy();
    expect(screen.getByLabelText("Nombre completo").value).toBe("");
  });
});
