# Glitch Store — Backend (Spring Boot + Oracle Cloud + JWT)

API REST de la tienda de videojuegos **Glitch Store** para la **Evaluación Parcial 3 (40%)** de
DSY1104 — Desarrollo Fullstack II, Duoc UC. El frontend React (EV2) consume esta API.

## Stack

| Herramienta | Uso |
|---|---|
| Java 17 + Spring Boot 3.3 | API REST |
| Spring Data JPA (Hibernate) | Repositorios y entidades |
| Oracle Autonomous Database (Oracle Cloud) + Wallet | Base de datos (`ojdbc11` + `oraclepki`) |
| Spring Security + JWT (jjwt 0.12) | Autenticación por tokens y autorización por roles |
| springdoc-openapi 2.6 | Documentación Swagger |
| Bean Validation | Validación de datos de entrada (incluye RUN y dominios de correo) |
| JUnit 5 + Mockito + MockMvc | Pruebas de lógica de negocio y seguridad |

## Configuración

1. Descomprimir el **Wallet** de Oracle Cloud en una carpeta local (no se versiona).
2. Copiar `application-local.properties.example` como `application-local.properties` y completar:

   | Variable | Ejemplo |
   |---|---|
   | `DB_WALLET` | `C:/dev/Fullstack/wallet/Wallet_DATABASE2026` |
   | `DB_SERVICE` | `database2026_high` |
   | `DB_USER` / `DB_PASSWORD` | `GLITCH_STORE` / *(contraseña del usuario)* |
   | `JWT_SECRET` | secreto en Base64 de 32 bytes o más |

   También se pueden definir como variables de entorno.
3. El usuario `GLITCH_STORE` debe existir con permisos `CREATE SESSION` y `RESOURCE`.

## Ejecución

```bash
mvnw.cmd spring-boot:run
```

En Windows también se puede usar `iniciar-backend.cmd`: si `JAVA_HOME` no está definido, usa el JDK 17
que trae SQL Developer.

- API: <http://localhost:8080/api/v1>
- Swagger: <http://localhost:8080/swagger-ui.html>

La **primera vez** la aplicación ejecuta `src/main/resources/database/schema.sql` (crea las tablas) y
carga los datos de ejemplo de la EV2 (`database/datos-iniciales.json`): 5 categorías, 12 productos,
3 usuarios y 2 boletas. Después Hibernate solo **valida** que las entidades coincidan con las tablas.

```bash
mvnw.cmd test   # 27 pruebas, no necesitan la base de datos
```

### Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | camila.rojas@duoc.cl | admin123 |
| Vendedor | matias.fernandez@gmail.com | vende123 |
| Cliente | javiera.contreras@profesor.duoc.cl | cliente1 |

Las contraseñas se guardan cifradas con **BCrypt**.

## Modelo de datos

`USUARIO → BOLETA → DETALLE_BOLETA ← PRODUCTO ← CATEGORIA` (propuesta del Anexo 1).

| Tabla | Clave | Relaciones |
|---|---|---|
| `CATEGORIA` | `ID` | — |
| `PRODUCTO` | `CODIGO` | `CATEGORIA_ID → CATEGORIA` |
| `USUARIO` | `RUN` | `ROL` ∈ ADMINISTRADOR, VENDEDOR, CLIENTE |
| `BOLETA` | `ID` (ORD-1001, secuencia `SEQ_BOLETA`) | `USUARIO_RUN → USUARIO` (null si compra un invitado) |
| `DETALLE_BOLETA` | `ID` (identity) | `BOLETA_ID → BOLETA` (cascade), `PRODUCTO_CODIGO → PRODUCTO` |

La boleta guarda una copia del cliente, la dirección, el nombre y el precio cobrado: no cambia si
después se edita o elimina el producto o el usuario.

## Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/v1/auth/login` · `/registro` · `/refresh` | Público |
| GET | `/api/v1/auth/me` | Con sesión |
| GET | `/api/v1/productos` · `/{codigo}` · `/api/v2/productos` · `/{codigo}` | Público |
| GET | `/api/v1/productos/stock-critico` | Administrador, Vendedor |
| POST · PUT · DELETE | `/api/v1/productos` | Administrador |
| GET | `/api/v1/categorias` · `/{id}` | Público |
| POST · PUT · DELETE | `/api/v1/categorias` | Administrador |
| GET · POST · PUT · DELETE | `/api/v1/usuarios` | Administrador |
| POST | `/api/v1/boletas` (checkout) | Público (invitado o con sesión) |
| GET | `/api/v1/boletas` | Administrador, Vendedor |
| GET | `/api/v1/boletas/mias` · `/{id}` | Con sesión (un Cliente solo ve las suyas) |
| PUT · DELETE | `/api/v1/boletas/{id}/estado` · `/{id}` | Administrador |

**Versionado:** `v1` entrega el producto con la misma forma que usa el frontend; `v2` agrega la
categoría completa y campos calculados (`precioFinal`, `enOferta`, `alertaStock`) sin romper a v1.

## Seguridad

- **Login:** correo + contraseña (BCrypt) → `accessToken` (15 min) + `refreshToken` (7 días),
  firmados con HMAC-SHA256. El claim `tipo` impide usar uno en lugar del otro.
- **Cada petición:** `Authorization: Bearer <accessToken>`. `FiltroJwt` verifica firma, emisor y
  vencimiento y registra el RUN y el rol del usuario.
- **Renovación:** `/auth/refresh` vuelve a leer al usuario en la BD, así un cambio de rol o una cuenta
  eliminada se reflejan en el siguiente token.
- **Roles:** reglas por ruta en `ConfiguracionSeguridad`; 401 sin token o con token inválido, 403 si el
  rol no tiene permiso. API *stateless* (sin sesión en el servidor) y CORS limitado al frontend.
- **Integridad de la compra:** el frontend solo envía códigos y cantidades; el backend calcula precios,
  ofertas, cupón y envío, valida el stock y lo descuenta en la misma transacción.

## Estructura

```
src/main/java/cl/duoc/glitchstore/
├── config/        Swagger, creación del esquema y carga de datos iniciales
├── controller/    v1 (auth, productos, categorías, usuarios, boletas) y v2 (productos)
├── dto/           Datos de entrada/salida con validaciones y ejemplos para Swagger
├── exception/     Excepciones de negocio y manejador global de errores (JSON uniforme)
├── model/         Entidades JPA
├── repository/    Repositorios Spring Data
├── security/      JWT, filtro, reglas de acceso y respuestas 401/403
├── service/       Lógica de negocio (compra, cálculo de totales, usuarios, catálogo)
└── validation/    Validación de RUN chileno y dominios de correo
```
