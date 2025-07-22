import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

// Crear cliente de Supabase
export const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// Función para manejar errores de Supabase de manera consistente
export const handleSupabaseError = (error, operation = 'operación') => {
  console.error(`Error en ${operation}:`, error);
  
  // Mapear errores comunes a mensajes amigables
  const errorMessages = {
    'Invalid login credentials': 'Credenciales de inicio de sesión inválidas',
    'Email not confirmed': 'Email no confirmado. Revisa tu bandeja de entrada.',
    'User already registered': 'El usuario ya está registrado',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
    'Invalid email': 'Email inválido',
    'Network error': 'Error de conexión. Verifica tu conexión a internet.',
    'Row Level Security': 'No tienes permisos para realizar esta acción'
  };
  
  // Buscar mensaje específico
  const errorMessage = error?.message || error?.error_description || error;
  const friendlyMessage = Object.keys(errorMessages).find(key => 
    errorMessage.includes(key)
  );
  
  return {
    error: true,
    message: friendlyMessage ? errorMessages[friendlyMessage] : `Error en ${operation}: ${errorMessage}`,
    originalError: error
  };
};

// Función para formatear respuestas exitosas
export const handleSupabaseSuccess = (data, message = 'Operación exitosa') => {
  return {
    error: false,
    message,
    data
  };
};

// Función para verificar si el usuario está autenticado
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return handleSupabaseError(error, 'obtener usuario actual');
    }
    
    return handleSupabaseSuccess(user, 'Usuario obtenido correctamente');
  } catch (error) {
    return handleSupabaseError(error, 'obtener usuario actual');
  }
};

// Función para obtener la sesión actual
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return handleSupabaseError(error, 'obtener sesión actual');
    }
    
    return handleSupabaseSuccess(session, 'Sesión obtenida correctamente');
  } catch (error) {
    return handleSupabaseError(error, 'obtener sesión actual');
  }
};

// Función para escuchar cambios en el estado de autenticación
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

// Función para realizar consultas con manejo de errores
export const executeQuery = async (queryFunction, operation = 'consulta') => {
  try {
    const result = await queryFunction();
    
    if (result.error) {
      return handleSupabaseError(result.error, operation);
    }
    
    return handleSupabaseSuccess(result.data, `${operation} exitosa`);
  } catch (error) {
    return handleSupabaseError(error, operation);
  }
};

// Función para realizar mutaciones con manejo de errores
export const executeMutation = async (mutationFunction, operation = 'mutación') => {
  try {
    const result = await mutationFunction();
    
    if (result.error) {
      return handleSupabaseError(result.error, operation);
    }
    
    return handleSupabaseSuccess(result.data, `${operation} exitosa`);
  } catch (error) {
    return handleSupabaseError(error, operation);
  }
};

export default supabase;

