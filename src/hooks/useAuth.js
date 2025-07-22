import { useState, useEffect, useContext, createContext } from 'react';
import { 
  signIn as authSignIn, 
  signUp as authSignUp, 
  signOut as authSignOut,
  resetPassword as authResetPassword,
  updatePassword as authUpdatePassword,
  updateProfile as authUpdateProfile,
  createOrUpdateUserProfile,
  getUserProfile,
  hasCompleteProfile
} from '../services/auth.js';
import { getCurrentUser, getCurrentSession, onAuthStateChange } from '../services/api.js';

// Crear contexto de autenticación
const AuthContext = createContext({});

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para limpiar el error
  const clearError = () => setError(null);

  // Función para manejar errores
  const handleError = (error) => {
    setError(error.message || 'Ha ocurrido un error');
    console.error('Auth Error:', error);
  };

  // Función para cargar el perfil del usuario
  const loadUserProfile = async (userId) => {
    try {
      const result = await getUserProfile(userId);
      if (!result.error) {
        setProfile(result.data);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.warn('Error al cargar perfil:', error);
      setProfile(null);
    }
  };

  // Función para inicializar la autenticación
  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Obtener sesión actual
      const sessionResult = await getCurrentSession();
      if (!sessionResult.error && sessionResult.data) {
        setSession(sessionResult.data);
        setUser(sessionResult.data.user);
        
        // Cargar perfil del usuario
        await loadUserProfile(sessionResult.data.user.id);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error al inicializar autenticación:', error);
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      clearError();
      
      const result = await authSignIn(email, password);
      
      if (result.error) {
        handleError(result);
        return result;
      }

      // La sesión se actualizará automáticamente por el listener
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para registrarse
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      clearError();
      
      const result = await authSignUp(email, password, userData);
      
      if (result.error) {
        handleError(result);
        return result;
      }

      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);
      clearError();
      
      const result = await authSignOut();
      
      if (result.error) {
        handleError(result);
        return result;
      }

      // Limpiar estado local
      setUser(null);
      setProfile(null);
      setSession(null);
      
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para restablecer contraseña
  const resetPassword = async (email) => {
    try {
      clearError();
      
      const result = await authResetPassword(email);
      
      if (result.error) {
        handleError(result);
      }
      
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    }
  };

  // Función para actualizar contraseña
  const updatePassword = async (newPassword) => {
    try {
      clearError();
      
      const result = await authUpdatePassword(newPassword);
      
      if (result.error) {
        handleError(result);
      }
      
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (updates) => {
    try {
      clearError();
      
      const result = await authUpdateProfile(updates);
      
      if (result.error) {
        handleError(result);
        return result;
      }

      // Actualizar usuario local
      setUser(prev => ({ ...prev, user_metadata: { ...prev.user_metadata, ...updates } }));
      
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    }
  };

  // Función para crear o actualizar perfil de usuario
  const createOrUpdateProfile = async (profileData) => {
    try {
      if (!user) {
        return { error: true, message: 'Usuario no autenticado' };
      }

      clearError();
      
      const result = await createOrUpdateUserProfile(user.id, profileData);
      
      if (result.error) {
        handleError(result);
        return result;
      }

      // Actualizar perfil local
      setProfile(result.data);
      
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    }
  };

  // Función para verificar si el perfil está completo
  const checkProfileComplete = async () => {
    if (!user) return { hasProfile: false, isComplete: false };
    
    try {
      const result = await hasCompleteProfile(user.id);
      return result;
    } catch (error) {
      console.warn('Error al verificar perfil completo:', error);
      return { hasProfile: false, isComplete: false };
    }
  };

  // Efecto para inicializar la autenticación
  useEffect(() => {
    initializeAuth();
  }, []);

  // Efecto para escuchar cambios en el estado de autenticación
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Cargar perfil del usuario
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Valores del contexto
  const value = {
    // Estado
    user,
    profile,
    session,
    loading,
    error,
    
    // Funciones de autenticación
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    createOrUpdateProfile,
    checkProfileComplete,
    
    // Utilidades
    clearError,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    isProfileComplete: profile?.full_name && profile?.user_type
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default useAuth;

