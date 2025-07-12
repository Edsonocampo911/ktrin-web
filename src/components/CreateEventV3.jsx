import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import useServicesDB from '../hooks/useServicesDB'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import EventInvitationDisplayV2 from './EventInvitationDisplayV2'
import LocationSelectorV2 from './LocationSelectorV2'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

const CreateEventV3 = ({ user }) => {
  const navigate = useNavigate()
  const { services, loading: servicesLoading, error: servicesError, calculateTotalCost, validateServiceIds } = useServicesDB()

  // Estados del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    invitedGuests: '',
    selectedServices: [],
    specialRequests: ''
  })

  // Estados de UI
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showInvitation, setShowInvitation] = useState(false)
  const [createdEventId, setCreatedEventId] = useState(null)

  // Debug logs
  const [debugLogs, setDebugLogs] = useState([])

  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    console.log(logEntry, data)
    setDebugLogs(prev => [...prev, { message: logEntry, data }])
  }

  useEffect(() => {
    addDebugLog('Componente CreateEventV3 montado')
    if (user) {
      addDebugLog('Usuario autenticado:', { id: user.id, email: user.email })
    }
  }, [user])

  useEffect(() => {
    if (services.length > 0) {
      addDebugLog('Servicios cargados desde la base de datos:', services)
    }
  }, [services])

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    addDebugLog(`Campo actualizado: ${field}`, value)
  }

  // Manejar selección de servicios
  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const isSelected = prev.selectedServices.includes(serviceId)
      const newSelectedServices = isSelected
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
      
      addDebugLog(`Servicio ${isSelected ? 'deseleccionado' : 'seleccionado'}:`, { serviceId, newSelectedServices })
      
      return {
        ...prev,
        selectedServices: newSelectedServices
      }
    })
  }

  // Manejar ubicación desde LocationSelector
  const handleLocationChange = (location) => {
    handleInputChange('location', location)
  }

  // Validar formulario
  const validateForm = () => {
    const errors = []

    if (!formData.title.trim()) errors.push('El título del evento es requerido')
    if (!formData.eventDate) errors.push('La fecha del evento es requerida')
    if (!formData.eventTime) errors.push('La hora del evento es requerida')
    if (!formData.location.trim()) errors.push('La ubicación del evento es requerida')
    if (!formData.invitedGuests || formData.invitedGuests < 1) errors.push('El número de invitados debe ser mayor a 0')
    if (formData.selectedServices.length === 0) errors.push('Debe seleccionar al menos un servicio')

    // Validar que los servicios seleccionados existen
    const serviceValidation = validateServiceIds(formData.selectedServices)
    if (!serviceValidation.valid) {
      errors.push(serviceValidation.error)
    }

    return errors
  }

  // Crear evento
  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      addDebugLog('Iniciando creación de evento...')

      // Validar formulario
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '))
      }

      addDebugLog('Validación del formulario exitosa')

      // Calcular costo estimado
      const estimatedCost = calculateTotalCost(formData.selectedServices)
      addDebugLog('Costo estimado calculado:', estimatedCost)

      // Crear evento en la base de datos
      const eventData = {
        organizer_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        event_date: formData.eventDate,
        event_time: formData.eventTime,
        location: formData.location.trim(),
        invited_guests: parseInt(formData.invitedGuests),
        estimated_cost: estimatedCost
      }

      addDebugLog('Datos del evento a insertar:', eventData)

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([eventData])
        .select()

      if (eventError) {
        addDebugLog('Error al insertar evento:', eventError)
        throw eventError
      }

      if (!event || event.length === 0) {
        throw new Error('No se pudo crear el evento')
      }

      const createdEvent = event[0]
      addDebugLog('Evento creado exitosamente:', createdEvent)

      // Insertar servicios del evento
      const eventServicesData = formData.selectedServices.map(serviceId => ({
        event_id: createdEvent.event_id,
        service_id: serviceId
      }))

      addDebugLog('Datos de servicios del evento a insertar:', eventServicesData)

      const { error: servicesError } = await supabase
        .from('event_services')
        .insert(eventServicesData)

      if (servicesError) {
        addDebugLog('Error al insertar servicios del evento:', servicesError)
        throw servicesError
      }

      addDebugLog('Servicios del evento insertados exitosamente')

      // Éxito
      setSuccess('¡Evento creado exitosamente!')
      setCreatedEventId(createdEvent.event_id)
      setShowInvitation(true)
      addDebugLog('Proceso de creación completado exitosamente')

    } catch (err) {
      console.error('Error al crear evento:', err)
      addDebugLog('Error en la creación del evento:', err)
      setError(err.message || 'Error al crear el evento')
    } finally {
      setLoading(false)
    }
  }

  // Calcular costo total
  const totalCost = calculateTotalCost(formData.selectedServices)

  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando servicios...</p>
        </div>
      </div>
    )
  }

  if (servicesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar servicios: {servicesError}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/client')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Evento</h1>
          <p className="text-gray-600 mt-2">Completa la información para crear tu evento perfecto</p>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Formulario */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título del Evento *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ej: Mi cumpleaños número 30"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe tu evento..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Fecha *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange('eventDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventTime">Hora *</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => handleInputChange('eventTime', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="invitedGuests">Número de Invitados *</Label>
                  <Input
                    id="invitedGuests"
                    type="number"
                    min="1"
                    value={formData.invitedGuests}
                    onChange={(e) => handleInputChange('invitedGuests', e.target.value)}
                    placeholder="Ej: 50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ubicación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocationSelectorV2
                  onLocationChange={handleLocationChange}
                  initialLocation={formData.location}
                />
              </CardContent>
            </Card>

            {/* Servicios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Servicios Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.service_id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.selectedServices.includes(service.service_id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleServiceToggle(service.service_id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={formData.selectedServices.includes(service.service_id)}
                              onChange={() => handleServiceToggle(service.service_id)}
                            />
                            <h3 className="font-medium">{service.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary">{service.category}</Badge>
                            <span className="font-semibold text-green-600">
                              ${service.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Solicitudes especiales */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Especiales</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Describe cualquier requerimiento especial para tu evento..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Resumen */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Resumen del Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Evento:</p>
                  <p className="font-medium">{formData.title || 'Sin título'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Fecha:</p>
                  <p className="font-medium">{formData.eventDate || 'No seleccionada'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Hora:</p>
                  <p className="font-medium">{formData.eventTime || 'No seleccionada'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Ubicación:</p>
                  <p className="font-medium">{formData.location || 'No seleccionada'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Invitados:</p>
                  <p className="font-medium">{formData.invitedGuests || 0}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Servicios Seleccionados:</p>
                  {formData.selectedServices.length > 0 ? (
                    <div className="space-y-1">
                      {formData.selectedServices.map(serviceId => {
                        const service = services.find(s => s.service_id === serviceId)
                        return service ? (
                          <div key={serviceId} className="flex justify-between text-sm">
                            <span>{service.name}</span>
                            <span>${service.price}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">Ningún servicio seleccionado</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Costo Total Estimado:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando Evento...
                    </>
                  ) : (
                    'Crear Evento'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Debug panel (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && debugLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Debug Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
                    {debugLogs.slice(-10).map((log, index) => (
                      <div key={index} className="text-gray-600">
                        {log.message}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Modal de invitaciones */}
        {showInvitation && createdEventId && (
          <EventInvitationDisplayV2
            eventId={createdEventId}
            onClose={() => {
              setShowInvitation(false)
              navigate('/dashboard/client')
            }}
          />
        )}
      </div>
    </div>
  )
}

export default CreateEventV3

