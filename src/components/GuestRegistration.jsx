import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  User, 
  Mail, 
  Phone, 
  AlertTriangle, 
  Heart, 
  Leaf, 
  Shield, 
  CheckCircle,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react'

const GuestRegistration = ({ eventData = null, onRegistrationComplete = null }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dietaryConditions: [],
    customDietaryCondition: '',
    additionalNotes: '',
    emergencyContact: '',
    emergencyPhone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  // Condiciones alimenticias predefinidas con información detallada
  const dietaryConditions = [
    {
      id: 'celiac',
      name: 'Celiaquía',
      description: 'Intolerancia al gluten',
      severity: 'alta',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    {
      id: 'diabetes',
      name: 'Diabetes',
      description: 'Control de azúcar en sangre',
      severity: 'alta',
      icon: <Heart className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    {
      id: 'lactose_intolerant',
      name: 'Intolerancia a la Lactosa',
      description: 'No puede consumir lácteos',
      severity: 'media',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    {
      id: 'nut_allergy',
      name: 'Alergia a Frutos Secos',
      description: 'Alergia severa a nueces y almendras',
      severity: 'alta',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    {
      id: 'vegan',
      name: 'Veganismo',
      description: 'No consume productos de origen animal',
      severity: 'baja',
      icon: <Leaf className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'vegetarian',
      name: 'Vegetarianismo',
      description: 'No consume carne ni pescado',
      severity: 'baja',
      icon: <Leaf className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'halal',
      name: 'Halal',
      description: 'Alimentación según preceptos islámicos',
      severity: 'media',
      icon: <Shield className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'kosher',
      name: 'Kosher',
      description: 'Alimentación según preceptos judíos',
      severity: 'media',
      icon: <Shield className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'keto',
      name: 'Dieta Cetogénica',
      description: 'Baja en carbohidratos, alta en grasas',
      severity: 'baja',
      icon: <Heart className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      id: 'low_sodium',
      name: 'Bajo en Sodio',
      description: 'Restricción de sal por salud',
      severity: 'media',
      icon: <Heart className="h-4 w-4" />,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  ]

  // Datos de ejemplo del evento
  const defaultEventData = {
    name: 'Fiesta de Graduación',
    date: '2025-08-15',
    time: '18:00',
    location: 'Salón de Eventos Universidad Nacional',
    organizer: 'María González'
  }

  const currentEventData = eventData || defaultEventData

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDietaryConditionToggle = (conditionId) => {
    setFormData(prev => ({
      ...prev,
      dietaryConditions: prev.dietaryConditions.includes(conditionId)
        ? prev.dietaryConditions.filter(id => id !== conditionId)
        : [...prev.dietaryConditions, conditionId]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simular envío de datos
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Notificar al organizador si hay condiciones alimenticias
      if (formData.dietaryConditions.length > 0 || formData.customDietaryCondition) {
        // Aquí se enviaría la notificación al organizador
        console.log('Notificando al organizador sobre condiciones alimenticias:', {
          guest: `${formData.firstName} ${formData.lastName}`,
          conditions: formData.dietaryConditions,
          customCondition: formData.customDietaryCondition,
          eventId: currentEventData.id
        })
      }

      setIsRegistered(true)
      
      if (onRegistrationComplete) {
        onRegistrationComplete({
          ...formData,
          eventData: currentEventData
        })
      }
    } catch (error) {
      console.error('Error al registrar invitado:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSelectedConditions = () => {
    return dietaryConditions.filter(condition => 
      formData.dietaryConditions.includes(condition.id)
    )
  }

  const hasHighSeverityConditions = () => {
    return getSelectedConditions().some(condition => condition.severity === 'alta')
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                ¡Registro Completado!
              </h2>
              <p className="text-green-700 mb-4">
                Te has registrado exitosamente para el evento "{currentEventData.name}"
              </p>
              
              {(formData.dietaryConditions.length > 0 || formData.customDietaryCondition) && (
                <Alert className="mt-4 border-blue-200 bg-blue-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-blue-800">
                    Hemos notificado al organizador sobre tus condiciones alimenticias. 
                    Se ajustarán los productos alimenticios para asegurar que puedas disfrutar del evento.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-6 p-4 bg-white rounded-lg border">
                <h3 className="font-semibold mb-2">Detalles del Evento:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(currentEventData.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {currentEventData.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {currentEventData.location}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Información del evento */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Registro para el Evento</CardTitle>
            <CardDescription className="text-center">
              {currentEventData.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">
                  {new Date(currentEventData.date).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{currentEventData.time}</span>
              </div>
              <div className="flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{currentEventData.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de registro */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Completa tus datos para confirmar tu asistencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+52 55 1234 5678"
                  />
                </div>
              </div>

              {/* Condiciones alimenticias */}
              <div>
                <Label className="text-base font-semibold">Condiciones Alimenticias</Label>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona cualquier condición alimenticia que tengas para que el organizador pueda ajustar el menú
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dietaryConditions.map(condition => (
                    <div
                      key={condition.id}
                      onClick={() => handleDietaryConditionToggle(condition.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.dietaryConditions.includes(condition.id)
                          ? condition.color
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {condition.icon}
                          <div className="ml-2">
                            <h4 className="font-medium text-sm">{condition.name}</h4>
                            <p className="text-xs opacity-75">{condition.description}</p>
                          </div>
                        </div>
                        <Checkbox 
                          checked={formData.dietaryConditions.includes(condition.id)}
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Condición personalizada */}
                <div className="mt-4">
                  <Label htmlFor="customDietaryCondition">Otra condición alimenticia</Label>
                  <Input
                    id="customDietaryCondition"
                    name="customDietaryCondition"
                    value={formData.customDietaryCondition}
                    onChange={handleInputChange}
                    placeholder="Describe cualquier otra restricción alimenticia..."
                  />
                </div>
              </div>

              {/* Alerta para condiciones de alta severidad */}
              {hasHighSeverityConditions() && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    Has seleccionado condiciones alimenticias de alta severidad. 
                    El organizador será notificado inmediatamente para asegurar tu seguridad.
                  </AlertDescription>
                </Alert>
              )}

              {/* Notas adicionales */}
              <div>
                <Label htmlFor="additionalNotes">Notas Adicionales</Label>
                <Textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  placeholder="Cualquier información adicional que el organizador deba saber..."
                  rows={3}
                />
              </div>

              {/* Contacto de emergencia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                  <Input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    placeholder="+52 55 1234 5678"
                  />
                </div>
              </div>

              {/* Resumen de condiciones seleccionadas */}
              {(formData.dietaryConditions.length > 0 || formData.customDietaryCondition) && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Condiciones Alimenticias Seleccionadas:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedConditions().map(condition => (
                        <Badge key={condition.id} className={condition.color}>
                          {condition.icon}
                          <span className="ml-1">{condition.name}</span>
                        </Badge>
                      ))}
                      {formData.customDietaryCondition && (
                        <Badge className="bg-gray-100 text-gray-800">
                          {formData.customDietaryCondition}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Confirmar Asistencia'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GuestRegistration

