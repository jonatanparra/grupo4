# Glitch Store — Tienda online de videojuegos (React + Bootstrap)

Proyecto frontend de DSY1104 — Desarrollo Fullstack II, Duoc UC.

- **Evaluación 1:** tienda en HTML, CSS y JavaScript sin frameworks (quedó en el historial de git).
- **Evaluación 2:** migración a **React** con **Bootstrap 5**, nuevas vistas y **pruebas unitarias con
  Jasmine + Karma**.
- **Evaluación 3 (40%):** el frontend se **integra con el backend Spring Boot** (repositorio
  `glitch-store-backend`) mediante su **API REST**. Los productos, categorías, usuarios y boletas viven
  en **Oracle Cloud**; la sesión usa **JWT** y la interfaz se restringe según el rol.

## Requisitos

- Node.js 18 o superior (probado con Node 24 LTS).
- El **backend** en ejecución en <http://localhost:8080> (ver su README).
- Google Chrome o Microsoft Edge para las pruebas (Karma las ejecuta en modo *headless*; si no
  encuentra Chrome usa Edge automáticamente).

## Cómo ejecutarlo

```bash
git clone https://github.com/jonatanparra/grupo4.git
cd grupo4
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173 (el backend debe estar arriba)
npm run build      # build de producción en dist/
npm run preview    # sirve localmente el build de dist/
npm test           # pruebas unitarias Jasmine + Karma (una ejecución) + reporte de cobertura
npm run test:watch # pruebas en modo observador (re-ejecuta al guardar)
```

La dirección del backend se configura con la variable `VITE_API_URL` (por defecto
`http://localhost:8080/api`); ver [`.env.example`](.env.example). Las pruebas **no** necesitan el
backend: usan una API falsa en memoria.

El reporte de cobertura queda en `coverage/html/index.html` (y en texto en `coverage/cobertura.txt`).
El análisis de las pruebas está en [`docs/COBERTURA_TESTING.md`](docs/COBERTURA_TESTING.md).

### Usuarios de prueba

| Rol           | Correo                               | Contraseña |
|---------------|--------------------------------------|------------|
| Administrador | camila.rojas@duoc.cl                 | admin123   |
| Vendedor      | matias.fernandez@gmail.com           | vende123   |
| Cliente       | javiera.contreras@profesor.duoc.cl   | cliente1   |

Cupones de descuento: `GLITCH10` (10%) y `DUOC15` (15%).

## Stack

| Herramienta                     | Uso                                                        |
|---------------------------------|------------------------------------------------------------|
| React 18 + Vite                 | Componentes, estado y servidor de desarrollo               |
| React Router 6                  | Navegación entre vistas (SPA) y rutas protegidas por rol   |
| Bootstrap 5                     | Grilla responsiva, navbar, cards, formularios, tablas      |
| fetch (API del navegador)       | Comunicación con la API REST del backend                   |
| Jasmine + Karma                 | Pruebas unitarias en navegador (Chrome/Edge headless)      |
| React Testing Library           | Renderizar componentes y simular eventos dentro de Jasmine |
| karma-webpack + Babel           | Compilar JSX para las pruebas                              |
| karma-coverage (istanbul)       | Reporte de cobertura                                       |
| canvas-confetti                 | Bonus: confeti de Halloween al confirmar una compra        |

## Estructura del proyecto

