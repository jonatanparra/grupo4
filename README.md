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

1. **Backend** (primero). En Windows, doble clic en `backend\iniciar-backend.cmd`. El script:
   - busca Java 17 solo (JAVA_HOME, PATH, el JDK que trae SQL Developer o un JDK instalado);
   - si falta `backend/application-local.properties` (no se sube a GitHub), pide la contraseña
     de `GLITCH_STORE` y lo crea, generando el secreto JWT;
   - revisa el Wallet y que el puerto 8080 esté libre, y si algo falla deja la ventana abierta
     con el motivo. Con `iniciar-backend.cmd --verificar` solo revisa, sin iniciar.
   - si Oracle responde `ORA-01017` (contraseña incorrecta), ejecutar
     `iniciar-backend.cmd --configurar` para volver a escribir la contraseña.

   La primera vez Maven descarga dependencias (requiere Internet). Swagger queda en
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
