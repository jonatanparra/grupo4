@echo off
setlocal EnableExtensions EnableDelayedExpansion
rem =====================================================================
rem  Glitch Store - inicia la API en http://localhost:8080
rem  Swagger: http://localhost:8080/swagger-ui.html
rem
rem  Antes de iniciar revisa:
rem    1. Java 17 o superior (JAVA_HOME, PATH, JDK de SQL Developer o JDK instalado)
rem    2. application-local.properties (si no existe, lo crea pidiendo la clave)
rem    3. El Wallet de Oracle en wallet\Wallet_DATABASE2026
rem    4. Que el puerto 8080 este libre
rem
rem  Uso:  iniciar-backend.cmd             revisa e inicia
rem        iniciar-backend.cmd --verificar  solo revisa (no inicia)
rem =====================================================================
cd /d "%~dp0"
title Glitch Store - Backend
echo.
echo  === Glitch Store - Backend ===
echo.

rem ---------- 1. Java ----------
call :buscarJava
if not defined JAVA_HOME goto :sinJava
"!JAVA_HOME!\bin\java.exe" -version >nul 2>&1 || goto :sinJava
set "VERSION_JAVA="
for /f "tokens=3" %%v in ('""!JAVA_HOME!\bin\java.exe" -version 2>&1 | findstr /i "version""') do set "VERSION_JAVA=%%~v"
set "MAYOR_JAVA="
for /f "delims=." %%m in ("!VERSION_JAVA!") do set "MAYOR_JAVA=%%m"
if not defined MAYOR_JAVA goto :sinJava
if "!MAYOR_JAVA!"=="1" goto :javaAntiguo
if !MAYOR_JAVA! LSS 17 goto :javaAntiguo
if not exist "!JAVA_HOME!\bin\javac.exe" (
    echo  [ERROR] "!JAVA_HOME!" es un JRE sin compilador ^(javac^). Se necesita un JDK 17.
    goto :sinJavaAyuda
)
echo  [OK] Java !VERSION_JAVA!  ^(!JAVA_HOME!^)

rem ---------- 2. Configuracion local ----------
if exist "application-local.properties" (
    echo  [OK] application-local.properties
    goto :wallet
)
if defined DB_PASSWORD if defined JWT_SECRET (
    echo  [OK] Credenciales tomadas de variables de entorno
    goto :wallet
)
call :crearConfiguracion || goto :fallo

:wallet
rem ---------- 3. Wallet ----------
set "CARPETA_WALLET=wallet\Wallet_DATABASE2026"
if defined DB_WALLET set "CARPETA_WALLET=%DB_WALLET%"
if exist "application-local.properties" (
    for /f "tokens=1,* delims==" %%a in ('findstr /b /c:"DB_WALLET=" application-local.properties') do set "CARPETA_WALLET=%%b"
)
if not exist "!CARPETA_WALLET!\tnsnames.ora" (
    echo  [ERROR] No se encuentra el Wallet en "!CARPETA_WALLET!".
    echo          Debe existir la carpeta con tnsnames.ora y cwallet.sso.
    echo          Si application-local.properties tiene una linea DB_WALLET= con una ruta de otro equipo,
    echo          borrala para usar la carpeta wallet\Wallet_DATABASE2026 del proyecto.
    goto :fallo
)
echo  [OK] Wallet  ^(!CARPETA_WALLET!^)

rem ---------- 4. Puerto ----------
netstat -ano | findstr /r /c:":8080 .*LISTENING" >nul 2>&1 && (
    echo  [ERROR] El puerto 8080 ya esta en uso. Cierra la otra ventana del backend ^(o el programa que lo use^) y vuelve a intentar.
    goto :fallo
)
echo  [OK] Puerto 8080 libre

if /i "%~1"=="--verificar" (
    echo.
    echo  Todo listo. Ejecuta iniciar-backend.cmd sin parametros para iniciar.
    goto :fin
)

echo.
echo  Iniciando... la primera vez Maven descarga dependencias desde Internet ^(puede tardar unos minutos^).
echo  Para detener el backend presiona Ctrl+C.
echo.
call "%~dp0mvnw.cmd" -q spring-boot:run
if errorlevel 1 goto :fallo
goto :fin

