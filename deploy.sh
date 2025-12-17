#!/bin/bash

# Santa Alejandría Hotels - Script de Deploy
# Automatiza el proceso de construcción y despliegue

set -e  # Exit on any error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_step() {
    echo -e "${BLUE}[PASO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[ÉXITO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Ejecuta este script desde el directorio raíz del proyecto."
    exit 1
fi

print_step "Iniciando proceso de deploy para Santa Alejandría Hotels..."

# 1. Verificar dependencias
print_step "Verificando dependencias..."
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi

print_success "Node.js y npm están disponibles"

# 2. Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    print_step "Instalando dependencias..."
    npm install
    print_success "Dependencias instaladas"
else
    print_success "Dependencias ya instaladas"
fi

# 3. Verificar que el build funcione
print_step "Construyendo la aplicación para producción..."
npm run build

if [ ! -d "dist" ]; then
    print_error "El directorio dist no se creó correctamente"
    exit 1
fi

print_success "Build completado exitosamente"

# 4. Copiar archivos de configuración
print_step "Copiando archivos de configuración..."

# Copiar .htaccess al directorio dist si existe
if [ -f ".htaccess" ]; then
    cp .htaccess dist/
    print_success ".htaccess copiado a dist/"
fi

# Copiar nginx.conf con un nombre más descriptivo
if [ -f "nginx.conf" ]; then
    cp nginx.conf dist/nginx-production.conf
    print_success "nginx.conf copiado como nginx-production.conf"
fi

# Copiar robots.txt si existe
if [ -f "public/robots.txt" ]; then
    cp public/robots.txt dist/
    print_success "robots.txt copiado a dist/"
fi

# Copiar sitemap.xml si existe
if [ -f "public/sitemap.xml" ]; then
    cp public/sitemap.xml dist/
    print_success "sitemap.xml copiado a dist/"
fi

# 5. Mostrar información del build
print_step "Información del build:"
echo "  - Directorio de salida: dist/"
echo "  - Tamaño del build: $(du -sh dist/ | cut -f1)"
echo "  - Archivos principales:"
ls -la dist/ | head -10

# 6. Instrucciones de deploy
print_step "Instrucciones para el deploy:"
echo ""
echo "Para subir a tu VPS:"
echo "1. Comprimir el directorio dist/:"
echo "   tar -czf santalejandria-hotels.tar.gz dist/"
echo ""
echo "2. Subir al servidor via scp:"
echo "   scp santalejandria-hotels.tar.gz usuario@santalejandriahotels.com:/var/www/"
echo ""
echo "3. En el servidor, extraer:"
echo "   cd /var/www/"
echo "   tar -xzf santalejandria-hotels.tar.gz"
echo "   mv dist/* /var/www/html/ (o el directorio web configurado)"
echo ""
echo "4. Configurar el servidor web:"
echo "   - Apache: .htaccess ya incluido"
echo "   - Nginx: usar nginx-production.conf como referencia"
echo ""
echo "5. Configurar SSL con Let's Encrypt:"
echo "   sudo certbot --apache -d santalejandriahotels.com"
echo ""

# 7. Verificar configuración de archivos
print_step "Verificando archivos importantes..."
if [ -f "dist/index.html" ]; then
    print_success "index.html encontrado"
else
    print_error "index.html no encontrado en dist/"
fi

if [ -f "dist/.htaccess" ]; then
    print_success ".htaccess configurado para Apache"
else
    print_warning ".htaccess no encontrado (necesario para Apache)"
fi

print_success "Proceso de build completado exitosamente!"
echo ""
echo -e "${GREEN}¡Tu aplicación está lista para producción!${NC}"
echo "Los archivos están en el directorio 'dist/'"
echo ""
echo "Próximos pasos:"
echo "1. Configurar el dominio santalejandriahotels.com en tu VPS"
echo "2. Subir los archivos del directorio 'dist/'"
echo "3. Configurar SSL"
echo "4. Probar que todo funcione correctamente"
echo ""