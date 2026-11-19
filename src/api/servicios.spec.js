import { crearApi } from "./servicios";
import { crearAlmacenamientoFalso } from "../test/apiFalsa";

/** Registra cada petición que haría la app y responde 200 con el cuerpo indicado. */
function preparar(cuerpo = {}) {
  const peticiones = [];
  const fetchFalso = (url, opciones) => {
    peticiones.push({ metodo: opciones.method, ruta: url.replace("http://api", ""), cuerpo: opciones.body ? JSON.parse(opciones.body) : undefined });
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(cuerpo) });
  };
  const almacen = crearAlmacenamientoFalso();
  const api = crearApi({ baseUrl: "http://api", almacenamiento: almacen, fetchImpl: fetchFalso });
  return { api, peticiones, almacen };
}

describe("Servicios de la API (endpoints REST versionados)", () => {
  it("cada servicio llama al método y ruta correctos", async () => {
    const { api, peticiones } = preparar([]);
    await api.productos.listar();
    await api.productos.crear({ codigo: "GS-100" });
    await api.productos.actualizar("GS-100", { nombre: "X" });
    await api.productos.eliminar("GS-100");
    await api.categorias.listar();
    await api.usuarios.listar();
    await api.usuarios.crear({ run: "1" });
    await api.usuarios.actualizar("1", {});
    await api.usuarios.eliminar("1");
    await api.boletas.listar();
    await api.boletas.mias();
    await api.boletas.obtener("ORD-1001");
    await api.boletas.comprar({ items: [] });
    await api.boletas.cambiarEstado("ORD-1001", "Enviado");
    await api.auth.perfil();

    expect(peticiones.map((p) => `${p.metodo} ${p.ruta}`)).toEqual([
      "GET /v1/productos",
      "POST /v1/productos",
      "PUT /v1/productos/GS-100",
      "DELETE /v1/productos/GS-100",
      "GET /v1/categorias",
      "GET /v1/usuarios",
      "POST /v1/usuarios",
      "PUT /v1/usuarios/1",
      "DELETE /v1/usuarios/1",
      "GET /v1/boletas",
      "GET /v1/boletas/mias",
      "GET /v1/boletas/ORD-1001",
      "POST /v1/boletas",
      "PUT /v1/boletas/ORD-1001/estado",
      "GET /v1/auth/me",
    ]);
    expect(peticiones.at(-2).cuerpo).toEqual({ estado: "Enviado" });
  });

  it("los códigos se codifican en la URL", async () => {
    const { api, peticiones } = preparar();
    await api.productos.eliminar("GS 1/2");
    expect(peticiones[0].ruta).toBe("/v1/productos/GS%201%2F2");
  });

  it("login guarda los tokens, devuelve el usuario y cerrar sesión los borra", async () => {
    const { api, peticiones, almacen } = preparar({ accessToken: "A", refreshToken: "R", usuario: { nombre: "Camila", tipo: "Administrador" } });
    expect(api.auth.haySesion()).toBeFalse();

    const usuario = await api.auth.iniciarSesion("  camila.rojas@duoc.cl ", "admin123");

    expect(peticiones[0]).toEqual({ metodo: "POST", ruta: "/v1/auth/login", cuerpo: { correo: "camila.rojas@duoc.cl", contrasena: "admin123" } });
    expect(usuario.nombre).toBe("Camila");
    expect(api.auth.haySesion()).toBeTrue();
    expect(JSON.parse(almacen.getItem("glitch_sesion"))).toEqual({ accessToken: "A", refreshToken: "R" });

    api.auth.cerrarSesion();
    expect(api.auth.haySesion()).toBeFalse();
  });

  it("registro crea la cuenta y deja la sesión iniciada", async () => {
    const { api, peticiones } = preparar({ accessToken: "A", refreshToken: "R", usuario: { nombre: "Ana", tipo: "Cliente" } });
    const usuario = await api.auth.registrar({ run: "111111111" });
    expect(peticiones[0].ruta).toBe("/v1/auth/registro");
    expect(usuario.tipo).toBe("Cliente");
    expect(api.auth.haySesion()).toBeTrue();
  });

  it("avisa a los suscriptores cuando la sesión expira y se puede desuscribir", async () => {
    const almacen = crearAlmacenamientoFalso({ glitch_sesion: JSON.stringify({ accessToken: "VENCIDO", refreshToken: "R-VENCIDO" }) });
    const fetchFalso = () => Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ mensaje: "Token inválido." }) });
    const api = crearApi({ baseUrl: "http://api", almacenamiento: almacen, fetchImpl: fetchFalso });
    const aviso = jasmine.createSpy("aviso");
    const desuscribir = api.alExpirarSesion(aviso);

    await expectAsync(api.auth.perfil()).toBeRejected();
    expect(aviso).toHaveBeenCalledTimes(1);

    desuscribir();
    almacen.setItem("glitch_sesion", JSON.stringify({ accessToken: "VENCIDO", refreshToken: "R" }));
    await expectAsync(api.boletas.mias()).toBeRejected();
    expect(aviso).toHaveBeenCalledTimes(1);
  });
});
