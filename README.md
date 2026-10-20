# Glitch Store — Tienda online de videojuegos (React + Bootstrap)

Proyecto frontend para la **Evaluación Parcial 2 (30%)** de DSY1104 — Desarrollo Fullstack II, DuocUC.

En la Evaluación 1 la tienda estaba hecha con HTML, CSS y JavaScript sin frameworks (esa versión
quedó en el historial de git). En esta entrega se **migró a React**, con **Bootstrap 5** para el
diseño responsivo, una **base de datos simulada en JavaScript con CRUD** persistida en
`localStorage`, nuevas vistas (categorías, ofertas, checkout, compra exitosa/fallida, panel
administrativo completo) y **pruebas unitarias con Jasmine + Karma**.

## Requisitos

- Node.js 18 o superior (probado con Node 24 LTS).
- Google Chrome o Microsoft Edge (Karma ejecuta las pruebas en modo *headless*; si no encuentra
  Chrome usa Edge automáticamente).

## Cómo ejecutarlo

```bash
git clone https://github.com/jonatanparra/grupo4.git
cd grupo4
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # build de producción en dist/
npm run preview    # sirve localmente el build de dist/
npm test           # pruebas unitarias Jasmine + Karma (una ejecución) + reporte de cobertura
npm run test:watch # pruebas en modo observador (re-ejecuta al guardar)
```

El reporte de cobertura queda en `coverage/html/index.html` (y en texto en `coverage/cobertura.txt`).
El análisis de las pruebas está en [`docs/COBERTURA_TESTING.md`](docs/COBERTURA_TESTING.md).

### Usuarios de prueba

| Rol           | Correo                               | Contraseña |
|---------------|--------------------------------------|------------|
| Administrador | camila.rojas@duoc.cl                 | admin123   |
| Vendedor      | matias.fernandez@gmail.com           | vende123   |
| Cliente       | javiera.contreras@profesor.duoc.cl   | cliente1   |

Cupones de descuento: `GLITCH10` (10%) y `DUOC15` (15%).

Para volver a los datos iniciales basta con borrar el `localStorage` del sitio (DevTools →
Application → Local Storage).

## Stack

| Herramienta                     | Uso                                                        |
|---------------------------------|------------------------------------------------------------|
| React 18 + Vite                 | Componentes, estado y servidor de desarrollo               |
| React Router 6                  | Navegación entre vistas (SPA) y rutas protegidas           |
| Bootstrap 5                     | Grilla responsiva, navbar, cards, formularios, tablas      |
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
├── docs/
│   └── COBERTURA_TESTING.md   Documento de cobertura del testing
├── public/                    Se sirve tal cual
│   ├── img/                   Imágenes de productos, categorías, blogs y logos
│   └── video/                 Videos de los blogs
└── src/
    ├── main.jsx               Monta <App /> con BrowserRouter y TiendaProvider
    ├── App.jsx                Mapa de rutas (tienda + panel admin)
    ├── data/
    │   ├── datos.js           Datos semilla: productos, usuarios, órdenes, regiones, cupones
    │   ├── db.js              "Base de datos" simulada: CRUD genérico sobre localStorage
    │   ├── servicios.js       Colecciones de la tienda (productos, usuarios, órdenes, carrito, sesión)
    │   └── blogs.js           Contenido de los blogs
    ├── context/
    │   └── TiendaContext.jsx  Estado global: conecta la persistencia con los componentes
    ├── hooks/
    │   └── useFormulario.js   Estado + validación en vivo de formularios
    ├── utils/                 Lógica pura (validaciones, carrito, filtros, formato) y confettiHalloween.js (bonus)
    ├── components/
    │   ├── common/            Boton, CampoFormulario, Alerta, Precio, SelectorCantidad, RutaProtegida...
    │   ├── productos/         TarjetaProducto, GrillaProductos, FiltroCategorias, BarraBusqueda...
    │   ├── carrito/           LineaCarrito, ResumenCarrito, ResumenOrden (boleta)
    │   ├── layout/            Encabezado, PiePagina, LayoutTienda, LayoutAdmin
    │   └── admin/             Tablas y formularios del panel
    ├── pages/                 Una vista por ruta (tienda)
    │   └── admin/             Vistas del panel administrativo
    ├── styles/tema.css        Personalización de Bootstrap (paleta horror/glitch)
    └── test/
        ├── setup.js           beforeEach global: limpia localStorage antes de cada prueba
        └── utilidades.jsx     Mocks (localStorage falso, servicios de prueba) y renderConTienda()
