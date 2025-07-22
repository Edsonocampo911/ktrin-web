import { useState, useEffect, useCallback } from 'react';
import {
  getActiveServices as getActiveServicesService,
  getServicesByCategory as getServicesByCategoryService,
  searchServices as searchServicesService,
  getServiceById as getServiceByIdService,
  getServiceCategories as getServiceCategoriesService,
  getServiceStats as getServiceStatsService,
  calculateTotalCost as calculateTotalCostService
} from '../services/services.js';

export const useServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [currentService, setCurrentService] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para limpiar errores
  const clearError = () => setError(null);

  // Función para manejar errores
  const handleError = (error) => {
    const errorMessage = error.message || 'Ha ocurrido un error';
    setError(errorMessage);
    console.error('Services Error:', error);
  };

  // Función para cargar todos los servicios activos
  const loadActiveServices = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const result = await getActiveServicesService();

      if (result.error) {
        handleError(result);
        return result;
      }

      setServices(result.data || []);
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cargar servicios por categoría
  const loadServicesByCategory = useCallback(async (category) => {
    try {
      setLoading(true);
      clearError();

      const result = await getServicesByCategoryService(category);

      if (result.error) {
        handleError(result);
        return result;
      }

      setServices(result.data || []);
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para buscar servicios
  const searchServices = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      clearError();

      const result = await searchServicesService(searchTerm);

      if (result.error) {
        handleError(result);
        return result;
      }

      setServices(result.data || []);
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener un servicio específico
  const getServiceById = useCallback(async (serviceId) => {
    try {
      setLoading(true);
      clearError();

      const result = await getServiceByIdService(serviceId);

      if (result.error) {
        handleError(result);
        return result;
      }

      setCurrentService(result.data);
      return result;
    } catch (error) {
      handleError(error);
      return { error: true, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cargar categorías de servicios
  const loadServiceCategories = useCallback(async () => {
    try {
      const result = await getServiceCategoriesService();

      if (result.error) {
        console.warn('Error al cargar categorías:', result.message);
        return result;
      }

      // Extraer categorías únicas
      const uniqueCategories = [...new Set(result.data.map(item => item.category))];
      setCategories(uniqueCategories);
      return result;
    } catch (error) {
      console.warn('Error al cargar categorías:', error);
      return { error: true, message: error.message };
    }
  }, []);

  // Función para cargar estadísticas de servicios
  const loadServiceStats = useCallback(async (providerId = null) => {
    try {
      const result = await getServiceStatsService(providerId);

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
  }, []);

  // Función para agregar un servicio a la selección
  const addServiceToSelection = useCallback((service, quantity = 1, customPrice = null) => {
    setSelectedServices(prev => {
      // Verificar si el servicio ya está seleccionado
      const existingIndex = prev.findIndex(s => s.service_id === service.service_id);
      
      if (existingIndex >= 0) {
        // Actualizar servicio existente
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: quantity,
          custom_price: customPrice
        };
        return updated;
      } else {
        // Agregar nuevo servicio
        return [...prev, {
          ...service,
          quantity,
          custom_price: customPrice
        }];
      }
    });
  }, []);

  // Función para remover un servicio de la selección
  const removeServiceFromSelection = useCallback((serviceId) => {
    setSelectedServices(prev => prev.filter(s => s.service_id !== serviceId));
  }, []);

  // Función para actualizar cantidad de un servicio seleccionado
  const updateServiceQuantity = useCallback((serviceId, quantity) => {
    setSelectedServices(prev => prev.map(service => 
      service.service_id === serviceId 
        ? { ...service, quantity: Math.max(1, quantity) }
        : service
    ));
  }, []);

  // Función para actualizar precio personalizado de un servicio
  const updateServiceCustomPrice = useCallback((serviceId, customPrice) => {
    setSelectedServices(prev => prev.map(service => 
      service.service_id === serviceId 
        ? { ...service, custom_price: customPrice }
        : service
    ));
  }, []);

  // Función para limpiar la selección de servicios
  const clearServiceSelection = useCallback(() => {
    setSelectedServices([]);
  }, []);

  // Función para calcular el costo total de servicios seleccionados
  const calculateTotalCost = useCallback(() => {
    return calculateTotalCostService(selectedServices);
  }, [selectedServices]);

  // Función para obtener servicios por IDs
  const getServicesByIds = useCallback(async (serviceIds) => {
    try {
      const promises = serviceIds.map(id => getServiceByIdService(id));
      const results = await Promise.all(promises);
      
      const services = results
        .filter(result => !result.error)
        .map(result => result.data);
      
      return { error: false, data: services };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadActiveServices();
    loadServiceCategories();
    loadServiceStats();
  }, [loadActiveServices, loadServiceCategories, loadServiceStats]);

  // Funciones de utilidad
  const getServicesByCategory = useCallback((category) => {
    return services.filter(service => service.category === category);
  }, [services]);

  const isServiceSelected = useCallback((serviceId) => {
    return selectedServices.some(s => s.service_id === serviceId);
  }, [selectedServices]);

  const getSelectedServiceById = useCallback((serviceId) => {
    return selectedServices.find(s => s.service_id === serviceId);
  }, [selectedServices]);

  return {
    // Estado
    services,
    categories,
    selectedServices,
    currentService,
    stats,
    loading,
    error,

    // Funciones de carga
    loadActiveServices,
    loadServicesByCategory,
    searchServices,
    getServiceById,
    loadServiceCategories,
    loadServiceStats,
    getServicesByIds,

    // Funciones de selección
    addServiceToSelection,
    removeServiceFromSelection,
    updateServiceQuantity,
    updateServiceCustomPrice,
    clearServiceSelection,

    // Funciones de utilidad
    getServicesByCategory,
    isServiceSelected,
    getSelectedServiceById,
    calculateTotalCost,
    clearError,

    // Estado derivado
    hasServices: services.length > 0,
    servicesCount: services.length,
    selectedServicesCount: selectedServices.length,
    hasSelectedServices: selectedServices.length > 0,
    totalCost: calculateTotalCost()
  };
};

export default useServices;

