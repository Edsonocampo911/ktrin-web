// Configuración de la aplicación Ktrin
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
  },
  app: {
    name: 'Ktrin',
    version: '2.0.0',
    description: 'Plataforma de gestión de eventos'
  }
};

// Constantes de la aplicación
export const CONSTANTS = {
  // Estados de eventos
  EVENT_STATUS: {
    DRAFT: 'draft',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  // Estados de asistencia
  ATTENDANCE_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    DECLINED: 'declined',
    NO_RESPONSE: 'no_response'
  },
  
  // Estados de servicios
  SERVICE_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  // Tipos de ubicación
  LOCATION_TYPE: {
    ADDRESS: 'address',
    COORDINATES: 'coordinates',
    VENUE: 'venue',
    VIRTUAL: 'virtual'
  },
  
  // Tipos de usuario
  USER_TYPE: {
    CLIENT: 'client',
    PROVIDER: 'provider'
  },
  
  // Categorías de servicios
  SERVICE_CATEGORIES: {
    CATERING: 'Catering',
    ENTERTAINMENT: 'Entretenimiento',
    DECORATION: 'Decoración',
    TECHNICAL: 'Técnico',
    TRANSPORT: 'Transporte',
    SECURITY: 'Seguridad',
    CLEANING: 'Limpieza',
    COORDINATION: 'Coordinación'
  }
};

// Configuración de validación
export const VALIDATION = {
  event: {
    titleMinLength: 3,
    titleMaxLength: 255,
    descriptionMaxLength: 1000,
    guestCountMin: 1,
    guestCountMax: 10000
  },
  guest: {
    nameMinLength: 2,
    nameMaxLength: 255,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  service: {
    nameMinLength: 3,
    nameMaxLength: 255,
    priceMin: 0,
    priceMax: 999999.99
  }
};

