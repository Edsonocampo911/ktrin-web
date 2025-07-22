import { supabase, handleSupabaseError, handleSupabaseSuccess, executeMutation } from './api.js';

// Función para iniciar sesión
export const signIn = async (email, password) => {
  return executeMutation(
    () => supabase.auth.signInWithPassword({ email, password }),
    'inicio de sesión'
  );
};

// Función para registrarse
export const signUp = async (email, password, userData = {}) => {
  return executeMutation(
    () => supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    }),
    'registro de usuario'
  );
};

// Función para cerrar sesión
export const signOut = async () => {
  return executeMutation(
    () => supabase.auth.signOut(),
    'cierre de sesión'
  );
};

// Función para restablecer contraseña
export const resetPassword = async (email) => {
  return executeMutation(
    () => supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    }),
    'restablecimiento de contraseña'
  );
};

// Función para actualizar contraseña
export const updatePassword = async (newPassword) => {
  return executeMutation(
    () => supabase.auth.updateUser({ password: newPassword }),
    'actualización de contraseña'
  );
};

// Función para actualizar perfil de usuario
export const updateProfile = async (updates) => {
  return executeMutation(
    () => supabase.auth.updateUser({ data: updates }),
    'actualización de perfil'
  );
};

// Función para crear o actualizar perfil de usuario en la tabla user_profiles
export const createOrUpdateUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return handleSupabaseError(error, 'crear/actualizar perfil de usuario');
    }

    return handleSupabaseSuccess(data, 'Perfil de usuario actualizado correctamente');
  } catch (error) {
    return handleSupabaseError(error, 'crear/actualizar perfil de usuario');
  }
};

// Función para obtener perfil de usuario
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return handleSupabaseError(error, 'obtener perfil de usuario');
    }

    return handleSupabaseSuccess(data, 'Perfil de usuario obtenido correctamente');
  } catch (error) {
    return handleSupabaseError(error, 'obtener perfil de usuario');
  }
};

// Función para verificar si un usuario tiene perfil completo
export const hasCompleteProfile = async (userId) => {
  try {
    const profileResult = await getUserProfile(userId);
    
    if (profileResult.error) {
      return { hasProfile: false, profile: null };
    }

    const profile = profileResult.data;
    const isComplete = profile && profile.full_name && profile.user_type;

    return { hasProfile: !!profile, isComplete, profile };
  } catch (error) {
    return { hasProfile: false, isComplete: false, profile: null };
  }
};

// Función para obtener todos los proveedores verificados
export const getVerifiedProviders = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_type', 'provider')
      .eq('is_verified', true)
      .order('full_name');

    if (error) {
      return handleSupabaseError(error, 'obtener proveedores verificados');
    }

    return handleSupabaseSuccess(data, 'Proveedores obtenidos correctamente');
  } catch (error) {
    return handleSupabaseError(error, 'obtener proveedores verificados');
  }
};

