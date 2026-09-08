# Glitch Store — Tienda online de videojuegos

Proyecto frontend para la Evaluación 1 (30%) de DSY1104 — Desarrollo Frontend, DuocUC.
Construido solo con **HTML, CSS y JavaScript** (sin frameworks ni build tools), tal como pide el enunciado.

Tienda de videojuegos con temática horror/glitch: paleta fondo `#0A0000`, texto `#E8E8E8`,
acento `#B30000`, tipografía Chakra Petch (títulos) + Inter (texto). Logo e ícono provistos
por el equipo, integrados con fondo transparente para que se vean bien sobre el tema oscuro.

## Cómo verlo

No necesita instalación. Basta con abrir `index.html` en el navegador, o servir la carpeta con
cualquier servidor estático, por ejemplo:

```bash
python3 -m http.server 8000
# luego abrir http://localhost:8000
```

## Estructura del proyecto

```
follaje/
├── index.html                Página principal (home)
├── productos.html             Listado de productos con filtro por categoría
├── detalle-producto.html      Detalle de un producto (lee ?codigo=)
├── registro.html              Registro de usuario (con validación JS)
├── login.html                  Inicio de sesión (con validación JS)
├── nosotros.html
├── blogs.html
├── blog-1.html / blog-2.html   Detalle de cada blog
├── contacto.html               Formulario de contacto (con validación JS)
├── carrito.html                 Carrito de compras (persistido en localStorage)
├── css/
│   └── style.css               Hoja de estilos única del sitio público
├── js/
│   ├── data.js                  Arreglos de productos, usuarios, regiones y comunas
│   ├── validaciones.js          Funciones reutilizables de validación (RUN, correo, etc.)
│   ├── carrito.js                Lógica del carrito (localStorage)
│   └── main.js                   Navegación, render de tarjetas de producto
├── img/
│   ├── logo.png                  Logo del equipo (fondo transparente)
│   ├── favicon.png                Ícono recortado del logo, usado como favicon
│   ├── juegos/                    Portadas SVG de cada videojuego del catálogo
│   └── ...                        Ilustraciones de hero, nosotros y blogs
└── admin/                        Vista administrador (protegida conceptualmente)
    ├── home.html                  Dashboard con métricas y stock crítico
    ├── productos.html              Listado de productos (mantenedor)
    ├── mostrar-producto.html       Ficha de solo lectura de un producto (lee ?codigo=)
    ├── nuevo-producto.html / editar-producto.html
    ├── usuarios.html                Listado de usuarios (mantenedor)
    ├── mostrar-usuario.html         Ficha de solo lectura de un usuario (lee ?run=)
    ├── nuevo-usuario.html / editar-usuario.html
    ├── css/admin.css                Estilos del layout con sidebar
    └── js/admin.js                  Helpers de tablas y sidebar activo
```

Esta estructura de vistas (listado → mostrar → editar, tanto para productos como usuarios)
sigue el diagrama de flujo de navegación del anexo de instrucciones.

## Catálogo de ejemplo

Los 12 videojuegos del catálogo (`js/data.js`) son **títulos ficticios**, creados para este
proyecto académico y organizados en 5 categorías: Terror, Acción, Narrativo, Indie y Multijugador.
Como todavía no hay base de datos (se implementará en una entrega posterior), productos y usuarios
viven como arreglos de JavaScript. Cambiar esos arreglos actualiza automáticamente el listado, el
detalle, el carrito y el panel de administrador.

## Validaciones implementadas (JavaScript)

- **RUN chileno**: formato sin puntos ni guion y dígito verificador real.
- **Correo**: formato válido y dominio restringido a `@duoc.cl`, `@profesor.duoc.cl`, `@gmail.com`.
- **Contraseña**: 4 a 10 caracteres, con confirmación coincidente.
- **Campos de texto**: requeridos y con largo máximo/mínimo según el anexo de instrucciones.
- **Campos numéricos** (precio, stock, stock crítico): rango y si aceptan o no decimales.
- Todas las validaciones se muestran en tiempo real (al escribir/cambiar) y también al enviar el formulario,
  con mensajes de error y sugerencias específicos por campo.

## Roles del sistema (referencia)

- **Administrador**: acceso total al panel.
- **Vendedor**: solo ve productos/órdenes (implementación visual pendiente de permisos reales).
- **Cliente**: solo accede a la tienda pública.

## Próximos pasos sugeridos (para las siguientes entregas)

- Conectar a un backend/base de datos real.
- Autenticación real y protección de rutas del panel administrador.
- Persistir productos/usuarios creados desde el panel (hoy es una simulación en memoria).
- Documento ERS (Especificación de Requerimientos de Software).
