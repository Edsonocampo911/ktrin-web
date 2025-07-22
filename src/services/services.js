import { supabase, handleSupabaseError, handleSupabaseSuccess, executeQuery, executeMutation } from './api.js';

// Función para obtener todos los servicios activos
export const getActiveServices = async () => {
  return executeQuery(
    () => supabase
      .from('services_with_provider')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true }),
    'obtener servicios activos'
  );
};

// Función para obtener servicios por categoría
export const getServicesByCategory = async (category) => {
  return executeQuery(
    () => supabase
      .from('services_with_provider')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('name', { ascending: true }),
    `obtener servicios de categoría ${category}`
  );
};

// Función para buscar servicios por texto
export const searchServices = async (searchTerm) => {
  return executeQuery(
    () => supabase
      .from('services_with_provider')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
      .order('name', { ascending: true }),
    `buscar servicios con término "${searchTerm}"`
  );
};

// Función para obtener un servicio específico por ID
export const getServiceById = async (serviceId) => {
  return executeQuery(
    () => supabase
      .from('services_with_provider')
      .select('*')
      .eq('service_id', serviceId)
      .single(),
    `obtener servicio con ID ${serviceId}`
  );
};

// Función para obtener servicios de un proveedor específico
export const getServicesByProvider = async (providerId) => {
  return executeQuery(
    () => supabase
      .from('services')
      .select('*')
      .eq('provider_id', providerId)
      .order('name', { ascending: true }),
    `obtener servicios del proveedor ${providerId}`
  );
};

// Función para crear un nuevo servicio (solo para proveedores)
export const createService = async (serviceData) => {
  return executeMutation(
    () => supabase
      .from('services')
      .insert([serviceData])
      .select()
      .single(),
    'crear nuevo servicio'
  );
};

// Función para actualizar un servicio existente
export const updateService = async (serviceId, updates) => {
  return executeMutation(
    () => supabase
      .from('services')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('service_id', serviceId)
      .select()
      .single(),
    `actualizar servicio ${serviceId}`
  );
};

// Función para desactivar un servicio (soft delete)
export const deactivateService = async (serviceId) => {
  return executeMutation(
    () => supabase
      .from('services')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('service_id', serviceId)
      .select()
      .single(),
    `desactivar servicio ${serviceId}`
  );
};

// Función para obtener categorías únicas de servicios
export const getServiceCategories = async () => {
  return executeQuery(
    () => supabase
      .from('services')
      .select('category')
      .eq('is_active', true)
      .order('category'),
    'obtener categorías de servicios'
  );
};

// Función para obtener estadísticas de servicios
export const getServiceStats = async (providerId = null) => {
  try {
    let query = supabase
      .from('services')
      .select('service_id, category, is_active');

    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    const { data, error } = await query;

    if (error) {
      return handleSupabaseError(error, 'obtener estadísticas de servicios');
    }

    const stats = {
      total: data.length,
      active: data.filter(s => s.is_active).length,
      inactive: data.filter(s => !s.is_active).length,
      byCategory: {}
    };

    // Agrupar por categoría
    data.forEach(service => {
      if (!stats.byCategory[service.category]) {
        stats.byCategory[service.category] = 0;
      }
      if (service.is_active) {
        stats.byCategory[service.category]++;
      }
    });

    return handleSupabaseSuccess(stats, 'Estadísticas de servicios obtenidas correctamente');
  } catch (error) {
    return handleSupabaseError(error, 'obtener estadísticas de servicios');
  }
};

// Función para calcular el costo total de servicios seleccionados
export const calculateTotalCost = (selectedServices) => {
  if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
    return 0;
  }

  return selectedServices.reduce((total, service) => {
    const price = service.custom_price || service.negotiated_price || service.base_price || 0;
    const quantity = service.quantity || 1;
    return total + (price * quantity);
  }, 0);
};

// Función para validar datos de servicio
export const validateServiceData = (serviceData) => {
  const errors = [];

  if (!serviceData.name || serviceData.name.trim().length < 3) {
    errors.push('El nombre del servicio debe tener al menos 3 caracteres');
  }

  if (!serviceData.category || serviceData.category.trim().length === 0) {
    errors.push('La categoría es requerida');
  }

  if (!serviceData.base_price || serviceData.base_price < 0) {
    errors.push('El precio base debe ser mayor o igual a 0');
  }

  if (serviceData.min_quantity && serviceData.min_quantity < 1) {
    errors.push('La cantidad mínima debe ser mayor a 0');
  }

  if (serviceData.max_quantity && serviceData.min_quantity && 
      serviceData.max_quantity < serviceData.min_quantity) {
    errors.push('La cantidad máxima debe ser mayor o igual a la cantidad mínima');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

