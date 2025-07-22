import { supabase, handleSupabaseError, handleSupabaseSuccess, executeQuery, executeMutation } from './api.js';
import { CONSTANTS } from '../config.js';

// Función para registrar un nuevo invitado
export const registerGuest = async (guestData) => {
  try {
    // Validar datos del invitado
    const validation = validateGuestData(guestData);
    if (!validation.isValid) {
      return handleSupabaseError(validation.errors.join(', '), 'validación de datos del invitado');
    }

    // Verificar que el código de invitación sea válido
    const invitationResult = await validateInvitationCode(guestData.event_id, guestData.invitation_code);
    if (invitationResult.error) {
      return invitationResult;
    }

    // Verificar si el invitado ya está registrado
    const existingGuest = await checkExistingGuest(guestData.event_id, guestData.email);
    if (existingGuest.data) {
      return handleSupabaseError('Este email ya está registrado para este evento', 'verificar invitado existente');
    }

    // Registrar el invitado
    const { data, error } = await supabase
      .from('guests')
      .insert([{
        event_id: guestData.event_id,
        invitation_id: invitationResult.data.invitation_id,
        name: guestData.name,
        email: guestData.email,
        phone: guestData.phone,
        plus_one: guestData.plus_one || false,
        plus_one_name: guestData.plus_one_name,
        plus_one_email: guestData.plus_one_email,
        dietary_restrictions: guestData.dietary_restrictions || [],
        allergies: guestData.allergies || [],
        special_needs: guestData.special_needs,
        notes: guestData.notes,
        attendance_status: CONSTANTS.ATTENDANCE_STATUS.CONFIRMED,
        plus_one_attendance: guestData.plus_one ? CONSTANTS.ATTENDANCE_STATUS.CONFIRMED : CONSTANTS.ATTENDANCE_STATUS.PENDING,
        registration_ip: guestData.registration_ip,
        user_agent: guestData.user_agent
      }])
      .select()
      .single();

    if (error) {
      return handleSupabaseError(error, 'registrar invitado');
    }

    // Actualizar el uso de la invitación
    await updateInvitationUsage(invitationResult.data.invitation_id);

    return handleSupabaseSuccess(data, 'Invitado registrado exitosamente');
  } catch (error) {
    return handleSupabaseError(error, 'registrar invitado');
  }
};

// Función para validar código de invitación
export const validateInvitationCode = async (eventId, invitationCode) => {
  try {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('event_id', eventId)
      .eq('invitation_code', invitationCode)
      .single();

    if (error) {
      return handleSupabaseError('Código de invitación inválido', 'validar código de invitación');
    }

    // Verificar si la invitación ha expirado
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return handleSupabaseError('El código de invitación ha expirado', 'validar código de invitación');
    }

    // Verificar si se ha alcanzado el límite de usos
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return handleSupabaseError('El código de invitación ha alcanzado su límite de usos', 'validar código de invitación');
    }

    return handleSupabaseSuccess(data, 'Código de invitación válido');
  } catch (error) {
    return handleSupabaseError(error, 'validar código de invitación');
  }
};

// Función para verificar si un invitado ya existe
export const checkExistingGuest = async (eventId, email) => {
  return executeQuery(
    () => supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .eq('email', email)
      .single(),
    'verificar invitado existente'
  );
};

// Función para actualizar el uso de una invitación
const updateInvitationUsage = async (invitationId) => {
  try {
    const { error } = await supabase
      .from('invitations')
      .update({
        current_uses: supabase.raw('current_uses + 1'),
        last_used_at: new Date().toISOString()
      })
      .eq('invitation_id', invitationId);

    if (error) {
      console.warn('Error al actualizar uso de invitación:', error);
    }
  } catch (error) {
    console.warn('Error al actualizar uso de invitación:', error);
  }
};

// Función para obtener invitados de un evento
export const getEventGuests = async (eventId) => {
  return executeQuery(
    () => supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false }),
    `obtener invitados del evento ${eventId}`
  );
};

