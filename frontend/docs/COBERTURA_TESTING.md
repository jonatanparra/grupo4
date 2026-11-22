# Documento de cobertura del testing — Glitch Store

**Asignatura:** DSY1104 Desarrollo Fullstack II · **Evaluación:** Parcial 2, actualizado en la Parcial 3 (integración con la API)
**Herramientas:** Jasmine 5 + Karma 6 (Chrome/Edge headless) + React Testing Library + karma-coverage (istanbul)

## 1. Resultado

| Indicador            | Valor                |
|----------------------|----------------------|
| Pruebas ejecutadas   | **215**              |
| Pruebas exitosas     | **215 (100%)**       |
| Archivos de prueba   | 20 (`*.spec.js` / `*.spec.jsx`) |
| Cobertura de sentencias | **97,01%** (1172/1208) |
| Cobertura de ramas   | **90,96%** (715/786) |
| Cobertura de funciones | **95,8%** (434/453) |
| Cobertura de líneas  | **97,83%** (994/1016) |

Los números se regeneran con `npm test` (reporte HTML en `coverage/html/index.html`, tabla de texto
en `coverage/cobertura.txt`) y son idénticos en cada ejecución. `src/main.jsx` no se mide porque solo
monta la aplicación en el DOM real.

Las pruebas del frontend **no necesitan el backend**: usan una API falsa en memoria (sección 3). El
backend tiene sus propias 28 pruebas (JUnit, Mockito y MockMvc) en la carpeta `backend/`.

## 2. Configuración del entorno de pruebas

- **`karma.conf.cjs`**
  - `frameworks: ["jasmine", "webpack"]`: Jasmine aporta `describe`, `it`, `expect`, `spyOn`;
    karma-webpack empaqueta cada archivo de prueba.
  - **Babel** (`@babel/preset-react`) compila el JSX. `babel-plugin-istanbul` instrumenta solo el
    código de la aplicación (excluye los `*.spec`) para medir la cobertura.
  - Navegador `ChromeHeadless`; si Chrome no está instalado se usa Edge (también Chromium)
    a través de `CHROME_BIN`.
  - `public/` se sirve en Karma para que imágenes y videos no generen errores 404.
  - Reportes: `spec` (consola), `kjhtml` (navegador en modo *watch*) y `coverage`.
- **`src/test/setup.js`**: un `beforeEach` global limpia `localStorage` antes de cada prueba,
  así ninguna prueba depende de otra.
- **`src/test/apiFalsa.js`** — `crearApiFalsa({ carrito, sesion, errorCatalogo })`: **mock de la API
  REST** con la misma forma que `crearApi()` (`src/api/servicios.js`). Guarda los datos en memoria,
  responde con promesas y reproduce las reglas del backend: 401 con credenciales incorrectas, 403
  si el rol no tiene permiso, 409 por RUN/correo/código duplicado, y la compra recalculada con
  control de stock. Expone `api.datos` para comprobar qué quedó "guardado".
- **`src/test/datosPrueba.js`** — los mismos datos de ejemplo que carga el backend en Oracle.
- **`src/test/utilidades.jsx`**:
  - `renderConTienda(ui, { ruta, patron, api })` — renderiza el componente dentro de
    `MemoryRouter` + `TiendaProvider`, **espera a que terminen las peticiones iniciales**
    (catálogo, sesión y datos del rol) y expone la ruta actual (`data-testid="ubicacion"`).
  - `esperarQue(condición)` — reintenta hasta que la condición se cumpla. Hace falta porque en
    Jasmine un `expect` fallido no lanza excepción, y `waitFor(() => expect(...))` no reintentaría.

## 3. Uso de mocks y espías

