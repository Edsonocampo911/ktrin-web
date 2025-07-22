# Ktrin - Plataforma de Gestión de Eventos

Una aplicación web moderna y completa para la gestión de eventos, desarrollada con React, Vite, TailwindCSS y Supabase.

## 🌟 Características Principales

### 🔐 Autenticación Completa
- Registro de usuarios (clientes y proveedores)
- Inicio de sesión seguro
- Recuperación de contraseña
- Perfiles de usuario personalizados

### 📅 Gestión de Eventos
- Creación de eventos paso a paso
- Configuración detallada (fecha, hora, ubicación, servicios)
- Dashboard con estadísticas en tiempo real
- Gestión de invitados y confirmaciones

### 📱 Códigos QR Funcionales
- Generación automática de códigos QR
- Descarga en múltiples formatos (PNG, SVG)
- URLs de registro personalizadas
- Compartir invitaciones fácilmente

### 👥 Sistema de Invitaciones
- Formularios de registro públicos
- Manejo de restricciones alimentarias
- Confirmación de asistencia
- Gestión de acompañantes (+1)

### 🎨 Diseño Moderno
- Interfaz responsive y atractiva
- Componentes reutilizables con shadcn/ui
- Navegación intuitiva
- Experiencia de usuario optimizada

## 🚀 Tecnologías Utilizadas

- **Frontend:** React 19 + Vite 6
- **Estilos:** TailwindCSS + shadcn/ui
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Iconos:** Lucide React
- **QR Codes:** react-qr-code + qrcode
- **Routing:** React Router DOM
- **Package Manager:** pnpm

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta en Supabase

### 1. Clonar el Repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd ktrin-new
```

### 2. Instalar Dependencias
```bash
pnpm install
```

### 3. Configurar Variables de Entorno
Crear un archivo `.env.local` en la raíz del proyecto:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. Configurar Base de Datos
Ejecutar el script `KTRIN_DATABASE_REDESIGN.sql` en tu proyecto de Supabase.

### 5. Iniciar Servidor de Desarrollo
```bash
pnpm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Scripts Disponibles

```bash
# Desarrollo
pnpm run dev

# Build para producción
pnpm run build

# Preview del build
pnpm run preview

# Linting
pnpm run lint
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React organizados por funcionalidad
│   ├── auth/           # Componentes de autenticación
│   ├── dashboard/      # Componentes del dashboard
│   ├── events/         # Componentes de eventos
│   ├── guests/         # Componentes de invitados
│   ├── invitations/    # Componentes de invitaciones
│   ├── layout/         # Componentes de layout
│   └── qr/            # Componentes de códigos QR
├── hooks/              # Hooks personalizados
│   ├── useAuth.js      # Hook de autenticación
│   ├── useEvents.js    # Hook de eventos
│   ├── useGuests.js    # Hook de invitados
│   └── useServices.js  # Hook de servicios
├── pages/              # Páginas de la aplicación
├── router/             # Configuración de rutas
├── services/           # Servicios de API
│   ├── api.js          # Cliente base de Supabase
│   ├── auth.js         # Servicios de autenticación
│   ├── events.js       # Servicios de eventos
│   ├── guests.js       # Servicios de invitados
│   └── services.js     # Servicios de servicios
└── config.js           # Configuración de la aplicación
```

## 🌐 Rutas de la Aplicación

### Rutas Públicas
- `/auth` - Autenticación (login/registro)
- `/register/:eventId?code=xxx` - Registro de invitados
- `/invitation/:eventId?code=xxx` - Vista de invitaciones

### Rutas Protegidas
- `/dashboard` - Panel principal del cliente
- `/events/create` - Creación de eventos
- `/events/:eventId/qr` - Generador de códigos QR

## 🔧 Configuración de Supabase

### Tablas Principales
- `user_profiles` - Perfiles de usuarios
- `events` - Eventos creados
- `services` - Servicios disponibles
- `event_services` - Servicios por evento
- `guests` - Invitados registrados
- `invitations` - Invitaciones enviadas

### Políticas RLS
Todas las tablas tienen políticas de Row Level Security configuradas para garantizar la seguridad de los datos.

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio con Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

Ver `DEPLOYMENT_GUIDE.md` para instrucciones detalladas.

## 🎯 Funcionalidades Implementadas

- ✅ Sistema de autenticación completo
- ✅ Dashboard con estadísticas
- ✅ Creación de eventos paso a paso
- ✅ Generación de códigos QR
- ✅ Sistema de invitaciones
- ✅ Registro de invitados
- ✅ Manejo de restricciones alimentarias
- ✅ Navegación responsive
- ✅ Integración con Supabase

## 🔮 Funcionalidades Futuras

- 📧 Envío de invitaciones por email
- 📊 Reportes y analytics avanzados
- 💳 Integración de pagos
- 📱 Aplicación móvil
- 🔔 Notificaciones push
- 🌍 Soporte multiidioma

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para la gestión moderna de eventos**

