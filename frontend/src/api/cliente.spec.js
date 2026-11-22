import { crearClienteApi, ErrorApi } from "./cliente";
import { crearAlmacenSesion, crearValor } from "./almacenamiento";
import { crearAlmacenamientoFalso } from "../test/apiFalsa";

/** Respuesta HTTP simulada (lo que devuelve fetch). */
function respuestaHttp(status, cuerpo) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => (cuerpo === undefined ? Promise.reject(new Error("sin cuerpo")) : Promise.resolve(cuerpo)) });
}

function preparar(tokens) {
  const sesion = crearAlmacenSesion(crearAlmacenamientoFalso());
  if (tokens) sesion.guardar(tokens);
  const fetchFalso = jasmine.createSpy("fetch");
  const alCerrarSesion = jasmine.createSpy("alCerrarSesion");
  const http = crearClienteApi({ baseUrl: "http://api", sesion, fetchImpl: fetchFalso, alCerrarSesion });
  return { sesion, fetchFalso, alCerrarSesion, http };
}

describe("Cliente HTTP de la API (fetch simulado)", () => {
  it("envía el token de acceso en el header Authorization", async () => {
    const { http, fetchFalso } = preparar({ accessToken: "A1", refreshToken: "R1" });
    fetchFalso.and.returnValue(respuestaHttp(200, [{ codigo: "GS-001" }]));

    const datos = await http.get("/v1/productos");

    expect(datos).toEqual([{ codigo: "GS-001" }]);
    const [url, opciones] = fetchFalso.calls.mostRecent().args;
    expect(url).toBe("http://api/v1/productos");
    expect(opciones.headers.Authorization).toBe("Bearer A1");
  });

  it("sin sesión no envía Authorization y serializa el cuerpo como JSON", async () => {
    const { http, fetchFalso } = preparar();
    fetchFalso.and.returnValue(respuestaHttp(201, { id: "ORD-1003" }));

    await http.post("/v1/boletas", { items: [] });

    const [, opciones] = fetchFalso.calls.mostRecent().args;
    expect(opciones.headers.Authorization).toBeUndefined();
    expect(opciones.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(opciones.body)).toEqual({ items: [] });
  });

  it("si el token venció (401), lo renueva con el refresh token y repite la petición", async () => {
    const { http, fetchFalso, sesion } = preparar({ accessToken: "VENCIDO", refreshToken: "R1" });
    fetchFalso.and.callFake((url, opciones) => {
      if (url.endsWith("/auth/refresh")) return respuestaHttp(200, { accessToken: "NUEVO", refreshToken: "R2" });
      return opciones.headers.Authorization === "Bearer NUEVO" ? respuestaHttp(200, { nombre: "Camila" }) : respuestaHttp(401, { mensaje: "La sesión expiró" });
    });

    const perfil = await http.get("/v1/auth/me");

    expect(perfil.nombre).toBe("Camila");
    expect(sesion.leer()).toEqual({ accessToken: "NUEVO", refreshToken: "R2" });
    expect(fetchFalso.calls.count()).toBe(3); // 401 → refresh → reintento
  });

  it("varias peticiones con el token vencido comparten una sola renovación", async () => {
    const { http, fetchFalso } = preparar({ accessToken: "VENCIDO", refreshToken: "R1" });
    fetchFalso.and.callFake((url, opciones) => {
      if (url.endsWith("/auth/refresh")) return respuestaHttp(200, { accessToken: "NUEVO", refreshToken: "R2" });
      return opciones.headers.Authorization === "Bearer NUEVO" ? respuestaHttp(200, []) : respuestaHttp(401, {});
    });

    await Promise.all([http.get("/v1/usuarios"), http.get("/v1/boletas")]);

    const renovaciones = fetchFalso.calls.allArgs().filter(([url]) => url.endsWith("/auth/refresh"));
    expect(renovaciones.length).toBe(1);
  });

  it("si la renovación falla, borra la sesión y avisa a la app", async () => {
    const { http, fetchFalso, sesion, alCerrarSesion } = preparar({ accessToken: "VENCIDO", refreshToken: "R-VENCIDO" });
    fetchFalso.and.callFake((url) => respuestaHttp(401, { mensaje: url.endsWith("/auth/refresh") ? "Inicia sesión nuevamente." : "La sesión expiró" }));

    await expectAsync(http.get("/v1/auth/me")).toBeRejectedWith(jasmine.objectContaining({ estado: 401 }));
    expect(sesion.leer()).toBeNull();
    expect(alCerrarSesion).toHaveBeenCalledTimes(1);
  });

  it("un 401 sin sesión (login fallido) no intenta renovar", async () => {
    const { http, fetchFalso, alCerrarSesion } = preparar();
    fetchFalso.and.returnValue(respuestaHttp(401, { mensaje: "Correo o contraseña incorrectos." }));

    await expectAsync(http.post("/v1/auth/login", {})).toBeRejectedWithError(ErrorApi, "Correo o contraseña incorrectos.");
    expect(fetchFalso.calls.count()).toBe(1);
    expect(alCerrarSesion).not.toHaveBeenCalled();
  });

  it("convierte los errores de validación (400) en ErrorApi con los campos", async () => {
    const { http, fetchFalso } = preparar({ accessToken: "A1", refreshToken: "R1" });
    fetchFalso.and.returnValue(respuestaHttp(400, { mensaje: "Hay datos inválidos.", campos: { precio: "El precio no puede ser negativo." } }));

    try {
      await http.post("/v1/productos", { precio: -1 });
      fail("debía lanzar un error");
    } catch (error) {
      expect(error).toEqual(jasmine.any(ErrorApi));
      expect(error.estado).toBe(400);
      expect(error.campos.precio).toBe("El precio no puede ser negativo.");
      expect(error.message).toContain("El precio no puede ser negativo.");
    }
  });

  it("204 (eliminado) devuelve null", async () => {
    const { http, fetchFalso } = preparar({ accessToken: "A1", refreshToken: "R1" });
    fetchFalso.and.returnValue(respuestaHttp(204));
    expect(await http.eliminar("/v1/productos/GS-001")).toBeNull();
    expect(fetchFalso.calls.mostRecent().args[1].method).toBe("DELETE");
  });

  it("si el backend no está disponible, informa un error de conexión", async () => {
    const { http, fetchFalso } = preparar();
    fetchFalso.and.returnValue(Promise.reject(new TypeError("Failed to fetch")));
    await expectAsync(http.get("/v1/productos")).toBeRejectedWithError(/No se pudo conectar/);
  });
});

describe("Almacenamiento local", () => {
  it("la sesión guarda solo los tokens (nunca el usuario ni su rol)", () => {
    const almacen = crearAlmacenamientoFalso();
    const sesion = crearAlmacenSesion(almacen);
    sesion.guardar({ accessToken: "A", refreshToken: "R", usuario: { tipo: "Administrador" } });
    expect(JSON.parse(almacen.getItem("glitch_sesion"))).toEqual({ accessToken: "A", refreshToken: "R" });
    sesion.limpiar();
    expect(sesion.leer()).toBeNull();
  });

  it("crearValor usa el valor por defecto si los datos están corruptos", () => {
    const valor = crearValor("glitch_carrito", [], crearAlmacenamientoFalso({ glitch_carrito: "{no es json" }));
    expect(valor.leer()).toEqual([]);
    valor.guardar([{ codigo: "GS-001", cantidad: 1 }]);
    expect(valor.leer()).toEqual([{ codigo: "GS-001", cantidad: 1 }]);
  });
});
