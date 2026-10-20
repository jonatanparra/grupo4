# Documento de cobertura del testing — Glitch Store

**Asignatura:** DSY1104 Desarrollo Fullstack II · **Evaluación:** Parcial 2
**Herramientas:** Jasmine 5 + Karma 6 (Chrome/Edge headless) + React Testing Library + karma-coverage (istanbul)

## 1. Resultado

| Indicador            | Valor                |
|----------------------|----------------------|
| Pruebas ejecutadas   | **167**              |
| Pruebas exitosas     | **167 (100%)**       |
| Archivos de prueba   | 16 (`*.spec.js` / `*.spec.jsx`) |
| Cobertura de sentencias | **96,18%**        |
| Cobertura de ramas   | **91,02%**           |
| Cobertura de funciones | **96,98%**         |
| Cobertura de líneas  | **97,72%**           |

Los números se regeneran con `npm test` (reporte HTML en `coverage/html/index.html`, tabla de texto
en `coverage/cobertura.txt`). `src/main.jsx` no se mide porque solo monta la aplicación en el DOM real.

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
- **`src/test/utilidades.jsx`**:
  - `crearAlmacenamientoFalso()` — **mock** de `localStorage` en memoria.
  - `crearServiciosPrueba({ carrito, sesion })` — servicios de datos sobre ese mock, con carrito o
    sesión iniciales.
  - `renderConTienda(ui, { ruta, patron, servicios })` — renderiza el componente dentro de
    `MemoryRouter` + `TiendaProvider` y expone la ruta actual (`data-testid="ubicacion"`) para
    comprobar redirecciones.

## 3. Uso de mocks y espías

| Mock / espía | Dónde | Para qué |
|--------------|-------|----------|
| `crearAlmacenamientoFalso()` (reemplaza `localStorage`) | db, contexto, páginas | Aislar la "base de datos" de cada prueba |
| Inyección de `servicios` en `TiendaProvider` | todas las páginas | Probar componentes con datos controlados (carrito, sesión) |
| `jasmine.createSpy()` | Boton, TarjetaProducto, FiltroCategorias, LineaCarrito... | Verificar que se llame la función recibida por *props* y con qué argumentos |
| `jasmine.createSpy().and.returnValue()` | ResumenCarrito | Simular respuesta válida/ inválida del cupón |
| `spyOn(window, "confirm").and.returnValues(false, true)` | Admin productos/usuarios | Simular que el usuario cancela y luego confirma la eliminación |
| `spyOn(window, "print")`, `spyOn(window, "scrollTo")` | Boleta, Registro, App | Evitar efectos reales del navegador y verificar que se invocan |
| `spyOn(almacenamiento, "setItem").and.callThrough()` | db | Verificar que la colección se persiste |
| `spyOn(console, "error")` | db | Silenciar y verificar el log ante datos corruptos |
| `jasmine.clock().install()` / `tick()` | TarjetaProducto | Controlar el `setTimeout` del texto "Añadido ✓" sin esperar tiempo real |

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
| CRUD de la base de datos simulada, errores por id duplicado/inexistente, datos corruptos | `data/db.spec.js` |
| `procesarCompra`: pagada (descuenta stock, vacía carrito), rechazada, sin stock | `context/TiendaContext.spec.jsx` |

## 5. Análisis de resultados

- **Todas las pruebas pasan** y la cobertura supera el 90% en sentencias, ramas, funciones y líneas.
- Las capas con lógica de negocio (`utils`, `data`, `context`, `hooks`) tienen entre 98% y 100% de
  sentencias cubiertas: son las más críticas porque de ellas dependen los totales de la compra, el
  stock y las validaciones.
- Las pruebas ayudaron a detectar errores reales durante el desarrollo:
  1. Dos RUN de los datos de ejemplo tenían el **dígito verificador incorrecto** (`191102203`,
     `178456321`); se corrigieron a `191102207` y `178456326`.
  2. El carrito sumaba el costo de envío al total aunque mostraba "se calcula en el checkout";
     ahora el envío solo se suma cuando se elige despacho a domicilio.
  3. Los mensajes de RUN/código duplicado mostraban texto técnico ("registro con run…");
     ahora se muestra un mensaje claro al usuario.
- **Zonas con menor cobertura** (oportunidades de mejora):
  - `FormularioProducto.jsx` (~75%): la lectura de la imagen con `FileReader` y el error de
    archivo que no es imagen no se prueban con un archivo real.
  - Ramas de `ResumenOrden`/`AdminReportes` para datos incompletos (dirección vacía, categoría sin
    ventas) y las ramas por defecto de `servicios.js` (usar el `localStorage` real).
  - Próximo paso: pruebas de integración contra el backend cuando se reemplace la base de datos
    simulada por la API real.

## 6. Cómo ejecutar

```bash
npm install
npm test            # una ejecución + cobertura
npm run test:watch  # modo observador con reporte en el navegador (kjhtml)
```
