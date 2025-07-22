import { useState, useEffect, useCallback } from 'react';
import {
  registerGuest as registerGuestService,
  validateInvitationCode as validateInvitationCodeService,
  getEventGuests as getEventGuestsService,
  updateGuestAttendance as updateGuestAttendanceService,
  updateGuest as updateGuestService,
  deleteGuest as deleteGuestService,
  getEventGuestStats as getEventGuestStatsService,
  getEventForRegistration as getEventForRegistrationService
} from '../services/guests.js';

export const useGuests = (eventId = null) => {
  const [guests, setGuests] = useState([]);
  const [currentGuest, setCurrentGuest] = useState(null);
  const [eventInfo, setEventInfo] = useState(null);
  const [guestStats, setGuestStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para limpiar errores
  const clearError = () => setError(null);

  // Función para manejar errores
  const handleError = (error) => {
    const errorMessage = error.message || 'Ha ocurrido un error';
    setError(errorMessage);
    console.error('Guests Error:', error);
  };

  // Función para registrar un nuevo invitado
  const registerGuest = async (guestData) => {
    try {
      setLoading(true);
      clearError();

      const result = await registerGuestService(guestData);

      if (result.error) {
        handleError(result);
        return result;
      }

      // Si estamos viendo invitados de este evento, recargar la lista
      if (eventId && guestData.event_id === eventId) {
        await loadEventGuests(eventId);
        await loadGuestStats(eventId);
      }

      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para validar código de invitación
  const validateInvitationCode = async (eventId, invitationCode) => {
    try {
      setLoading(true);
      clearError();

      const result = await validateInvitationCodeService(eventId, invitationCode);

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

  // Función para cargar invitados de un evento
  const loadEventGuests = useCallback(async (eventId) => {
    try {
      setLoading(true);
      clearError();

      const result = await getEventGuestsService(eventId);

      if (result.error) {
        handleError(result);
        return result;
      }

      setGuests(result.data || []);
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cargar estadísticas de invitados
  const loadGuestStats = useCallback(async (eventId) => {
    try {
      const result = await getEventGuestStatsService(eventId);

      if (result.error) {
        console.warn('Error al cargar estadísticas de invitados:', result.message);
        return result;
      }

      setGuestStats(result.data);
      return result;
    } catch (error) {
      console.warn('Error al cargar estadísticas de invitados:', error);
      return { error: true, message: error.message };
    }
  }, []);

  // Función para cargar información del evento para registro
  const loadEventForRegistration = useCallback(async (eventId) => {
    try {
      setLoading(true);
      clearError();

      const result = await getEventForRegistrationService(eventId);

      if (result.error) {
        handleError(result);
        return result;
      }

      setEventInfo(result.data);
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar estado de asistencia
  const updateGuestAttendance = async (guestId, attendanceStatus, plusOneStatus = null) => {
    try {
      setLoading(true);
      clearError();

      const result = await updateGuestAttendanceService(guestId, attendanceStatus, plusOneStatus);

      if (result.error) {
        handleError(result);
        return result;
      }

      // Actualizar invitado en la lista local
      setGuests(prev => prev.map(guest => 
        guest.guest_id === guestId 
          ? { 
              ...guest, 
              attendance_status: attendanceStatus,
              plus_one_attendance: plusOneStatus !== null ? plusOneStatus : guest.plus_one_attendance
            }
          : guest
      ));

      // Recargar estadísticas si tenemos un eventId
      if (eventId) {
        await loadGuestStats(eventId);
      }

      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar información de un invitado
  const updateGuest = async (guestId, updates) => {
    try {
      setLoading(true);
      clearError();

      const result = await updateGuestService(guestId, updates);

      if (result.error) {
        handleError(result);
        return result;
      }

      // Actualizar invitado en la lista local
      setGuests(prev => prev.map(guest => 
        guest.guest_id === guestId ? { ...guest, ...updates } : guest
      ));

      // Actualizar invitado actual si es el mismo
      if (currentGuest && currentGuest.guest_id === guestId) {
        setCurrentGuest(prev => ({ ...prev, ...updates }));
      }

      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un invitado
  const deleteGuest = async (guestId) => {
    try {
      setLoading(true);
      clearError();

      const result = await deleteGuestService(guestId);

      if (result.error) {
        handleError(result);
        return result;
      }

      // Remover invitado de la lista local
      setGuests(prev => prev.filter(guest => guest.guest_id !== guestId));

      // Limpiar invitado actual si es el mismo
      if (currentGuest && currentGuest.guest_id === guestId) {
        setCurrentGuest(null);
      }

      // Recargar estadísticas si tenemos un eventId
      if (eventId) {
        await loadGuestStats(eventId);
      }

      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar datos
  const refresh = useCallback(async () => {
    if (eventId) {
      await Promise.all([
        loadEventGuests(eventId),
        loadGuestStats(eventId)
      ]);
    }
  }, [eventId, loadEventGuests, loadGuestStats]);

  // Cargar datos iniciales cuando el eventId cambie
  useEffect(() => {
    if (eventId) {
      refresh();
    } else {
      setGuests([]);
      setGuestStats(null);
    }
  }, [eventId, refresh]);

  // Funciones de utilidad
  const getGuestById = useCallback((guestId) => {
    return guests.find(guest => guest.guest_id === guestId);
  }, [guests]);

  const getGuestsByStatus = useCallback((status) => {
    return guests.filter(guest => guest.attendance_status === status);
  }, [guests]);

  const getConfirmedGuests = useCallback(() => {
    return guests.filter(guest => guest.attendance_status === 'confirmed');
  }, [guests]);

  const getPendingGuests = useCallback(() => {
    return guests.filter(guest => guest.attendance_status === 'pending');
  }, [guests]);

  const getDeclinedGuests = useCallback(() => {
    return guests.filter(guest => guest.attendance_status === 'declined');
  }, [guests]);

  const getGuestsWithPlusOne = useCallback(() => {
    return guests.filter(guest => guest.plus_one);
  }, [guests]);

  const getGuestsWithDietaryRestrictions = useCallback(() => {
    return guests.filter(guest => 
      guest.dietary_restrictions && guest.dietary_restrictions.length > 0
    );
  }, [guests]);

  const getGuestsWithAllergies = useCallback(() => {
    return guests.filter(guest => 
      guest.allergies && guest.allergies.length > 0
    );
  }, [guests]);

  return {
    // Estado
    guests,
    currentGuest,
    eventInfo,
    guestStats,
    loading,
    error,

    // Funciones principales
    registerGuest,
    validateInvitationCode,
    loadEventGuests,
    loadGuestStats,
    loadEventForRegistration,
    updateGuestAttendance,
    updateGuest,
    deleteGuest,
    refresh,

    // Funciones de utilidad
    getGuestById,
    getGuestsByStatus,
    getConfirmedGuests,
    getPendingGuests,
    getDeclinedGuests,
    getGuestsWithPlusOne,
    getGuestsWithDietaryRestrictions,
    getGuestsWithAllergies,
    clearError,

    // Estado derivado
    hasGuests: guests.length > 0,
    guestsCount: guests.length,
    confirmedCount: getConfirmedGuests().length,
    pendingCount: getPendingGuests().length,
    declinedCount: getDeclinedGuests().length,
    plusOneCount: getGuestsWithPlusOne().length
  };
};

export default useGuests;

