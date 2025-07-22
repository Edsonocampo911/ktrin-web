import { supabase, handleSupabaseError, handleSupabaseSuccess, executeQuery, executeMutation } from './api.js';
import { CONSTANTS } from '../config.js';

// Función para crear un nuevo evento
export const createEvent = async (eventData) => {
  try {
    // Validar datos del evento
    const validation = validateEventData(eventData);
    if (!validation.isValid) {
      return handleSupabaseError(validation.errors.join(', '), 'validación de datos del evento');
    }

    // Crear el evento principal
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([{
        organizer_id: eventData.organizer_id,
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.event_type,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        end_time: eventData.end_time,
        location_type: eventData.location_type,
        location_data: eventData.location_data,
        guest_count: eventData.guest_count,
        budget_estimate: eventData.budget_estimate,
        special_requests: eventData.special_requests,
        dietary_notes: eventData.dietary_notes,
        allow_plus_one: eventData.allow_plus_one || false,
        rsvp_deadline: eventData.rsvp_deadline,
        status: CONSTANTS.EVENT_STATUS.DRAFT
      }])
      .select()
      .single();

    if (eventError) {
      return handleSupabaseError(eventError, 'crear evento');
    }

    // Si hay servicios seleccionados, agregarlos al evento
    if (eventData.selectedServices && eventData.selectedServices.length > 0) {
      const servicesResult = await addServicesToEvent(event.event_id, eventData.selectedServices);
      if (servicesResult.error) {
        // Si falla agregar servicios, eliminar el evento creado
        await supabase.from('events').delete().eq('event_id', event.event_id);
        return servicesResult;
      }
    }

    // Crear invitación principal automáticamente
    const invitationResult = await createMainInvitation(event.event_id);
    if (invitationResult.error) {
      console.warn('No se pudo crear la invitación principal:', invitationResult.message);
    }

    return handleSupabaseSuccess(event, 'Evento creado exitosamente');
  } catch (error) {
    return handleSupabaseError(error, 'crear evento');
  }
};

// Función para agregar servicios a un evento
export const addServicesToEvent = async (eventId, services) => {
  try {
    const serviceEntries = services.map(service => ({
      event_id: eventId,
      service_id: service.service_id,
      quantity: service.quantity || 1,
      custom_price: service.custom_price || null,
      notes: service.notes || null,
      status: CONSTANTS.SERVICE_STATUS.PENDING
    }));

    const { data, error } = await supabase
      .from('event_services')
      .insert(serviceEntries)
      .select();

    if (error) {
      return handleSupabaseError(error, 'agregar servicios al evento');
    }

    return handleSupabaseSuccess(data, 'Servicios agregados al evento exitosamente');
  } catch (error) {
    return handleSupabaseError(error, 'agregar servicios al evento');
  }
};

// Función para crear invitación principal
export const createMainInvitation = async (eventId) => {
  try {
    const invitationCode = generateInvitationCode();
    
    const { data, error } = await supabase
      .from('invitations')
      .insert([{
        event_id: eventId,
        invitation_code: invitationCode,
        is_main_invitation: true,
        qr_code_data: `${window.location.origin}/guest-registration/${eventId}?code=${invitationCode}`
      }])
      .select()
      .single();

    if (error) {
      return handleSupabaseError(error, 'crear invitación principal');
    }

    return handleSupabaseSuccess(data, 'Invitación principal creada exitosamente');
  } catch (error) {
    return handleSupabaseError(error, 'crear invitación principal');
  }
};

// Función para obtener eventos del usuario
export const getUserEvents = async (userId, status = null) => {
  try {
    let query = supabase
      .from('events_with_details')
      .select('*')
      .eq('organizer_id', userId)
      .order('event_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return handleSupabaseError(error, 'obtener eventos del usuario');
    }

    return handleSupabaseSuccess(data, 'Eventos obtenidos exitosamente');
  } catch (error) {
    return handleSupabaseError(error, 'obtener eventos del usuario');
  }
};

