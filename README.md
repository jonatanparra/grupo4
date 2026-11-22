# Glitch Store — Tienda online de videojuegos (Grupo 4)

Proyecto semestral de **DSY1104 — Desarrollo Fullstack II**, Duoc UC.

| Carpeta | Contenido |
|---|---|
| [`frontend/`](frontend/README.md) | Tienda y panel administrativo en **React 18 + Bootstrap 5** (EV1 → EV3), pruebas Jasmine + Karma |
| [`backend/`](backend/README.md) | API REST en **Spring Boot 3** con **Oracle Cloud** (Wallet), **JWT** y **Swagger**, pruebas JUnit |

```
grupo4/
├── frontend/          React + Vite (http://localhost:5173)
│   └── docs/          Documento de cobertura del testing
└── backend/           Spring Boot (http://localhost:8080)
    ├── wallet/        Wallet de Oracle Cloud
    └── src/main/resources/database/   schema.sql y datos iniciales
```

## Cómo levantar el proyecto

**Requisitos:** Node.js 18+, Java 17 (sirve el JDK que trae SQL Developer) y el usuario
`GLITCH_STORE` creado en Oracle Cloud.

1. **Backend** (primero). Crear `backend/application-local.properties` a partir del ejemplo
   (contraseña de la BD y secreto JWT) y ejecutar:

   ```bash
   cd backend
   mvnw.cmd spring-boot:run
   ```

   En Windows también sirve `backend\iniciar-backend.cmd`. Swagger queda en
   <http://localhost:8080/swagger-ui.html>.

2. **Frontend**:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Abrir <http://localhost:5173>.

### Pruebas

```bash
cd frontend && npm test      # 215 pruebas Jasmine + Karma, con reporte de cobertura
cd backend && mvnw.cmd test  # 28 pruebas JUnit + Mockito + MockMvc
```

### Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | camila.rojas@duoc.cl | admin123 |
| Vendedor | matias.fernandez@gmail.com | vende123 |
| Cliente | javiera.contreras@profesor.duoc.cl | cliente1 |
