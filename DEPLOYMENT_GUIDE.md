# Guía de Despliegue - Ktrin Frontend

## 📋 Información General

**Aplicación:** Ktrin - Plataforma de Gestión de Eventos  
**Versión:** 1.0.0  
**Tecnología:** React + Vite + TailwindCSS + Supabase  
**Fecha de Build:** $(date)

## 🚀 Despliegue en Vercel (Recomendado)

### Prerrequisitos
1. Cuenta en Vercel (vercel.com)
2. Proyecto Supabase configurado
3. Variables de entorno configuradas

### Pasos de Despliegue

1. **Subir el código a GitHub/GitLab**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Ktrin Frontend v1.0"
   git remote add origin [URL_DE_TU_REPOSITORIO]
   git push -u origin main
   ```

2. **Conectar con Vercel**
   - Ir a vercel.com e iniciar sesión
   - Hacer clic en "New Project"
   - Importar el repositorio de GitHub/GitLab
   - Seleccionar el framework: "Vite"
   - Configurar el directorio raíz: `./` (raíz del proyecto)

3. **Configurar Variables de Entorno**
   En la configuración del proyecto en Vercel, agregar:
   ```
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. **Configurar Build Settings**
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

5. **Desplegar**
   - Hacer clic en "Deploy"
   - Esperar a que termine el proceso
   - ¡Tu aplicación estará disponible en la URL proporcionada!

## 🔧 Configuración de Supabase

### Variables de Entorno Requeridas
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### Configuración de Autenticación
1. En el panel de Supabase, ir a Authentication > Settings
2. **IMPORTANTE:** Desactivar "Confirm email" para testing
3. Configurar URLs permitidas:
   - Site URL: `https://tu-dominio.vercel.app`
   - Redirect URLs: `https://tu-dominio.vercel.app/**`

### Base de Datos
- Asegúrate de que el script `KTRIN_DATABASE_REDESIGN.sql` haya sido ejecutado
- Verifica que todas las tablas y políticas RLS estén configuradas

## 📁 Estructura del Proyecto

```
ktrin-new/
├── dist/                    # Build de producción
│   ├── assets/
│   │   ├── index-[hash].css # Estilos compilados
│   │   └── index-[hash].js  # JavaScript compilado
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/          # Componentes React
│   ├── hooks/              # Hooks personalizados
│   ├── pages/              # Páginas de la aplicación
│   ├── router/             # Configuración de rutas
│   ├── services/           # Servicios de API
│   └── config.js           # Configuración
├── package.json
└── vite.config.js
```

## 🌐 URLs de la Aplicación

### Rutas Públicas
- `/auth` - Autenticación (login/registro)
- `/register/:eventId?code=xxx` - Registro de invitados
- `/invitation/:eventId?code=xxx` - Vista de invitaciones

### Rutas Protegidas
- `/dashboard` - Panel principal del cliente
- `/events/create` - Creación de eventos
- `/events/:eventId/qr` - Generador de códigos QR

## 🔍 Testing Local

### Servidor de Desarrollo
```bash
cd ktrin-new
pnpm install
pnpm run dev
```
Acceder a: http://localhost:5173

### Build de Producción
```bash
pnpm run build
pnpm run preview
```

## 📊 Métricas del Build

- **Tamaño total:** ~732 KB
- **CSS:** 97 KB (15.5 KB gzipped)
- **JavaScript:** 635 KB (191 KB gzipped)
- **Tiempo de build:** ~5.4 segundos

## 🛠️ Optimizaciones Implementadas

1. **Code Splitting:** Configurado para chunks optimizados
2. **Tree Shaking:** Eliminación de código no utilizado
3. **Minificación:** CSS y JS minificados
4. **Compresión:** Gzip habilitado
5. **Lazy Loading:** Componentes cargados bajo demanda

## 🔒 Seguridad

1. **Variables de entorno:** Nunca exponer claves secretas
2. **HTTPS:** Siempre usar conexiones seguras en producción
3. **CORS:** Configurado correctamente en Supabase
4. **RLS:** Políticas de seguridad a nivel de fila habilitadas

## 📞 Soporte

Para problemas de despliegue:
1. Verificar variables de entorno
2. Revisar logs de build en Vercel
3. Confirmar configuración de Supabase
4. Verificar que la base de datos esté actualizada

## 🎯 Funcionalidades Principales

- ✅ Autenticación completa (login, registro, recuperación)
- ✅ Dashboard del cliente con estadísticas
- ✅ Creación de eventos paso a paso
- ✅ Generación de códigos QR funcionales
- ✅ Sistema de invitaciones por email
- ✅ Registro de invitados con restricciones alimentarias
- ✅ Navegación responsive y optimizada
- ✅ Integración completa con Supabase

---

**¡Tu aplicación Ktrin está lista para producción!** 🎉

