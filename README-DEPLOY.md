# Deploy a Producción - Santa Alejandría Hotels

## 🚀 Guía Completa de Deploy

Esta guía te ayudará a subir tu aplicación React a tu VPS con el dominio `santalejandriahotels.com`.

## 📋 Prerrequisitos

- VPS con Ubuntu/Debian (recomendado)
- Node.js 18+ instalado
- npm o yarn
- Acceso SSH al servidor
- Dominio configurado (santalejandriahotels.com)

## 🛠️ Preparación del Proyecto

### 1. Construir la Aplicación

```bash
# Instalar dependencias (si no están instaladas)
npm install

# Construir para producción
npm run build
```

### 2. Usar el Script de Deploy

El proyecto incluye un script automatizado:

```bash
# En Linux/Mac
chmod +x deploy.sh
./deploy.sh

# En Windows (usar Git Bash o WSL)
bash deploy.sh
```

El script automáticamente:
- ✅ Verifica dependencias
- ✅ Construye la aplicación
- ✅ Copia archivos de configuración
- ✅ Genera instrucciones de deploy

## 🌐 Configuración del Servidor

### Opción A: Servidor con Apache

1. **Subir archivos al servidor:**
```bash
# Comprimir el directorio dist
tar -czf santalejandria-hotels.tar.gz dist/

# Subir al servidor
scp santalejandria-hotels.tar.gz usuario@santalejandriahotels.com:/var/www/

# En el servidor
cd /var/www/
tar -xzf santalejandria-hotels.tar.gz
mv dist/* /var/www/html/
```

2. **Configurar virtual host:**
```apache
<VirtualHost *:80>
    ServerName santalejandriahotels.com
    ServerAlias www.santalejandriahotels.com
    DocumentRoot /var/www/html
    
    # El archivo .htaccess ya incluido maneja las rutas SPA
</VirtualHost>
```

3. **Habilitar módulos Apache:**
```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod deflate
sudo systemctl restart apache2
```

### Opción B: Servidor con Nginx

1. **Subir archivos (igual que Apache)**

2. **Configurar Nginx:**
```bash
# Copiar la configuración incluida
sudo cp nginx-production.conf /etc/nginx/sites-available/santalejandriahotels.com

# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/santalejandriahotels.com /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔒 Configurar SSL con Let's Encrypt

### Para Apache:
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d santalejandriahotels.com -d www.santalejandriahotels.com
```

### Para Nginx:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d santalejandriahotels.com -d www.santalejandriahotels.com
```

## 📁 Archivos de Configuración Incluidos

### `.htaccess` (Apache)
- ✅ Redirecciones HTTPS
- ✅ Manejo de rutas SPA
- ✅ Headers de seguridad
- ✅ Compresión GZIP
- ✅ Cache control

### `nginx.conf` (Nginx)
- ✅ Configuración SSL
- ✅ Headers de seguridad
- ✅ Compresión GZIP
- ✅ Cache control
- ✅ Manejo de rutas SPA

### `robots.txt`
- ✅ Configurado para el dominio correcto
- ✅ Incluye sitemap

### `sitemap.xml`
- ✅ URLs principales del sitio
- ✅ Fechas de modificación
- ✅ Prioridades SEO

## 🎯 Configuraciones Optimizadas

### Build de Producción
El `vite.config.ts` incluye optimizaciones:
- ⚡ Minificación con Terser
- 📦 Code splitting automático
- 🗑️ Eliminación de console.log en producción
- 🖼️ Optimización de assets

### SEO y Performance
- 🔍 Meta tags optimizadas
- 📱 Responsive design
- 🖼️ Imágenes optimizadas
- ⚡ Lazy loading
- 🗺️ Structured data (JSON-LD)

## 🔧 Variables de Entorno (Opcional)

Si necesitas variables de entorno para producción:

```bash
# Crear archivo .env.production
VITE_API_URL=https://api.santalejandriahotels.com
VITE_ANALYTICS_ID=tu-analytics-id

# Construir con variables de entorno
npm run build
```

## 📊 Verificación Post-Deploy

### Checklist de Verificación:

- [ ] **SSL funcionando:** `https://santalejandriahotels.com`
- [ ] **Rutas SPA funcionando:** Todas las rutas cargan correctamente
- [ ] **Assets cargando:** Imágenes, CSS, JS
- [ ] **Responsive:** Funciona en móvil y desktop
- [ ] **Performance:** Tiempo de carga < 3 segundos
- [ ] **SEO:** Meta tags, sitemap, robots.txt
- [ ] **Headers de seguridad:** Configurados correctamente

### Herramientas de Verificación:

```bash
# Verificar headers de seguridad
curl -I https://santalejandriahotels.com

# Verificar SSL
ssl-checker santalejandriahotels.com

# Verificar sitemap
curl https://santalejandriahotels.com/sitemap.xml
```

## 🆘 Solución de Problemas Comunes

### 1. Error 404 en rutas SPA
**Problema:** Las rutas no funcionan, muestran 404
**Solución:** 
- Verificar que `.htaccess` esté en el directorio correcto
- Para Nginx: verificar configuración `try_files $uri $uri/ /index.html;`

### 2. Assets no cargan
**Problema:** CSS/JS muestran errores 404
**Solución:**
- Verificar que los archivos estén en `/assets/`
- Verificar permisos de archivos

### 3. SSL no funciona
**Problema:** Certificado no válido
**Solución:**
```bash
sudo certbot renew --force-renewal
sudo systemctl restart apache2  # o nginx
```

### 4. Performance lenta
**Problema:** Sitio carga lento
**Solución:**
- Verificar compresión GZIP activada
- Verificar cache headers
- Optimizar imágenes

## 📈 Monitoreo y Mantenimiento

### Logs del Servidor
```bash
# Apache
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Renovación Automática de SSL
```bash
# Verificar que esté configurado
sudo systemctl status certbot.timer

# Manual
sudo certbot renew
```

### Backup
```bash
# Crear backup de archivos
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/html/

# Backup de configuración
sudo cp -r /etc/apache2/sites-available/ ./apache-backup/
# o
sudo cp -r /etc/nginx/sites-available/ ./nginx-backup/
```

## 📞 Contacto y Soporte

Para problemas técnicos o preguntas sobre el deploy, revisa:

1. **Logs del servidor** para errores específicos
2. **Configuración DNS** del dominio
3. **Documentación del proveedor VPS**
4. **Comunidad React/Vite** para problemas de build

---

## ✅ Resumen de Archivos Modificados/Creados

| Archivo | Propósito | Estado |
|---------|-----------|---------|
| `index.html` | Meta tags SEO, dominio correcto | ✅ Actualizado |
| `vite.config.ts` | Optimizaciones de build | ✅ Actualizado |
| `.htaccess` | Configuración Apache SPA | ✅ Creado |
| `nginx.conf` | Configuración Nginx | ✅ Creado |
| `robots.txt` | SEO, dominio correcto | ✅ Actualizado |
| `sitemap.xml` | SEO | ✅ Creado |
| `deploy.sh` | Automatización de deploy | ✅ Creado |
| `README-DEPLOY.md` | Documentación | ✅ Creado |

**¡Tu aplicación está lista para producción! 🚀**