```
grupo4/
├── index.html                 Punto de entrada de Vite
├── package.json               Dependencias y scripts (dev, build, preview, test)
├── vite.config.js             Configuración de Vite (plugin React, puerto 5173)
├── karma.conf.cjs             Configuración de Karma + Jasmine + cobertura
├── .env.example               Dirección del backend (VITE_API_URL)
├── docs/
│   └── COBERTURA_TESTING.md   Documento de cobertura del testing
├── public/                    Se sirve tal cual
│   ├── img/                   Imágenes de productos, categorías, blogs y logos
│   └── video/                 Videos de los blogs
└── src/
    ├── main.jsx               Monta <App /> con BrowserRouter y TiendaProvider
    ├── App.jsx                Mapa de rutas (tienda + panel admin) y restricciones por rol
    ├── api/
    │   ├── cliente.js         Cliente HTTP: token JWT, renovación automática y errores
    │   ├── servicios.js       Una función por endpoint de la API REST (/api/v1/...)
    │   └── almacenamiento.js  localStorage: carrito y tokens de la sesión
    ├── data/
    │   ├── datos.js           Datos de referencia: regiones/comunas, dominios, cupones, envío
    │   └── blogs.js           Contenido de los blogs
    ├── context/
    │   └── TiendaContext.jsx  Estado global: conecta la API con los componentes
    ├── hooks/
    │   └── useFormulario.js   Estado + validación en vivo de formularios
    ├── utils/                 Lógica pura (validaciones, carrito, filtros, formato) y confettiHalloween.js (bonus)
    ├── components/
    │   ├── common/            Boton, CampoFormulario, Alerta, Cargando, ErrorConexion, RutaProtegida...
    │   ├── productos/         TarjetaProducto, GrillaProductos, FiltroCategorias, BarraBusqueda...
    │   ├── carrito/           LineaCarrito, ResumenCarrito, ResumenOrden (boleta)
    │   ├── layout/            Encabezado, PiePagina, LayoutTienda, LayoutAdmin
    │   └── admin/             Tablas y formularios del panel
    ├── pages/                 Una vista por ruta (tienda)
    │   └── admin/             Vistas del panel administrativo
    ├── styles/tema.css        Personalización de Bootstrap (paleta horror/glitch)
    └── test/
        ├── setup.js           beforeEach global: limpia localStorage antes de cada prueba
        ├── apiFalsa.js        Mock de la API REST en memoria (mismas reglas y errores que el backend)
        ├── datosPrueba.js     Datos de ejemplo para las pruebas (los mismos que carga el backend)
        └── utilidades.jsx     renderConTienda(), esperarQue() y usuarios de prueba por rol
```

Cada archivo `*.spec.js(x)` está junto al código que prueba.

## Flujo de navegación

**Tienda (pública)**

| Ruta                     | Vista                                                       |
|--------------------------|-------------------------------------------------------------|
| `/`                      | Home: hero, categorías, ofertas y recién llegados           |
| `/productos`             | Catálogo con búsqueda, filtro por categoría, ofertas y orden |
| `/producto/:codigo`      | Detalle del producto + relacionados                         |
| `/categorias`            | Categorías con cantidad de productos                        |
| `/categorias/:id`        | Productos de una categoría                                  |
| `/ofertas`               | Productos con descuento                                     |
| `/carrito`               | Carrito con cupón de descuento                              |
| `/checkout`              | Datos del cliente, dirección y tipo de entrega (se completan solos si hay sesión) |
| `/compra/exito/:id`      | Compra exitosa con boleta (imprimir / enviar) y confeti de Halloween 🎃 |
| `/compra/error/:id`      | Pago rechazado, con opción de reintentar                    |
| `/login`, `/registro`    | Formularios con validación (el registro deja la sesión iniciada) |
| `/mis-compras`           | **EV3**: historial de compras del usuario (requiere sesión) |
| `/nosotros`, `/blogs`, `/blogs/:id`, `/contacto` | Contenido                           |

**Panel administrativo** (`/admin`): qué ve cada rol (Anexo 1 de la EV3)

| Ruta                               | Vista                                         | Administrador | Vendedor |
|------------------------------------|-----------------------------------------------|:---:|:---:|
| `/admin`                           | Dashboard: ventas, productos, usuarios, stock crítico | ✓ | → Órdenes |
| `/admin/ordenes`, `/admin/ordenes/:id` | Órdenes / boletas, filtro por estado; cambio de estado solo Administrador | ✓ | ✓ (solo lectura) |
| `/admin/productos`, `/admin/productos/:codigo` | Listado con búsqueda y ficha del producto | ✓ | ✓ (solo lectura) |
| `/admin/productos/nuevo`, `/:codigo/editar` | Crear y editar productos           | ✓ | — |
| `/admin/productos-criticos`        | Productos con stock en nivel crítico          | ✓ | — |
| `/admin/usuarios` (+ nuevo, ver, editar) | CRUD de usuarios con historial de compras | ✓ | — |
| `/admin/reportes`                  | Ingresos por categoría y productos más vendidos | ✓ | — |

El **Cliente** solo accede a la tienda y a "Mis compras". Si alguien escribe la URL de una sección que
su rol no permite, ve **"Acceso denegado"**; sin sesión se le envía al login.

## Integración con el backend (EV3)

- **Comunicación REST**: `src/api/servicios.js` tiene una función por endpoint (`GET /v1/productos`,
  `POST /v1/boletas`, `PUT /v1/usuarios/{run}`...). Los componentes no llaman a `fetch`: usan el
  contexto `TiendaContext`, que llama a la API y actualiza el estado con la respuesta.