```

Cada archivo `*.spec.js(x)` está junto al código que prueba.

## Flujo de navegación

**Tienda (pública)**

| Ruta                     | Vista                                                       |
|--------------------------|-------------------------------------------------------------|
| `/`                      | Home: hero, categorías, ofertas y recién llegados           |
| `/productos`             | Catálogo con búsqueda, filtro por categoría, ofertas y orden |
| `/producto/:codigo`      | Detalle del producto + relacionados                         |
| `/categorias`            | **Nueva**: categorías con cantidad de productos             |
| `/categorias/:id`        | **Nueva**: productos de una categoría                       |
| `/ofertas`               | **Nueva**: productos con descuento                          |
| `/carrito`               | Carrito con cupón de descuento                              |
| `/checkout`              | **Nueva**: datos del cliente, dirección y tipo de entrega (se completan solos si hay sesión) |
| `/compra/exito/:id`      | **Nueva**: compra exitosa con boleta (imprimir / enviar) y confeti de Halloween 🎃 |
| `/compra/error/:id`      | **Nueva**: pago rechazado, con opción de reintentar         |
| `/login`, `/registro`    | Formularios con validación                                  |
| `/nosotros`, `/blogs`, `/blogs/:id`, `/contacto` | Contenido                           |

**Panel administrativo** (`/admin`, requiere iniciar sesión como Administrador o Vendedor)

| Ruta                               | Vista                                         |
|------------------------------------|-----------------------------------------------|
| `/admin`                           | Dashboard: ventas, productos, usuarios, stock crítico, últimas órdenes |
| `/admin/ordenes`, `/admin/ordenes/:id` | Órdenes / boletas, filtro por estado      |
| `/admin/productos`                 | Listado con búsqueda; ver, editar, eliminar   |
| `/admin/productos/nuevo`, `/:codigo`, `/:codigo/editar` | CRUD de productos (crear/editar solo Administrador) |
| `/admin/productos-criticos`        | Productos con stock en nivel crítico          |
| `/admin/usuarios` (+ nuevo, ver, editar) | CRUD de usuarios con historial de compras (solo Administrador) |
| `/admin/reportes`                  | Ingresos por categoría y productos más vendidos |

El **Vendedor** puede ver dashboard, órdenes, productos y reportes, pero no crear/editar/eliminar ni
gestionar usuarios.

## Cómo se aplicaron los requisitos

- **Migración a componentes React reutilizables**: cada componente tiene una única
  responsabilidad (p. ej. `Boton`, `CampoFormulario`, `SelectorCantidad`, `TarjetaProducto`) y
  recibe datos/funciones por *props*. Solo guardan estado propio cuando lo necesitan
  (`TarjetaProducto` recuerda si se acaba de añadir, `ResumenCarrito` el texto del cupón,
  `Encabezado` si el menú móvil está abierto).
- **Archivo de datos JS con CRUD**: `src/data/db.js` expone `listar`, `obtener`, `crear`,
  `actualizar` y `eliminar` sobre una colección; `servicios.js` crea las colecciones de la tienda.
- **Persistencia conectada a React**: `TiendaContext` llama a la base de datos y actualiza el
  estado; por eso al comprar baja el stock y la orden aparece al instante en el panel admin.
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

- **RUN chileno**: sin puntos ni guion, 7 a 9 caracteres y dígito verificador real.
- **Correo**: formato válido y dominios `@duoc.cl`, `@profesor.duoc.cl`, `@gmail.com`.
- **Contraseña**: 4 a 10 caracteres, con confirmación.
- **Productos**: código mínimo 3 caracteres y único; precio ≥ 0; descuento 0–90%; stock entero ≥ 0.
- Los errores aparecen bajo cada campo al escribir y al intentar enviar.
