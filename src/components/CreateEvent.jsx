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
import DietaryConditions from './DietaryConditions'
import GiftSuggestions from './GiftSuggestions'
import EventInvitation from './EventInvitation'
import EventInvitationDisplay from './EventInvitationDisplay'
import LocationSelector from './LocationSelector'
import PerGuestSelection from './PerGuestSelection'
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
  Flower
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const CreateEvent = ({ user }) => {
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
    locationData: null, // Para almacenar datos de geolocalización o local alquilado
    
    // Paso 2: Detalles del evento y condiciones alimenticias
    guestCount: '',
    targetAudience: '',
    isPrivate: true,
    isAdultsOnly: false,
    dietaryConditions: [],
    
    // Paso 3: Servicios y regalos sugeridos
    selectedServices: [],
    giftSuggestions: [],
    perGuestItems: {},
    
    // Paso 4: Personalización final
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
    { value: 'cumpleanos', label: 'Cumpleaños', icon: <Heart className="h-4 w-4" /> },
    { value: 'boda', label: 'Boda', icon: <Sparkles className="h-4 w-4" /> },
    { value: 'corporativo', label: 'Evento Corporativo', icon: <Gift className="h-4 w-4" /> },
    { value: 'fiesta', label: 'Fiesta', icon: <PartyPopper className="h-4 w-4" /> },
    { value: 'graduacion', label: 'Graduación', icon: <Gift className="h-4 w-4" /> },
    { value: 'aniversario', label: 'Aniversario', icon: <Heart className="h-4 w-4" /> },
    { value: 'otro', label: 'Otro', icon: <Calendar className="h-4 w-4" /> }
  ]

  const serviceCategories = [
    {
      category: 'Catering y Comida',
      icon: <Utensils className="h-5 w-5" />,
      services: [
        { id: 'catering-premium', service_id: 1, name: 'Catering Premium', price: 45, unit: 'por persona' },
        { id: 'catering-basico', service_id: 2, name: 'Catering Básico', price: 25, unit: 'por persona' },
        { id: 'bar-abierto', service_id: 3, name: 'Bar Abierto', price: 20, unit: 'por persona' },
        { id: 'pasteleria', service_id: 4, name: 'Pastelería Especializada', price: 150, unit: 'por evento' }
      ]
    },
    {
      category: 'Decoración y Flores',
      icon: <Flower className="h-5 w-5" />,
      services: [
        { id: 'decoracion-tematica', service_id: 5, name: 'Decoración Temática', price: 800, unit: 'por evento' },
        { id: 'arreglos-florales', service_id: 6, name: 'Arreglos Florales', price: 300, unit: 'por evento' },
        { id: 'iluminacion', service_id: 7, name: 'Iluminación Especial', price: 500, unit: 'por evento' }
      ]
    },
    {
      category: 'Música y Entretenimiento',
      icon: <Music className="h-5 w-5" />,
      services: [
        { id: 'dj-profesional', service_id: 8, name: 'DJ Profesional', price: 600, unit: 'por evento' },
        { id: 'banda-en-vivo', service_id: 9, name: 'Banda en Vivo', price: 1200, unit: 'por evento' },
        { id: 'animacion', service_id: 10, name: 'Animación para Niños', price: 400, unit: 'por evento' }
      ]
    },
    {
      category: 'Fotografía y Video',
      icon: <Camera className="h-5 w-5" />,
      services: [
        { id: 'fotografia-profesional', service_id: 11, name: 'Fotografía Profesional', price: 1200, unit: 'por evento' },
        { id: 'video-profesional', service_id: 12, name: 'Video Profesional', price: 1800, unit: 'por evento' },
        { id: 'fotobooth', service_id: 13, name: 'Cabina de Fotos', price: 400, unit: 'por evento' }
      ]
    }
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

  const handleServiceToggle = (service) => {
    const isSelected = formData.selectedServices.includes(service.service_id)
    if (isSelected) {
      setFormData({
        ...formData,
        selectedServices: formData.selectedServices.filter(id => id !== service.service_id)
      })
    } else {
      setFormData({
        ...formData,
        selectedServices: [...formData.selectedServices, service.service_id]
      })
    }
  }

  const calculateEstimatedCost = () => {
    let total = 0
    const guestCount = parseInt(formData.guestCount) || 0
    
    serviceCategories.forEach(category => {
      category.services.forEach(service => {
        if (formData.selectedServices.includes(service.service_id)) {
          if (service.unit === 'por persona') {
            total += service.price * guestCount
          } else {
            total += service.price
          }
        }
      })
    })
    
    return total
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
        if (formData.selectedServices.length === 0) {
          setError('Por favor selecciona al menos un servicio')
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

    try {
      const eventDataToInsert = {
        organizer_id: user.id, // Asumiendo que user.id está disponible desde el contexto de autenticación
        title: formData.name,
        description: formData.description,
        event_date: formData.date,
        event_time: formData.startTime,
        location_type: formData.locationData?.type === 'venue' ? 'rental' : 'own',
        address: formData.locationData?.type === 'address' ? formData.locationData.address : null,
        venue_id: formData.locationData?.type === 'venue' ? formData.locationData.venue_id : null,
        attendees_count: parseInt(formData.guestCount),
        budget: calculateEstimatedCost(), // O un campo de presupuesto real si lo hay
        status: 'pending',
        event_type: formData.type,
        special_requests: formData.specialRequests,
        split_costs: formData.splitCosts,
        invite_emails: formData.inviteEmails.split(',').map(email => email.trim()).filter(email => email !== '')
      };

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([eventDataToInsert])
        .select();

      if (eventError) {
        throw eventError;
      }

      // Handle selected services (assuming a many-to-many relationship table like e          const eventServicesData = formData.selectedServices.map(serviceId => ({
            event_id: event[0].event_id,
            service_id: serviceId
          }));
      if (eventServicesData.length > 0) {
        const { error: eventServicesError } = await supabase
          .from('event_services')
          .insert(eventServicesData);
        if (eventServicesError) {
          console.error('Error inserting event services:', eventServicesError);
        } else {
          // Create provider bookings for each service
          for (const serviceData of eventServicesData) {
            try {
              // Get the service details to find the provider
              const { data: serviceDetails, error: serviceError } = await supabase
                .from('services')
                .select('provider_id')
                .eq('service_id', serviceData.service_id)
                .single();

              if (serviceError) {
                console.error('Error fetching service details:', serviceError);
                continue;
              }

              if (serviceDetails?.provider_id) {
                // Create a booking entry for the provider
                const { error: bookingError } = await supabase
                  .from('provider_bookings')
                  .insert([{
                    provider_id: serviceDetails.provider_id,
                    event_id: event[0].event_id,
                    service_id: serviceData.service_id,
                    status: 'pending',
                    created_at: new Date().toISOString()
                  }]);

                if (bookingError) {
                  console.error('Error creating provider booking:', bookingError);
                }
              }
            } catch (bookingErr) {
              console.error('Error processing provider booking:', bookingErr);
            }
          }
        }
      }

      // Handle dietary conditions (assuming a table like event_dietary_conditions or similar)
      if (formData.dietaryConditions.length > 0) {
        const eventDietaryData = formData.dietaryConditions.map(condition => ({
          event_id: event[0].event_id,
          condition_name: condition // This would need to map to actual condition IDs in your DB
        }));
        const { error: eventDietaryError } = await supabase
          .from('event_dietary_conditions')
          .insert(eventDietaryData);
        if (eventDietaryError) console.error('Error inserting event dietary conditions:', eventDietaryError);
      }

      // Handle per guest items (assuming a table like event_per_guest_items)
      if (Object.keys(formData.perGuestItems).length > 0) {
        const perGuestItemsData = Object.entries(formData.perGuestItems).map(([item, quantity]) => ({
          event_id: event[0].event_id,
          item_name: item,
          quantity: quantity
        }));
        const { error: perGuestItemsError } = await supabase
          .from('event_per_guest_items')
          .insert(perGuestItemsData);
        if (perGuestItemsError) console.error('Error inserting per guest items:', perGuestItemsError);
      }
      
      console.log('Evento creado exitosamente:', event);
      setCreatedEventId(event[0].event_id);
      
      // Generar invitaciones con QR para cada email
      if (formData.inviteEmails && formData.inviteEmails.trim() !== '') {
        const emails = formData.inviteEmails.split(',').map(email => email.trim()).filter(email => email !== '');
        
        for (const email of emails) {
          try {
            // Generar código único para la invitación
            const invitationCode = `${event[0].event_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Crear registro de invitación
            const { error: invitationError } = await supabase
              .from('event_invitations')
              .insert([{
                event_id: event[0].event_id,
                guest_email: email,
                invitation_code: invitationCode,
                qr_code_url: `https://ktrin-web.vercel.app/invitation/${invitationCode}`,
                status: 'sent',
                created_at: new Date().toISOString()
              }]);
              
            if (invitationError) {
              console.error('Error creating invitation for', email, ':', invitationError);
            }
          } catch (invitationErr) {
            console.error('Error processing invitation for', email, ':', invitationErr);
          }
        }
      }
      
      setEventCreated(true);
      setShowInvitation(true);
    } catch (err) {
      console.error('Error al crear el evento:', err);
      setError(err.message || 'Error al crear el evento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
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

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Servicios y Regalos</h3>
        
        <div className="space-y-6">
          {serviceCategories.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {category.icon}
                  <span>{category.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.services.map((service) => (
                                        <div 
                      key={service.service_id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.selectedServices.includes(service.service_id) 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleServiceToggle(service)}e)})}rvice)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-gray-600">${service.price} {service.unit}</p>
                        </div>
                        <Checkbox 
                          checked={formData.selectedServices.includes(service.service_id)}
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

        {formData.selectedServices.length > 0 && (
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Costo Estimado Total:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ${calculateEstimatedCost().toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                *Los precios pueden variar según el proveedor seleccionado
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Regalos Sugeridos */}
      <GiftSuggestions 
        gifts={formData.giftSuggestions}
        onGiftsChange={(gifts) => handleSelectChange('giftSuggestions', gifts)}
      />

      {/* Selección de Bebidas y Postres por Invitado */}
      <PerGuestSelection 
        guestCount={parseInt(formData.guestCount) || 0}
        onSelectionChange={(selection) => handleSelectChange('perGuestItems', selection)}
      />
    </div>
  )

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
                  {formData.selectedServices.map(serviceId => {
                    const service = serviceCategories
                      .flatMap(cat => cat.services)
                      .find(s => s.service_id === serviceId)
                    return (
                      <Badge key={serviceId} variant="secondary">
                        {service?.name}
                      </Badge>
                    )
                  })}
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
              Paso {currentStep} de 4
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
            <CardTitle className="text-2xl">Crear Nuevo Evento</CardTitle>
            <CardDescription>
              Completa la información para crear tu evento perfecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
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

export default CreateEvent


