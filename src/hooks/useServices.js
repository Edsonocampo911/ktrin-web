import { useState, useCallback } from 'react'

// Definición centralizada de servicios con IDs numéricos únicos
export const SERVICE_CATALOG = [
  // Catering y Comida
  { service_id: 1, name: 'Catering Premium', category: 'Catering y Comida', price: 45, unit: 'por persona' },
  { service_id: 2, name: 'Catering Básico', category: 'Catering y Comida', price: 25, unit: 'por persona' },
  { service_id: 3, name: 'Bar Abierto', category: 'Catering y Comida', price: 20, unit: 'por persona' },
  { service_id: 4, name: 'Pastelería Especializada', category: 'Catering y Comida', price: 150, unit: 'por evento' },
  
  // Decoración y Flores
  { service_id: 5, name: 'Decoración Temática', category: 'Decoración y Flores', price: 800, unit: 'por evento' },
  { service_id: 6, name: 'Arreglos Florales', category: 'Decoración y Flores', price: 300, unit: 'por evento' },
  { service_id: 7, name: 'Iluminación Especial', category: 'Decoración y Flores', price: 500, unit: 'por evento' },
  
  // Música y Entretenimiento
  { service_id: 8, name: 'DJ Profesional', category: 'Música y Entretenimiento', price: 600, unit: 'por evento' },
  { service_id: 9, name: 'Banda en Vivo', category: 'Música y Entretenimiento', price: 1200, unit: 'por evento' },
  { service_id: 10, name: 'Animación para Niños', category: 'Música y Entretenimiento', price: 400, unit: 'por evento' },
  
  // Fotografía y Video
  { service_id: 11, name: 'Fotografía Profesional', category: 'Fotografía y Video', price: 1200, unit: 'por evento' },
  { service_id: 12, name: 'Video Profesional', category: 'Fotografía y Video', price: 1800, unit: 'por evento' },
  { service_id: 13, name: 'Cabina de Fotos', category: 'Fotografía y Video', price: 400, unit: 'por evento' }
]

export const useServices = () => {
  const [selectedServices, setSelectedServices] = useState([])
  const [errors, setErrors] = useState([])

  // Función para alternar selección de servicio
  const toggleService = useCallback((serviceId) => {
    // Validar que serviceId sea un número
    const numericServiceId = parseInt(serviceId)
    if (isNaN(numericServiceId)) {
      setErrors(prev => [...prev, `ID de servicio inválido: ${serviceId}`])
      return
    }

    // Verificar que el servicio existe en el catálogo
    const serviceExists = SERVICE_CATALOG.find(s => s.service_id === numericServiceId)
    if (!serviceExists) {
      setErrors(prev => [...prev, `Servicio no encontrado: ${numericServiceId}`])
      return
    }

    setSelectedServices(prev => {
      const isSelected = prev.includes(numericServiceId)
      if (isSelected) {
        return prev.filter(id => id !== numericServiceId)
      } else {
        return [...prev, numericServiceId]
      }
    })

    // Limpiar errores al seleccionar correctamente
    setErrors([])
  }, [])

  // Función para calcular costo total
  const calculateTotalCost = useCallback((guestCount = 0) => {
    return selectedServices.reduce((total, serviceId) => {
      const service = SERVICE_CATALOG.find(s => s.service_id === serviceId)
      if (!service) return total

      if (service.unit === 'por persona') {
        return total + (service.price * guestCount)
      } else {
        return total + service.price
      }
    }, 0)
  }, [selectedServices])

  // Función para obtener servicios seleccionados con detalles
  const getSelectedServicesDetails = useCallback(() => {
    return selectedServices.map(serviceId => {
      return SERVICE_CATALOG.find(s => s.service_id === serviceId)
    }).filter(Boolean)
  }, [selectedServices])

  // Función para agrupar servicios por categoría
  const getServicesByCategory = useCallback(() => {
    const categories = {}
    SERVICE_CATALOG.forEach(service => {
      if (!categories[service.category]) {
        categories[service.category] = []
      }
      categories[service.category].push(service)
    })
    return categories
  }, [])

  // Función para validar servicios antes del envío
  const validateServices = useCallback(() => {
    const validationErrors = []
    
    if (selectedServices.length === 0) {
      validationErrors.push('Debe seleccionar al menos un servicio')
    }

    selectedServices.forEach(serviceId => {
      if (typeof serviceId !== 'number') {
        validationErrors.push(`ID de servicio debe ser numérico: ${serviceId}`)
      }
      
      const service = SERVICE_CATALOG.find(s => s.service_id === serviceId)
      if (!service) {
        validationErrors.push(`Servicio no válido: ${serviceId}`)
      }
    })

    setErrors(validationErrors)
    return validationErrors.length === 0
  }, [selectedServices])

  // Función para preparar datos para envío a la base de datos
  const prepareServicesForDatabase = useCallback((eventId) => {
    if (!validateServices()) {
      return null
    }

    return selectedServices.map(serviceId => ({
      event_id: parseInt(eventId),
      service_id: parseInt(serviceId)
    }))
  }, [selectedServices, validateServices])

  // Función para limpiar selección
  const clearSelection = useCallback(() => {
    setSelectedServices([])
    setErrors([])
  }, [])

  return {
    selectedServices,
    errors,
    toggleService,
    calculateTotalCost,
    getSelectedServicesDetails,
    getServicesByCategory,
    validateServices,
    prepareServicesForDatabase,
    clearSelection,
    isServiceSelected: (serviceId) => selectedServices.includes(parseInt(serviceId))
  }
}