| Mock / espía | Dónde | Para qué |
|--------------|-------|----------|
| `crearApiFalsa()` inyectada en `TiendaProvider` | contexto, páginas, App | Probar componentes sin red ni Oracle, con datos y sesión controlados |
| `crearApiFalsa({ sesion: USUARIO_VENDEDOR })` | App, Admin, contexto | Simular cada rol (tokens válidos) y comprobar sus restricciones |
| `jasmine.createSpy("fetch")` como `fetchImpl` | `api/cliente.spec.js`, `api/servicios.spec.js` | Reemplazar `fetch` para verificar headers JWT, rutas, métodos y la renovación del token |
| `spyOn(api.boletas, "comprar").and.callThrough()` | contexto, Checkout | Verificar que la compra envía **solo códigos y cantidades** (los montos los calcula el backend) |
| `spyOn(api.productos, "eliminar").and.returnValue(Promise.reject(...))` | Admin, Checkout | Simular que el backend rechaza la acción y comprobar que la interfaz muestra el error |
| `spyOn(api.auth, "perfil").and.returnValue(Promise.reject(...))` | RutaProtegida | Simular tokens guardados que el backend ya no acepta |
| `crearAlmacenamientoFalso()` (reemplaza `localStorage`) | API falsa, almacenamiento | Aislar carrito y tokens de cada prueba |
| `jasmine.createSpy()` | Boton, TarjetaProducto, FiltroCategorias, LineaCarrito... | Verificar que se llame la función recibida por *props* y con qué argumentos |
| `jasmine.createSpy().and.returnValue()` | ResumenCarrito | Simular respuesta válida/ inválida del cupón |
| `spyOn(window, "confirm").and.returnValues(false, true)` | Admin productos/usuarios | Simular que el usuario cancela y luego confirma la eliminación |
| `spyOn(window, "print")`, `spyOn(window, "scrollTo")` | Boleta, Registro, App | Evitar efectos reales del navegador y verificar que se invocan |
| `jasmine.clock().install()` / `tick()` | TarjetaProducto | Controlar el `setTimeout` del texto "Añadido ✓" sin esperar tiempo real |
| `jasmine.clock().mockDate()` + `spyOn(Date, "now")` | confetiHalloween | Avanzar los temporizadores del confeti y comprobar que la lluvia de emojis se detiene |
| `spyOn(window, "AudioContext").and.throwError()` | confetiHalloween | Simular un navegador que bloquea el sonido |

## 4. Alcance por tipo de prueba (propuesta del docente)

### 4.1 Renderizado correcto
| Prueba | Archivo |
|--------|---------|
| `GrillaProductos` renderiza **una tarjeta por cada producto** del conjunto de datos | `components/productos/Productos.spec.jsx` |
| `ResumenOrden` lista todos los productos de la orden y la dirección | `components/carrito/Carrito.spec.jsx` |
| Ofertas muestra solo productos con descuento, ordenados de mayor a menor | `pages/Tienda.spec.jsx` |
| Categoría muestra solo los productos de esa categoría | `pages/Tienda.spec.jsx` |
| Detalle de producto muestra los datos según el código de la URL | `pages/Tienda.spec.jsx` |
| Dashboard admin muestra los indicadores calculados | `pages/admin/Admin.spec.jsx` |
| Home, Blogs, Nosotros y 404 se renderizan en su ruta | `App.spec.jsx` |

### 4.2 Renderizado condicional
| Prueba | Archivo |
|--------|---------|
| `CampoFormulario` muestra el **mensaje de error solo cuando hay un error** | `components/common/CampoFormulario.spec.jsx` |
| `Alerta` no renderiza nada sin mensaje | `components/common/CampoFormulario.spec.jsx` |
| Login: "Correo o contraseña incorrectos" solo aparece si fallan las credenciales | `pages/Formularios.spec.jsx` |
| `GrillaProductos` muestra "Sin resultados" con lista vacía | `components/productos/Productos.spec.jsx` |
| `Encabezado`: enlaces de login vs. saludo y "Panel admin" según sesión y rol | `components/layout/Encabezado.spec.jsx` |
| Checkout: la dirección se oculta al elegir "Retiro en tienda" | `pages/Tienda.spec.jsx` |
| Compra exitosa vs. pago rechazado | `pages/Tienda.spec.jsx` |
| Vendedor no ve acciones de edición ni la sección Usuarios | `pages/admin/Admin.spec.jsx`, `App.spec.jsx` |

### 4.3 Propiedades (props)
| Prueba | Archivo |
|--------|---------|
| `Boton` **recibe la etiqueta y la función `onClick`** y la ejecuta al hacer clic | `components/common/Boton.spec.jsx` |
| `Boton` no ejecuta `onClick` si está deshabilitado; aplica variante/tamaño/ancho | `components/common/Boton.spec.jsx` |
| `TarjetaProducto` llama a `onAgregar` con el código del producto | `components/productos/Productos.spec.jsx` |
| `FiltroCategorias` marca la categoría activa y avisa la seleccionada | `components/productos/Productos.spec.jsx` |
| `LineaCarrito` llama a `onCambiarCantidad` (+1 / −1) y `onQuitar` | `components/carrito/Carrito.spec.jsx` |
| `ResumenCarrito` muestra los montos recibidos | `components/carrito/Carrito.spec.jsx` |

