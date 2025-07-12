import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  PartyPopper,
  Heart,
  Gift,
  Sparkles,
  Music,
  Camera,
  Utensils,
  Flower,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useServices } from '../hooks/useServices'

const CreateEventV2 = ({ user }) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Paso 1: Información básica
    name: '',
    type: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    locationData: null,
    
    // Paso 2: Detalles del evento
    guestCount: '',
    targetAudience: '',
    isPrivate: true,
    isAdultsOnly: false,
    
    // Paso 4: Personalización final
    specialRequests: '',
    splitCosts: false,
    inviteEmails: ''
  })

  const {
    selectedServices,
    errors: serviceErrors,
    toggleService,
    calculateTotalCost,
    getSelectedServicesDetails,
    getServicesByCategory,
    validateServices,
    prepareServicesForDatabase,
    clearSelection,
    isServiceSelected
  } = useServices()

  const [showInvitation, setShowInvitation] = useState(false)
  const [eventCreated, setEventCreated] = useState(false)
  const [createdEventId, setCreatedEventId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState([])

  const eventTypes = [
    { value: 'cumpleanos', label: 'Cumpleaños', icon: <Heart className="h-4 w-4" /> },
    { value: 'boda', label: 'Boda', icon: <Sparkles className="h-4 w-4" /> },
    { value: 'corporativo', label: 'Evento Corporativo', icon: <Gift className="h-4 w-4" /> },
    { value: 'fiesta', label: 'Fiesta', icon: <PartyPopper className="h-4 w-4" /> },
    { value: 'graduacion', label: 'Graduación', icon: <Gift className="h-4 w-4" /> },
    { value: 'aniversario', label: 'Aniversario', icon: <Heart className="h-4 w-4" /> },
    { value: 'otro', label: 'Otro', icon: <Calendar className="h-4 w-4" /> }
  ]

  const categoryIcons = {
    'Catering y Comida': <Utensils className="h-5 w-5" />,
    'Decoración y Flores': <Flower className="h-5 w-5" />,
    'Música y Entretenimiento': <Music className="h-5 w-5" />,
    'Fotografía y Video': <Camera className="h-5 w-5" />
  }

  const addDebugInfo = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugInfo(prev => [...prev, { timestamp, message, data }])
    console.log(`[${timestamp}] ${message}`, data)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    })
    setError('')
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.type || !formData.date || !formData.startTime || !formData.location) {
          setError('Por favor completa todos los campos requeridos')
          return false
        }
        break
      case 2:
        if (!formData.guestCount || !formData.targetAudience) {
          setError('Por favor completa todos los campos requeridos')
          return false
        }
        break
      case 3:
        if (!validateServices()) {
          setError('Por favor selecciona al menos un servicio válido')
          return false
        }
        break
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      setError('')
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
    setError('')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setDebugInfo([])

    try {
      addDebugInfo('Iniciando creación de evento')
      
      // Validar servicios antes de proceder
      if (!validateServices()) {
        throw new Error('Servicios seleccionados no válidos')
      }

      const eventDataToInsert = {
        organizer_id: user.id,
        title: formData.name,
        description: formData.description,
        event_date: formData.date,
        event_time: formData.startTime,
        location_type: formData.locationData?.type === 'venue' ? 'rental' : 'own',
        address: formData.locationData?.type === 'address' ? formData.locationData.address : formData.location,
        venue_id: formData.locationData?.type === 'venue' ? formData.locationData.venue_id : null,
        attendees_count: parseInt(formData.guestCount),
        budget: calculateTotalCost(parseInt(formData.guestCount)),
        status: 'pending',
        event_type: formData.type,
        special_requests: formData.specialRequests,
        split_costs: formData.splitCosts,
        invite_emails: formData.inviteEmails.split(',').map(email => email.trim()).filter(email => email !== '')
      }

      addDebugInfo('Datos del evento preparados', eventDataToInsert)

      // Insertar evento principal
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([eventDataToInsert])
        .select()

      if (eventError) {
        addDebugInfo('Error al insertar evento', eventError)
        throw eventError
      }

      addDebugInfo('Evento creado exitosamente', event)
      const eventId = event[0].event_id

      // Preparar datos de servicios
      const eventServicesData = prepareServicesForDatabase(eventId)
      if (!eventServicesData) {
        throw new Error('Error al preparar datos de servicios')
      }

      addDebugInfo('Datos de servicios preparados', eventServicesData)

      // Insertar servicios del evento
      if (eventServicesData.length > 0) {
        const { error: eventServicesError } = await supabase
          .from('event_services')
          .insert(eventServicesData)

        if (eventServicesError) {
          addDebugInfo('Error al insertar servicios', eventServicesError)
          throw new Error(`Error al insertar servicios: ${eventServicesError.message}`)
        }

        addDebugInfo('Servicios insertados exitosamente')

        // Crear bookings para proveedores
        for (const serviceData of eventServicesData) {
          try {
            const { data: serviceDetails, error: serviceError } = await supabase
              .from('services')
              .select('provider_id')
              .eq('service_id', serviceData.service_id)
              .single()

            if (serviceError) {
              addDebugInfo(`Error al obtener detalles del servicio ${serviceData.service_id}`, serviceError)
              continue
            }

            if (serviceDetails?.provider_id) {
              const { error: bookingError } = await supabase
                .from('provider_bookings')
                .insert([{
                  provider_id: serviceDetails.provider_id,
                  event_id: eventId,
                  service_id: serviceData.service_id,
                  status: 'pending',
                  created_at: new Date().toISOString()
                }])

              if (bookingError) {
                addDebugInfo(`Error al crear booking para proveedor`, bookingError)
              } else {
                addDebugInfo(`Booking creado para servicio ${serviceData.service_id}`)
              }
            }
          } catch (bookingErr) {
            addDebugInfo(`Error procesando booking`, bookingErr)
          }
        }
      }

      // Generar invitaciones con QR
      if (formData.inviteEmails && formData.inviteEmails.trim() !== '') {
        const emails = formData.inviteEmails.split(',').map(email => email.trim()).filter(email => email !== '')
        
        for (const email of emails) {
          try {
            const invitationCode = `${eventId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            
            const { error: invitationError } = await supabase
              .from('event_invitations')
              .insert([{
                event_id: eventId,
                guest_email: email,
                invitation_code: invitationCode,
                qr_code_url: `https://ktrin-web.vercel.app/invitation/${invitationCode}`,
                status: 'sent',
                created_at: new Date().toISOString()
              }])
              
            if (invitationError) {
              addDebugInfo(`Error creando invitación para ${email}`, invitationError)
            } else {
              addDebugInfo(`Invitación creada para ${email}`)
            }
          } catch (invitationErr) {
            addDebugInfo(`Error procesando invitación para ${email}`, invitationErr)
          }
        }
      }
      
      setCreatedEventId(eventId)
      setEventCreated(true)
      setShowInvitation(true)
      addDebugInfo('Proceso completado exitosamente')

    } catch (err) {
      addDebugInfo('Error general', err)
      console.error('Error al crear el evento:', err)
      setError(err.message || 'Error al crear el evento. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Información Básica del Evento</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del Evento *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: Cumpleaños de María"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Tipo de Evento *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {eventTypes.map((type) => (
                <Card 
                  key={type.value}
                  className={`cursor-pointer transition-all ${formData.type === type.value ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:shadow-md'}`}
                  onClick={() => handleSelectChange('type', type.value)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="flex flex-col items-center space-y-1">
                      {type.icon}
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe tu evento..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Fecha del Evento *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime">Hora de Inicio *</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">Hora de Fin</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label>Ubicación del Evento *</Label>
            <LocationSelectorV2 
              onLocationSelect={(locationData) => {
                setFormData(prev => ({
                  ...prev,
                  locationData: locationData,
                  location: locationData.address || locationData.name || 'Ubicación seleccionada'
                }))
              }}
            />
            {formData.location && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">{formData.location}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Detalles del Evento</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guestCount">Cantidad de Invitados *</Label>
              <Input
                id="guestCount"
                name="guestCount"
                type="number"
                placeholder="Número de invitados"
                value={formData.guestCount}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Público Objetivo *</Label>
              <Select onValueChange={(value) => handleSelectChange('targetAudience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el público" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninos">Niños</SelectItem>
                  <SelectItem value="adultos">Adultos</SelectItem>
                  <SelectItem value="mixto">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isPrivate"
                checked={formData.isPrivate}
                onCheckedChange={(checked) => handleSelectChange('isPrivate', checked)}
              />
              <Label htmlFor="isPrivate">Evento Privado</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isAdultsOnly"
                checked={formData.isAdultsOnly}
                onCheckedChange={(checked) => handleSelectChange('isAdultsOnly', checked)}
              />
              <Label htmlFor="isAdultsOnly">Solo para Mayores de Edad</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => {
    const servicesByCategory = getServicesByCategory()
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Servicios</h3>
          
          {serviceErrors.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {serviceErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-6">
            {Object.entries(servicesByCategory).map(([category, services]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {categoryIcons[category]}
                    <span>{category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {services.map((service) => (
                      <div 
                        key={service.service_id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          isServiceSelected(service.service_id)
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleService(service.service_id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="text-sm text-gray-600">${service.price} {service.unit}</p>
                            <p className="text-xs text-gray-500">ID: {service.service_id}</p>
                          </div>
                          <Checkbox 
                            checked={isServiceSelected(service.service_id)}
                            readOnly
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedServices.length > 0 && (
            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Costo Estimado Total:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ${calculateTotalCost(parseInt(formData.guestCount) || 0).toLocaleString()}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Servicios seleccionados:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getSelectedServicesDetails().map(service => (
                      <Badge key={service.service_id} variant="secondary" className="text-xs">
                        {service.name} (ID: {service.service_id})
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Personalización y Confirmación</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="specialRequests">Solicitudes Especiales</Label>
            <Textarea
              id="specialRequests"
              name="specialRequests"
              placeholder="Describe cualquier requerimiento especial para tu evento..."
              value={formData.specialRequests}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="splitCosts"
              checked={formData.splitCosts}
              onCheckedChange={(checked) => handleSelectChange('splitCosts', checked)}
            />
            <Label htmlFor="splitCosts">Dividir costos con amigos</Label>
          </div>

          {formData.splitCosts && (
            <div>
              <Label htmlFor="inviteEmails">Emails de Invitados para División de Costos</Label>
              <Textarea
                id="inviteEmails"
                name="inviteEmails"
                placeholder="Ingresa los emails separados por comas..."
                value={formData.inviteEmails}
                onChange={handleChange}
                rows={2}
              />
            </div>
          )}

          {/* Resumen del evento */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Evento:</span> {formData.name}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span> {eventTypes.find(t => t.value === formData.type)?.label}
                </div>
                <div>
                  <span className="font-medium">Fecha:</span> {formData.date}
                </div>
                <div>
                  <span className="font-medium">Hora:</span> {formData.startTime}
                </div>
                <div>
                  <span className="font-medium">Ubicación:</span> {formData.location}
                </div>
                <div>
                  <span className="font-medium">Invitados:</span> {formData.guestCount}
                </div>
              </div>
              
              <div>
                <span className="font-medium">Servicios Seleccionados:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getSelectedServicesDetails().map(service => (
                    <Badge key={service.service_id} variant="secondary">
                      {service.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Costo Total Estimado:</span>
                  <span className="text-xl font-bold text-indigo-600">
                    ${calculateTotalCost(parseInt(formData.guestCount) || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debug Information */}
          {debugInfo.length > 0 && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm">Información de Debug</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-y-auto text-xs space-y-1">
                  {debugInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-gray-500">[{info.timestamp}]</span>
                      <span>{info.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard/client" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              Paso {currentStep} de 4 (Versión Mejorada)
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progreso</span>
            <span className="text-sm text-gray-500">{currentStep}/4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Crear Nuevo Evento (Versión Mejorada)</CardTitle>
            <CardDescription>
              Completa la información para crear tu evento perfecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Siguiente
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creando Evento...' : 'Crear Evento'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mostrar invitaciones con QR cuando el evento se haya creado */}
      {showInvitation && createdEventId && (
        <EventInvitationDisplayV2 
          eventId={createdEventId}
          onClose={() => {
            setShowInvitation(false)
            navigate('/dashboard/client-v2')
          }}
        />
      )}
    </div>
  )
}

export default CreateEventV2

