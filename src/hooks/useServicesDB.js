import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook personalizado para manejar servicios desde la base de datos
 * Este hook obtiene los servicios directamente de Supabase y maneja el estado
 */
export const useServicesDB = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Función para obtener servicios de la base de datos
  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .order('service_id', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      console.log('Servicios obtenidos de la base de datos:', data)
      setServices(data || [])
    } catch (err) {
      console.error('Error al obtener servicios:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Cargar servicios al montar el componente
  useEffect(() => {
    fetchServices()
  }, [])

  // Función para obtener un servicio por ID
  const getServiceById = (serviceId) => {
    return services.find(service => service.service_id === serviceId)
  }

  // Función para obtener servicios por categoría
  const getServicesByCategory = (category) => {
    return services.filter(service => service.category === category)
  }

  // Función para calcular el costo total de servicios seleccionados
  const calculateTotalCost = (selectedServiceIds) => {
    if (!Array.isArray(selectedServiceIds) || selectedServiceIds.length === 0) {
      return 0
    }

    return selectedServiceIds.reduce((total, serviceId) => {
      const service = getServiceById(serviceId)
      return total + (service ? parseFloat(service.price) : 0)
    }, 0)
  }

  // Función para validar que los IDs de servicios existen
  const validateServiceIds = (serviceIds) => {
    if (!Array.isArray(serviceIds)) {
      return { valid: false, error: 'Los IDs de servicios deben ser un array' }
    }

    const invalidIds = serviceIds.filter(id => !getServiceById(id))
    
    if (invalidIds.length > 0) {
      return { 
        valid: false, 
        error: `Los siguientes IDs de servicios no existen: ${invalidIds.join(', ')}` 
      }
    }

    return { valid: true, error: null }
  }

  // Función para obtener todas las categorías únicas
  const getCategories = () => {
    const categories = [...new Set(services.map(service => service.category))]
    return categories.filter(category => category) // Filtrar valores nulos/undefined
  }

  return {
    services,
    loading,
    error,
    fetchServices,
    getServiceById,
    getServicesByCategory,
    calculateTotalCost,
    validateServiceIds,
    getCategories
  }
}

export default useServicesDB