- **Carga según el rol**: al iniciar se pide el catálogo; si hay sesión, el Administrador carga
  además usuarios y órdenes, el Vendedor las órdenes y el Cliente solo sus compras.
- **Compra**: el frontend envía solo los códigos y cantidades del carrito. El backend calcula
  precios, ofertas, cupón y envío, valida el stock y responde con la boleta "Pagado" o "Rechazado".
- **Errores**: si el backend no responde se muestra "No pudimos cargar la información" con un botón
  Reintentar; los errores de validación o permisos se muestran en cada formulario.

## Sesión y seguridad en el frontend (EV3)

- **Login**: `POST /v1/auth/login` devuelve un `accessToken` (15 min) y un `refreshToken` (7 días).
- **Persistencia**: en `localStorage` se guardan **solo los tokens**, nunca el rol ni los datos del
  usuario. Al recargar la página, la app muestra "Verificando sesión..." y pide el usuario a
  `GET /v1/auth/me`: el rol siempre lo informa el backend, así editar el almacenamiento no da permisos.
- **Renovación automática**: si una petición recibe 401 porque el token venció, `src/api/cliente.js`
  pide un par nuevo con el `refreshToken` y repite la petición. Si varias fallan a la vez comparten
  una sola renovación. Si la renovación también falla, se cierra la sesión en toda la app.
- **Restricciones de acceso**: `RutaProtegida` (rutas) y el menú del panel (`SECCIONES` en
  `LayoutAdmin`) usan el rol para mostrar u ocultar interfaces y acciones (por ejemplo, el Vendedor
  no ve los botones Editar/Eliminar). Es una ayuda de interfaz: la protección real está en el
  backend, que responde 401/403 a cualquier petición sin token o sin el rol adecuado.
- **Cerrar sesión** borra los tokens del navegador.

## Cómo se aplicaron los requisitos de la EV2

- **Migración a componentes React reutilizables**: cada componente tiene una única
  responsabilidad (p. ej. `Boton`, `CampoFormulario`, `SelectorCantidad`, `TarjetaProducto`) y
  recibe datos/funciones por *props*. Solo guardan estado propio cuando lo necesitan
  (`TarjetaProducto` recuerda si se acaba de añadir, `ResumenCarrito` el texto del cupón,
  `Encabezado` si el menú móvil está abierto).
- **Datos con CRUD**: en la EV2 era un archivo JS sobre `localStorage`; en la EV3 se reemplazó por la
  API REST del backend (Oracle Cloud).
- **Bootstrap responsivo**: grilla `row/col` (1 → 2 → 3 → 4 columnas de productos), navbar
  colapsable (`navbar-expand-xl`), barra lateral del panel que se oculta en móvil, tablas
  `table-responsive` y columnas que se esconden en pantallas chicas (`d-none d-md-table-cell`).
- **Interactividad**: búsqueda por texto, filtros, orden, cupones, selects dependientes
  región → comuna, validación en vivo, simulación de pago rechazado, confirmación al eliminar.
- **Pruebas**: ver [`docs/COBERTURA_TESTING.md`](docs/COBERTURA_TESTING.md).

## Bonus: confeti y sonido de Halloween

Al completar una compra con éxito (`/compra/exito/:id`) se lanza una animación de confeti con
emojis de Halloween (🎃 👻 🦇) y un sonido corto generado con la Web Audio API.

- Librería: [`canvas-confetti`](https://www.npmjs.com/package/canvas-confetti).
- Lógica en `src/utils/confettiHalloween.js`; se dispara desde `CompraResultado.jsx` con un
  `useEffect` que se ejecuta una sola vez cuando la compra es exitosa.
- No se muestra en el pago rechazado (`/compra/error/:id`).

## Validaciones

Se validan en el formulario (al escribir y al enviar) y **otra vez en el backend**:

- **RUN chileno**: sin puntos ni guion, 7 a 9 caracteres y dígito verificador real.
- **Correo**: formato válido y dominios `@duoc.cl`, `@profesor.duoc.cl`, `@gmail.com`.
- **Contraseña**: 4 a 10 caracteres, con confirmación.
- **Productos**: código mínimo 3 caracteres y único; precio ≥ 0; descuento 0–90%; stock entero ≥ 0.
