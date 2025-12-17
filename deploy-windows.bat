@echo off
echo Santa Alejandria Hotels - Script de Deploy para Windows
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ERROR: No se encontro package.json. Ejecuta este script desde el directorio raiz del proyecto.
    pause
    exit /b 1
)

echo [PASO] Construyendo la aplicacion para produccion...
npm run build

if not exist "dist" (
    echo ERROR: El directorio dist no se creo correctamente
    pause
    exit /b 1
)

echo [PASO] Copiando archivos de configuracion...

REM Copiar .htaccess si existe
if exist ".htaccess" (
    copy ".htaccess" "dist\.htaccess" >nul
    echo .htaccess copiado a dist\
)

REM Copiar nginx.conf con nombre descriptivo
if exist "nginx.conf" (
    copy "nginx.conf" "dist\nginx-production.conf" >nul
    echo nginx.conf copiado como nginx-production.conf
)

echo.
echo [PASO] Informacion del build:
echo Directorio de salida: dist\
echo.

echo Archivos principales en dist\:
dir "dist\" /b

echo.
echo [PASO] Instrucciones para el deploy:
echo.
echo Para subir a tu VPS:
echo 1. Comprimir el directorio dist:
echo    Usa WinRAR, 7-Zip o cualquier herramienta para crear santalejandria-hotels.zip
echo.
echo 2. Subir al servidor via WinSCP, FileZilla o scp:
echo    scp santalejandria-hotels.zip usuario@santalejandriahotels.com:/var/www/
echo.
echo 3. En el servidor, extraer:
echo    cd /var/www/
echo    unzip santalejandria-hotels.zip
echo    mv dist\* /var/www/html/ (o el directorio web configurado)
echo.
echo 4. Configurar el servidor web:
echo    - Apache: .htaccess ya incluido
echo    - Nginx: usar nginx-production.conf como referencia
echo.
echo 5. Configurar SSL con Let's Encrypt:
echo    sudo certbot --apache -d santalejandriahotels.com
echo.
echo [EXITO] Proceso de build completado exitosamente!
echo.
echo Tu aplicacion esta lista para produccion!
echo Los archivos estan en el directorio 'dist\'
echo.
echo Proximos pasos:
echo 1. Configurar el dominio santalejandriahotels.com en tu VPS
echo 2. Subir los archivos del directorio 'dist\'
echo 3. Configurar SSL
echo 4. Probar que todo funcione correctamente
echo.
pause