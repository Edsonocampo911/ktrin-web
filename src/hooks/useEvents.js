import { useState, useEffect, useCallback } from 'react';
import {
  createEvent as createEventService,
  getUserEvents as getUserEventsService,
  getEventDetails as getEventDetailsService,
  updateEvent as updateEventService,
  updateEventStatus as updateEventStatusService,
  deleteEvent as deleteEventService,
  getUserEventStats as getUserEventStatsService
} from '../services/events.js';
import { useAuth } from './useAuth.js';

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para limpiar errores
  const clearError = () => setError(null);

  // Función para manejar errores
  const handleError = (error) => {
    const errorMessage = error.message || 'Ha ocurrido un error';
    setError(errorMessage);
    console.error('Events Error:', error);
  };

  // Función para cargar eventos del usuario
  const loadUserEvents = useCallback(async (status = null) => {
    if (!user) return;

    try {
      setLoading(true);
      clearError();

      const result = await getUserEventsService(user.id, status);

      if (result.error) {
        handleError(result);
        return result;
      }

      setEvents(result.data || []);
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Función para cargar estadísticas de eventos
  const loadEventStats = useCallback(async () => {
    if (!user) return;

    try {
      const result = await getUserEventStatsService(user.id);

      if (result.error) {
        console.warn('Error al cargar estadísticas:', result.message);
        return result;
      }

      setStats(result.data);
      return result;
    } catch (error) {
      console.warn('Error al cargar estadísticas:', error);
      return { error: true, message: error.message };
    }
  }, [user]);

  // Función para crear un nuevo evento
  const createEvent = async (eventData) => {
    try {
      setLoading(true);
      clearError();

      if (!user) {
        const error = { message: 'Usuario no autenticado' };
        handleError(error);
        return { error: true, message: error.message };
      }

      // Agregar ID del organizador
      const eventWithOrganizer = {
        ...eventData,
        organizer_id: user.id
      };

      const result = await createEventService(eventWithOrganizer);

      if (result.error) {
        handleError(result);
        return result;
      }

      // Recargar eventos y estadísticas
      await loadUserEvents();
      await loadEventStats();

      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener detalles de un evento específico
  const getEventDetails = async (eventId) => {
    try {
      setLoading(true);
      clearError();

      const result = await getEventDetailsService(eventId);

      if (result.error) {
        handleError(result);
        return result;
      }

      setCurrentEvent(result.data);
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar un evento
  const updateEvent = async (eventId, updates) => {
    try {
      setLoading(true);
      clearError();

      const result = await updateEventService(eventId, updates);

      if (result.error) {
        handleError(result);
        return result;
      }

      // Actualizar evento en la lista local
      setEvents(prev => prev.map(event => 
        event.event_id === eventId ? { ...event, ...updates } : event
      ));

      // Actualizar evento actual si es el mismo
      if (currentEvent && currentEvent.event_id === eventId) {
        setCurrentEvent(prev => ({ ...prev, ...updates }));
      }

      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar el estado de un evento
  const updateEventStatus = async (eventId, status) => {
    try {
      setLoading(true);
      clearError();

      const result = await updateEventStatusService(eventId, status);

      if (result.error) {
        handleError(result);
        return result;
      }

      // Actualizar evento en la lista local
      setEvents(prev => prev.map(event => 
        event.event_id === eventId ? { ...event, status } : event
      ));

      // Actualizar evento actual si es el mismo
      if (currentEvent && currentEvent.event_id === eventId) {
        setCurrentEvent(prev => ({ ...prev, status }));
      }

      // Recargar estadísticas
      await loadEventStats();

      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un evento
  const deleteEvent = async (eventId) => {
    try {
      setLoading(true);
      clearError();

      const result = await deleteEventService(eventId);

      if (result.error) {
        handleError(result);
        return result;
      }

      // Remover evento de la lista local
      setEvents(prev => prev.filter(event => event.event_id !== eventId));

      // Limpiar evento actual si es el mismo
      if (currentEvent && currentEvent.event_id === eventId) {
        setCurrentEvent(null);
      }

      // Recargar estadísticas
      await loadEventStats();

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
    await Promise.all([
      loadUserEvents(),
      loadEventStats()
    ]);
  }, [loadUserEvents, loadEventStats]);

  // Cargar datos iniciales cuando el usuario cambie
  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setEvents([]);
      setStats(null);
      setCurrentEvent(null);
    }
  }, [user, refresh]);

  // Funciones de utilidad
  const getEventById = useCallback((eventId) => {
    return events.find(event => event.event_id === eventId);
  }, [events]);

  const getEventsByStatus = useCallback((status) => {
    return events.filter(event => event.status === status);
  }, [events]);

  const getUpcomingEvents = useCallback(() => {
    const today = new Date();
    return events.filter(event => new Date(event.event_date) >= today);
  }, [events]);

  const getPastEvents = useCallback(() => {
    const today = new Date();
    return events.filter(event => new Date(event.event_date) < today);
  }, [events]);

  return {
    // Estado
    events,
    currentEvent,
    stats,
    loading,
    error,

    // Funciones principales
    createEvent,
    getEventDetails,
    updateEvent,
    updateEventStatus,
    deleteEvent,
    loadUserEvents,
    loadEventStats,
    refresh,

    // Funciones de utilidad
    getEventById,
    getEventsByStatus,
    getUpcomingEvents,
    getPastEvents,
    clearError,

    // Estado derivado
    hasEvents: events.length > 0,
    eventsCount: events.length
  };
};

export default useEvents;