### 4.4 Estado (state)
| Prueba | Archivo |
|--------|---------|
| **El estado de un formulario cambia cuando el usuario escribe** (`useFormulario`) | `hooks/useFormulario.spec.jsx` |
| Contador de caracteres del formulario de contacto | `pages/Formularios.spec.jsx` |
| `SelectorCantidad` incrementa/decrementa y respeta mínimo y máximo | `components/common/SelectorCantidad.spec.jsx` |
| `Encabezado` abre/cierra el menú móvil (`menuAbierto`) | `components/layout/Encabezado.spec.jsx` |
| Región → comuna: al cambiar la región se cargan sus comunas | `pages/Formularios.spec.jsx` |
| Estado global (`TiendaContext`): carrito, cupón, sesión y CRUD | `context/TiendaContext.spec.jsx` |

### 4.5 Eventos
| Prueba | Archivo |
|--------|---------|
| Clic en "Añadir" cambia el texto a "Añadido ✓" y vuelve tras 1,2 s | `components/productos/Productos.spec.jsx` |
| Búsqueda, filtro por categoría y "Solo ofertas" actualizan la grilla | `pages/Tienda.spec.jsx` |
| Envío de Login redirige a `/admin` (administrador) o `/` (cliente) | `pages/Formularios.spec.jsx` |
| Checkout válido navega a `/compra/exito/:id`; rechazo simulado a `/compra/error/:id` | `pages/Tienda.spec.jsx` |
| Eliminar producto/usuario solo tras confirmar | `pages/admin/Admin.spec.jsx` |
| Crear y editar productos y usuarios desde los formularios del panel | `pages/admin/Admin.spec.jsx` |
| Navegación completa por menú y panel administrativo | `App.spec.jsx` |

### 4.6 Lógica (funciones puras y persistencia)
| Prueba | Archivo |
|--------|---------|
| RUN (dígito verificador, incluye K), correo, contraseña, números, teléfono | `utils/validaciones.spec.js` |
| Carrito: agregar, límite de stock, inmutabilidad, cupones, envío, totales | `utils/carrito.spec.js` |
| Filtros y orden del catálogo, formato CLP, oferta, stock crítico | `utils/filtros.spec.js` |
| `procesarCompra`: pagada (descuenta stock, vacía carrito), rechazada, sin stock en el backend | `context/TiendaContext.spec.jsx` |
| Confeti de Halloween (bonus): explosiones, fin de la lluvia a los 1,8 s y sonido bloqueado sin errores | `utils/confettiHalloween.spec.js` |
| Almacenamiento local: la sesión guarda **solo los tokens**; datos corruptos vuelven al valor por defecto | `api/cliente.spec.js` |

### 4.7 Integración con la API REST (EV3)
| Prueba | Archivo |
|--------|---------|
| Cada servicio llama al **método y ruta versionada** correctos (`GET /v1/productos`, `PUT /v1/boletas/{id}/estado`...) | `api/servicios.spec.js` |
| El cliente HTTP envía `Authorization: Bearer <token>` y serializa el cuerpo en JSON | `api/cliente.spec.js` |
| Token vencido (401) → se renueva con el refresh token y se repite la petición | `api/cliente.spec.js` |
| Varias peticiones con el token vencido comparten **una sola** renovación | `api/cliente.spec.js` |
| Si la renovación falla, se borra la sesión y se avisa a la app | `api/cliente.spec.js`, `context/TiendaContext.spec.jsx` |
| Errores 400 con campos, 204 sin cuerpo y backend caído se convierten en mensajes claros | `api/cliente.spec.js` |
| Al recargar con tokens, el usuario y su rol se recuperan desde `/auth/me` | `context/TiendaContext.spec.jsx` |
| Cada rol carga solo sus datos: Administrador (usuarios + órdenes), Vendedor (órdenes), Cliente (sus compras) | `context/TiendaContext.spec.jsx` |
| Un 403 del backend no cambia el estado de la interfaz | `context/TiendaContext.spec.jsx` |
| Backend caído: la tienda muestra "No pudimos cargar la información" y botón Reintentar | `App.spec.jsx` |

