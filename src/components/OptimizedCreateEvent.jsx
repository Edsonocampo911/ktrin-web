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
import ServiceSelector from './ServiceSelector'
import LocationSelector from './LocationSelector'
import EventInvitationDisplay from './EventInvitationDisplay'
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
  CheckCircle
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const OptimizedCreateEvent = ({ user }) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Paso 1: Selección de servicios
    selectedServices: [],
    requiresGuests: false,
    serviceCategories: [],
    
    // Paso 2: Tipo de evento
    type: '',
    
    // Paso 3: Información básica (cantidad de invitados solo si es necesario)
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    guestCount: '',
    targetAudience: '',
    
    // Paso 4: Ubicación
    location: '',
    locationData: null,
    
    // Paso 5: Personalización final
    isPrivate: true,
    isAdultsOnly: false,
    specialRequests: '',
    splitCosts: false,
    inviteEmails: ''
  })
  
  const [showInvitation, setShowInvitation] = useState(false)
  const [eventCreated, setEventCreated] = useState(false)
  const [createdEventId, setCreatedEventId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const eventTypes = [
    { value: 'cumpleanos', label: 'Cumpleaños', icon: <Heart className="h-6 w-6" />, description: 'Celebra un año más de vida' },
    { value: 'boda', label: 'Boda', icon: <Sparkles className="h-6 w-6" />, description: 'El día más especial para una pareja' },
    { value: 'corporativo', label: 'Evento Corporativo', icon: <Gift className="h-6 w-6" />, description: 'Reuniones de trabajo y celebraciones empresariales' },
    { value: 'fiesta', label: 'Fiesta', icon: <PartyPopper className="h-6 w-6" />, description: 'Celebración general y diversión' },
    { value: 'graduacion', label: 'Graduación', icon: <Gift className="h-6 w-6" />, description: 'Celebra un logro académico' },
    { value: 'aniversario', label: 'Aniversario', icon: <Heart className="h-6 w-6" />, description: 'Conmemora una fecha especial' },
    { value: 'otro', label: 'Otro', icon: <Calendar className="h-6 w-6" />, description: 'Evento personalizado' }
  ]

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

  const calculateEstimatedCost = () => {
    let total = 0
    const guestCount = parseInt(formData.guestCount) || 1
    
    formData.selectedServices.forEach(service => {
      if (service.unit === 'por persona') {
        total += service.price * guestCount
      } else {
        total += service.price
      }
    })
    
    return total
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (formData.selectedServices.length === 0) {
          setError('Por favor selecciona al menos un servicio')
          return false
        }
        break
      case 2:
        if (!formData.type) {
          setError('Por favor selecciona el tipo de evento')
          return false
        }
        break
      case 3:
        if (!formData.name || !formData.date || !formData.startTime) {
          setError('Por favor completa todos los campos requeridos')
          return false
        }
        if (formData.requiresGuests && !formData.guestCount) {
          setError('Por favor indica la cantidad de invitados')
          return false
        }
        break
      case 4:
        if (!formData.location) {
          setError('Por favor selecciona la ubicación del evento')
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

  const handleServiceSelection = (serviceData) => {
    setFormData({
      ...formData,
      selectedServices: serviceData.services,
      requiresGuests: serviceData.requiresGuests,
      serviceCategories: serviceData.categories
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const eventDataToInsert = {
        organizer_id: user.id,
        title: formData.name,
        description: formData.description,
        event_date: formData.date,
        event_time: formData.startTime,
        location_type: formData.locationData?.type === 'venue' ? 'rental' : 'own',
        address: formData.locationData?.type === 'address' ? formData.locationData.address : null,
        venue_id: formData.locationData?.type === 'venue' ? formData.locationData.venue_id : null,
        attendees_count: formData.requiresGuests ? parseInt(formData.guestCount) : null,
        budget: calculateEstimatedCost(),
        status: 'pending',
        event_type: formData.type,
        special_requests: formData.specialRequests,
        split_costs: formData.splitCosts,
        invite_emails: formData.inviteEmails.split(',').map(email => email.trim()).filter(email => email !== '')
      }

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([eventDataToInsert])
        .select()

      if (eventError) {
        throw eventError
      }

      // Handle selected services
      const eventServicesData = formData.selectedServices.map(service => ({
        event_id: event[0].event_id,
        service_id: service.service_id
      }))

      if (eventServicesData.length > 0) {
        const { error: eventServicesError } = await supabase
          .from('event_services')
          .insert(eventServicesData)
        
        if (eventServicesError) {
          console.error('Error inserting event services:', eventServicesError)
        } else {
          // Create provider bookings for each service
          for (const serviceData of eventServicesData) {
            try {
              const { data: serviceDetails, error: serviceError } = await supabase
                .from('services')
                .select('provider_id')
                .eq('service_id', serviceData.service_id)
                .single()

              if (serviceError) {
                console.error('Error fetching service details:', serviceError)
                continue
              }

              if (serviceDetails?.provider_id) {
                const { error: bookingError } = await supabase
                  .from('provider_bookings')
                  .insert([{
                    provider_id: serviceDetails.provider_id,
                    event_id: event[0].event_id,
                    service_id: serviceData.service_id,
                    status: 'pending',
                    created_at: new Date().toISOString()
                  }])

                if (bookingError) {
                  console.error('Error creating provider booking:', bookingError)
                }
              }
            } catch (bookingErr) {
              console.error('Error processing provider booking:', bookingErr)
            }
          }
        }
      }

      // Generar invitaciones con QR para cada email
      if (formData.inviteEmails && formData.inviteEmails.trim() !== '') {
        const emails = formData.inviteEmails.split(',').map(email => email.trim()).filter(email => email !== '')
        
        for (const email of emails) {
          try {
            const invitationCode = `${event[0].event_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            
            const { error: invitationError } = await supabase
              .from('event_invitations')
              .insert([{
                event_id: event[0].event_id,
                guest_email: email,
                invitation_code: invitationCode,
                qr_code_url: `https://ktrin-web.vercel.app/invitation/${invitationCode}`,
                status: 'sent',
                created_at: new Date().toISOString()
              }])
              
            if (invitationError) {
              console.error('Error creating invitation for', email, ':', invitationError)
            }
          } catch (invitationErr) {
            console.error('Error processing invitation for', email, ':', invitationErr)
          }
        }
      }
      
      console.log('Evento creado exitosamente:', event)
      setCreatedEventId(event[0].event_id)
      setEventCreated(true)
      setShowInvitation(true)
    } catch (err) {
      console.error('Error al crear el evento:', err)
      setError(err.message || 'Error al crear el evento. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <ServiceSelector 
      onServiceSelect={handleServiceSelection}
      onNext={handleNext}
    />
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¿Qué tipo de evento estás organizando?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Esto nos ayudará a personalizar las recomendaciones para tu evento
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventTypes.map((type) => (
          <Card 
            key={type.value}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              formData.type === type.value 
                ? 'ring-2 ring-indigo-500 bg-indigo-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleSelectChange('type', type.value)}
          >
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-full ${
                  formData.type === type.value 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {type.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{type.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </div>
                {formData.type === type.value && (
                  <CheckCircle className="h-6 w-6 text-indigo-600" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Información básica del evento
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Completa los detalles principales de tu {eventTypes.find(t => t.value === formData.type)?.label.toLowerCase()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del Evento *</Label>
            <Input
              id="name"
              name="name"
              placeholder={`Ej: ${formData.type === 'cumpleanos' ? 'Cumpleaños de María' : 
                formData.type === 'boda' ? 'Boda de Juan y Ana' : 
                'Mi evento especial'}`}
              value={formData.name}
              onChange={handleChange}
              required
            />
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

          {/* Solo mostrar cantidad de invitados si es necesario */}
          {formData.requiresGuests && (
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
                <p className="text-sm text-gray-600 mt-1">
                  Necesario para calcular el costo de servicios por persona
                </p>
              </div>
              <div>
                <Label>Público Objetivo</Label>
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
          )}

          {!formData.requiresGuests && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>¡Perfecto!</strong> Los servicios que seleccionaste no requieren especificar la cantidad de invitados. 
                Esto hace que el proceso sea más rápido y flexible.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mostrar resumen de servicios y costo */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Resumen de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formData.selectedServices.map((service) => (
              <div key={service.service_id} className="flex justify-between items-center">
                <span className="font-medium text-green-800">{service.name}</span>
                <span className="text-green-600">
                  ${service.price.toLocaleString()} {service.unit}
                </span>
              </div>
            ))}
            
            <div className="border-t border-green-300 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-800">Costo Total Estimado:</span>
                <span className="text-xl font-bold text-green-600">
                  ${calculateEstimatedCost().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¿Dónde será tu evento?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Selecciona la ubicación perfecta para tu {eventTypes.find(t => t.value === formData.type)?.label.toLowerCase()}
        </p>
      </div>

      <LocationSelector 
        onLocationSelect={(locationData) => {
          setFormData(prev => ({
            ...prev,
            locationData: locationData,
            location: locationData.address
          }))
        }}
      />
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Personalización y confirmación
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Últimos detalles para hacer tu evento perfecto
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="splitCosts"
                checked={formData.splitCosts}
                onCheckedChange={(checked) => handleSelectChange('splitCosts', checked)}
              />
              <Label htmlFor="splitCosts">Dividir costos con amigos</Label>
            </div>
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
        </CardContent>
      </Card>

      {/* Resumen final del evento */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Final del Evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            {formData.requiresGuests && (
              <div>
                <span className="font-medium">Invitados:</span> {formData.guestCount}
              </div>
            )}
          </div>
          
          <div>
            <span className="font-medium">Servicios Seleccionados:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.selectedServices.map(service => (
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
                ${calculateEstimatedCost().toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Selecciona tus servicios'
      case 2: return 'Tipo de evento'
      case 3: return 'Información básica'
      case 4: return 'Ubicación'
      case 5: return 'Confirmación'
      default: return 'Crear evento'
    }
  }

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
              {getStepTitle()} - Paso {currentStep} de 5
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progreso</span>
            <span className="text-sm text-gray-500">{currentStep}/5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Contenido del paso actual */}
        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {/* Navigation Buttons */}
        {currentStep > 1 && (
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>
            
            {currentStep < 5 ? (
              <Button onClick={handleNext}>
                Siguiente
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creando Evento...' : 'Crear Evento'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Mostrar invitaciones con QR cuando el evento se haya creado */}
      {showInvitation && eventCreated && createdEventId && (
        <EventInvitationDisplay 
          eventId={createdEventId}
          onClose={() => {
            setShowInvitation(false)
            navigate('/dashboard/client')
          }}
        />
      )}
    </div>
  )
}

export default OptimizedCreateEvent