// Función para actualizar estado de asistencia de un invitado
export const updateGuestAttendance = async (guestId, attendanceStatus, plusOneStatus = null) => {
  const updates = {
    attendance_status: attendanceStatus,
    response_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString()
  };

  if (plusOneStatus !== null) {
    updates.plus_one_attendance = plusOneStatus;
  }

  return executeMutation(
    () => supabase
      .from('guests')
      .update(updates)
      .eq('guest_id', guestId)
      .select()
      .single(),
    `actualizar asistencia del invitado ${guestId}`
  );
};

// Función para actualizar información de un invitado
export const updateGuest = async (guestId, updates) => {
  return executeMutation(
    () => supabase
      .from('guests')
      .update({
        ...updates,
        last_updated_at: new Date().toISOString()
      })
      .eq('guest_id', guestId)
      .select()
      .single(),
    `actualizar invitado ${guestId}`
  );
};

// Función para eliminar un invitado
export const deleteGuest = async (guestId) => {
  return executeMutation(
    () => supabase
      .from('guests')
      .delete()
      .eq('guest_id', guestId),
    `eliminar invitado ${guestId}`
  );
};

// Función para obtener estadísticas de invitados de un evento
export const getEventGuestStats = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('attendance_status, plus_one, plus_one_attendance')
      .eq('event_id', eventId);

    if (error) {
      return handleSupabaseError(error, 'obtener estadísticas de invitados');
    }

    const stats = {
      total: data.length,
      confirmed: 0,
      declined: 0,
      pending: 0,
      noResponse: 0,
      plusOnes: 0,
      plusOnesConfirmed: 0,
      totalAttending: 0
    };

    data.forEach(guest => {
      // Contar por estado de asistencia
      switch (guest.attendance_status) {
        case CONSTANTS.ATTENDANCE_STATUS.CONFIRMED:
          stats.confirmed++;
          stats.totalAttending++;
          break;
        case CONSTANTS.ATTENDANCE_STATUS.DECLINED:
          stats.declined++;
          break;
        case CONSTANTS.ATTENDANCE_STATUS.PENDING:
          stats.pending++;
          break;
        case CONSTANTS.ATTENDANCE_STATUS.NO_RESPONSE:
          stats.noResponse++;
          break;
      }

      // Contar acompañantes
      if (guest.plus_one) {
        stats.plusOnes++;
        if (guest.plus_one_attendance === CONSTANTS.ATTENDANCE_STATUS.CONFIRMED) {
          stats.plusOnesConfirmed++;
          stats.totalAttending++;
        }
      }
    });

    return handleSupabaseSuccess(stats, 'Estadísticas de invitados obtenidas exitosamente');
  } catch (error) {
    return handleSupabaseError(error, 'obtener estadísticas de invitados');
  }
};

// Función para obtener información de un evento para registro público
export const getEventForRegistration = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        event_id,
        title,
        description,
        event_type,
        event_date,
        event_time,
        location_type,
        location_data,
        allow_plus_one,
        rsvp_deadline,
        dietary_notes
      `)
      .eq('event_id', eventId)
      .single();

    if (error) {
      return handleSupabaseError(error, 'obtener información del evento para registro');
    }

    return handleSupabaseSuccess(data, 'Información del evento obtenida exitosamente');
  } catch (error) {
    return handleSupabaseError(error, 'obtener información del evento para registro');
  }
};

// Función para validar datos de invitado
export const validateGuestData = (guestData) => {
  const errors = [];

  if (!guestData.name || guestData.name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!guestData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.email)) {
    errors.push('El email debe tener un formato válido');
  }

  if (!guestData.event_id) {
    errors.push('El ID del evento es requerido');
  }

  if (!guestData.invitation_code) {
    errors.push('El código de invitación es requerido');
  }

  if (guestData.plus_one && (!guestData.plus_one_name || guestData.plus_one_name.trim().length < 2)) {
    errors.push('El nombre del acompañante es requerido cuando se indica que traerá uno');
  }

  if (guestData.plus_one_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.plus_one_email)) {
    errors.push('El email del acompañante debe tener un formato válido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