### 4.8 Gráficos del dashboard
| Prueba | Archivo |
|--------|---------|
| Ventas por día/semana con todos los días del período; anuladas y rechazadas no cuentan como venta | `utils/estadisticas.spec.js` |
| Ingresos por categoría, órdenes por estado (orden fijo) y productos ordenados por urgencia de reposición | `utils/estadisticas.spec.js` |
| Ventas en el tiempo: el filtro 7/30/90 días cambia el resumen; el cursor muestra el detalle del día | `components/admin/graficos/Graficos.spec.jsx` |
| Categorías, estados y stock: una marca por dato, globo al pasar el cursor, leyenda con cantidad y % y mensaje cuando no hay datos | `components/admin/graficos/Graficos.spec.jsx` |

### 4.9 Restricciones de acceso por rol (EV3)
| Prueba | Archivo |
|--------|---------|
| `RutaProtegida`: sin sesión → login; rol no permitido → "Acceso denegado"; tokens inválidos → login | `components/layout/Encabezado.spec.jsx` |
| Vendedor: entra directo a Órdenes y su menú solo tiene **Órdenes y Productos** | `App.spec.jsx` |
| Vendedor: escribir la URL de Usuarios, Reportes, Stock crítico, Nuevo o Editar producto muestra "Acceso denegado" | `App.spec.jsx` |
| Vendedor: ve la boleta pero no puede cambiar su estado; no ve botones de edición de productos | `pages/admin/Admin.spec.jsx` |
| Administrador: ve todas las secciones y cambia el estado de una boleta | `App.spec.jsx`, `pages/admin/Admin.spec.jsx` |
| "Mis compras" exige sesión y muestra solo las compras del cliente | `App.spec.jsx`, `pages/Tienda.spec.jsx` |

## 5. Análisis de resultados

- **Todas las pruebas pasan** y la cobertura supera el 90% en sentencias, ramas, funciones y líneas.
- Las capas con lógica (`api`, `utils`, `context`, `hooks`) tienen entre 95% y 100% de sentencias
  cubiertas: de ellas dependen la sesión, la comunicación con el backend, los totales mostrados y
  las validaciones.
- Las pruebas ayudaron a detectar errores reales durante el desarrollo:
  1. Dos RUN de los datos de ejemplo tenían el **dígito verificador incorrecto** (`191102203`,
     `178456321`); se corrigieron a `191102207` y `178456326`.
  2. El carrito sumaba el costo de envío al total aunque mostraba "se calcula en el checkout";
     ahora el envío solo se suma cuando se elige despacho a domicilio.
  3. Los mensajes de RUN/código duplicado mostraban texto técnico ("registro con run…");
     ahora se muestra un mensaje claro al usuario.
  4. La cobertura variaba entre ejecuciones (95,5% / 96,1%) porque el confeti usaba temporizadores
     reales que a veces alcanzaban a ejecutarse durante otras pruebas. Se agregó
     `confettiHalloween.spec.js` con reloj falso y ahora el resultado es **idéntico en cada ejecución**.
  5. (EV3) Al entrar directo a `/checkout`, la página redirigía al carrito antes de que llegara el
     catálogo desde la API, y el formulario no se autocompletaba porque la sesión aún se estaba
     verificando. Ahora espera ambas cosas antes de mostrarse.
  6. (EV3) Al cambiar el estado de una boleta, el mensaje de confirmación desaparecía porque el
     componente se volvía a montar; se corrigió su `key`.
- **Pruebas manuales contra el backend real** (Oracle Cloud): login de los tres roles, recarga de
  página con sesión, renovación automática del token (dos peticiones con 401 → una sola llamada a
  `/auth/refresh`), compra real con descuento de stock y "Mis compras". Ver el documento de
  integración.
- **Zonas con menor cobertura** (oportunidades de mejora):
  - `FormularioProducto.jsx` (~78%): la lectura de la imagen con `FileReader` y el error de
    archivo que no es imagen no se prueban con un archivo real.
  - Ramas de `ResumenOrden`/`AdminReportes` para datos incompletos (dirección vacía, categoría sin
    ventas).
  - Próximo paso: pruebas end-to-end automatizadas (por ejemplo, Playwright) contra el backend.

## 6. Cómo ejecutar

```bash
npm install
npm test            # una ejecución + cobertura
npm run test:watch  # modo observador con reporte en el navegador (kjhtml)
```