rem =====================================================================
rem  Busqueda de un JDK 17+. Deja el resultado en JAVA_HOME.
rem =====================================================================
:buscarJava
rem 1) JAVA_HOME ya definido y valido
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" exit /b 0
set "JAVA_HOME="
rem 2) java del PATH (si es un JDK)
for /f "delims=" %%j in ('where java 2^>nul') do if not defined JAVA_HOME call :probarJdk "%%~dpj.."
if defined JAVA_HOME exit /b 0
rem 3) JDK que trae SQL Developer, en las carpetas habituales
for %%r in ("%USERPROFILE%\Downloads" "%USERPROFILE%\Descargas" "%USERPROFILE%\Desktop" "%USERPROFILE%\Escritorio" "%USERPROFILE%\Documents" "%USERPROFILE%" "C:" "%ProgramFiles%") do if not defined JAVA_HOME call :probarSqlDeveloper "%%~r"
if defined JAVA_HOME exit /b 0
rem 4) JDK instalados (Oracle, Eclipse Adoptium/Temurin, Microsoft, Zulu, Amazon Corretto, IntelliJ)
for %%r in ("%ProgramFiles%\Java" "%ProgramFiles%\Eclipse Adoptium" "%ProgramFiles%\Microsoft" "%ProgramFiles%\Zulu" "%ProgramFiles%\Amazon Corretto" "%USERPROFILE%\.jdks") do if not defined JAVA_HOME call :probarCarpetaJdks "%%~r"
exit /b 0

:probarSqlDeveloper
for /d %%s in ("%~1\sqldeveloper*") do call :probarJdk "%%~s\jdk\jre"
for /d %%s in ("%~1\sqldeveloper*") do call :probarJdk "%%~s\sqldeveloper\jdk\jre"
exit /b 0

:probarCarpetaJdks
for /d %%s in ("%~1\*") do call :probarJdk "%%~s"
exit /b 0

:probarJdk
if defined JAVA_HOME exit /b 0
if exist "%~f1\bin\javac.exe" set "JAVA_HOME=%~f1"
exit /b 0

rem =====================================================================
rem  Crea application-local.properties pidiendo la clave de la BD.
rem =====================================================================
:crearConfiguracion
echo  [AVISO] No existe application-local.properties ^(no se sube a GitHub porque tiene la clave^).
echo      Se creara ahora. El secreto JWT se genera automaticamente.
echo.
set "CLAVE_BD="
set /p "CLAVE_BD=     Contrasena del usuario GLITCH_STORE en Oracle: "
if not defined CLAVE_BD (
    echo  [ERROR] La contrasena no puede quedar vacia.
    exit /b 1
)
set "SECRETO="
for /f "delims=" %%s in ('powershell -NoProfile -Command "$b = New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)"') do set "SECRETO=%%s"
if not defined SECRETO (
    echo  [ERROR] No se pudo generar el secreto JWT con PowerShell.
    exit /b 1
)
> application-local.properties echo # Credenciales locales ^(NO versionar^). Creado por iniciar-backend.cmd
>> application-local.properties echo DB_SERVICE=database2026_high
>> application-local.properties echo DB_USER=GLITCH_STORE
>> application-local.properties echo DB_PASSWORD=!CLAVE_BD!
>> application-local.properties echo JWT_SECRET=!SECRETO!
echo  [OK] application-local.properties creado
exit /b 0

rem =====================================================================
:javaAntiguo
echo  [ERROR] Se encontro Java !VERSION_JAVA! en "!JAVA_HOME!", pero se necesita Java 17 o superior.
goto :sinJavaAyuda

:sinJava
echo  [ERROR] No se encontro Java ^(JDK 17 o superior^).

:sinJavaAyuda
echo.
echo  Opciones:
echo    - Instalar un JDK 17 (por ejemplo Eclipse Temurin 17) y volver a ejecutar este archivo.
echo    - O indicar el JDK que trae SQL Developer, en esta misma ventana:
echo        set JAVA_HOME=C:\ruta\sqldeveloper\jdk\jre
echo        iniciar-backend.cmd
goto :fallo

:fallo
echo.
echo  No se pudo iniciar el backend. Revisa el mensaje anterior.
echo.
pause
endlocal
exit /b 1

:fin
endlocal
exit /b 0
