@echo off
rem Inicia la API en http://localhost:8080 (Swagger: http://localhost:8080/swagger-ui.html)
rem Si JAVA_HOME no esta definido, usa el JDK 17 que trae SQL Developer.
cd /d "%~dp0"
if "%JAVA_HOME%"=="" set "JAVA_HOME=%USERPROFILE%\Downloads\sqldeveloper\jdk\jre"
call "%~dp0mvnw.cmd" -q spring-boot:run