// Función para obtener un evento específico con todos sus detalles
export const getEventDetails = async (eventId) => {
  try {
    // Obtener datos básicos del evento
    const { data: event, error: eventError } = await supabase
      .from('events_with_details')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (eventError) {
      return handleSupabaseError(eventError, 'obtener detalles del evento');
    }

    // Obtener servicios del evento
    const { data: services, error: servicesError } = await supabase
      .from('event_services')
      .select(`
        *,
        services (*)
      `)
      .eq('event_id', eventId);

    if (servicesError) {
      return handleSupabaseError(servicesError, 'obtener servicios del evento');
    }

    // Obtener invitaciones del evento
    const { data: invitations, error: invitationsError } = await supabase
      .from('invitations')
      .select('*')
      .eq('event_id', eventId);

    if (invitationsError) {
      return handleSupabaseError(invitationsError, 'obtener invitaciones del evento');
    }

    // Obtener invitados del evento
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });

    if (guestsError) {
      return handleSupabaseError(guestsError, 'obtener invitados del evento');
    }

    const eventDetails = {
      ...event,
      services: services || [],
      invitations: invitations || [],
      guests: guests || []
    };

    return handleSupabaseSuccess(eventDetails, 'Detalles del evento obtenidos exitosamente');
  } catch (error) {
    return handleSupabaseError(error, 'obtener detalles del evento');
  }
};

// Función para actualizar un evento
export const updateEvent = async (eventId, updates) => {
  return executeMutation(
    () => supabase
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('event_id', eventId)
      .select()
      .single(),
    `actualizar evento ${eventId}`
  );
};

// Función para cambiar el estado de un evento
export const updateEventStatus = async (eventId, status) => {
  return updateEvent(eventId, { status });
};

// Función para eliminar un evento
export const deleteEvent = async (eventId) => {
  return executeMutation(
    () => supabase
      .from('events')
      .delete()
      .eq('event_id', eventId),
    `eliminar evento ${eventId}`
  );
};

// Función para obtener estadísticas de eventos del usuario
export const getUserEventStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('event_id, status, event_date, guest_count')
      .eq('organizer_id', userId);

    if (error) {
      return handleSupabaseError(error, 'obtener estadísticas de eventos');
    }

    const today = new Date();
    const stats = {
      total: data.length,
      upcoming: 0,
      past: 0,
      draft: 0,
      confirmed: 0,
      totalGuests: 0,
      byStatus: {}
    };

    data.forEach(event => {
      const eventDate = new Date(event.event_date);
      
      // Contar por estado
      if (!stats.byStatus[event.status]) {
        stats.byStatus[event.status] = 0;
      }
      stats.byStatus[event.status]++;

      // Contar por tiempo
      if (eventDate >= today) {
        stats.upcoming++;
      } else {
        stats.past++;
      }

      // Contar por estado específico
      if (event.status === CONSTANTS.EVENT_STATUS.DRAFT) {
        stats.draft++;
      } else if (event.status === CONSTANTS.EVENT_STATUS.CONFIRMED) {
        stats.confirmed++;
      }

      // Sumar invitados
      stats.totalGuests += event.guest_count || 0;
    });

    return handleSupabaseSuccess(stats, 'Estadísticas de eventos obtenidas exitosamente');
  } catch (error) {
    return handleSupabaseError(error, 'obtener estadísticas de eventos');
  }
};

// Función para generar código de invitación único
const generateInvitationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Función para validar datos de evento
export const validateEventData = (eventData) => {
  const errors = [];

  if (!eventData.title || eventData.title.trim().length < 3) {
    errors.push('El título del evento debe tener al menos 3 caracteres');
  }

  if (!eventData.event_type || eventData.event_type.trim().length === 0) {
    errors.push('El tipo de evento es requerido');
  }

  if (!eventData.event_date) {
    errors.push('La fecha del evento es requerida');
  } else {
    const eventDate = new Date(eventData.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      errors.push('La fecha del evento no puede ser en el pasado');
    }
  }

  if (!eventData.event_time) {
    errors.push('La hora del evento es requerida');
  }

  if (!eventData.location_type || !eventData.location_data) {
    errors.push('La ubicación del evento es requerida');
  }

  if (!eventData.guest_count || eventData.guest_count < 1) {
    errors.push('El número de invitados debe ser mayor a 0');
  }

  if (eventData.rsvp_deadline) {
    const rsvpDate = new Date(eventData.rsvp_deadline);
    const eventDate = new Date(eventData.event_date);
    
    if (rsvpDate > eventDate) {
      errors.push('La fecha límite de confirmación no puede ser posterior a la fecha del evento');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

