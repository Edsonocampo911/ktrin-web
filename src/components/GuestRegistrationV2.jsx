import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  PartyPopper,
  CheckCircle,
  AlertTriangle,
  Loader2,
  UserPlus,
  Heart
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const GuestRegistrationV2 = () => {
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const invitationCode = searchParams.get('code')

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dietaryRestrictions: '',
    allergies: '',
    plusOne: false,
    plusOneName: '',
    specialRequests: '',
    attendanceConfirmed: true
  })

  const dietaryOptions = [
    'Sin restricciones',
    'Vegetariano',
    'Vegano',
    'Sin gluten',
    'Sin lactosa',
    'Kosher',
    'Halal',
    'Otro'
  ]

  useEffect(() => {
    if (eventId) {
      fetchEventDetails()
    }
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      setError('')

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          users!events_organizer_id_fkey (
            full_name,
            email
          )
        `)
        .eq('event_id', eventId)
        .single()

      if (eventError) {
        throw eventError
      }

      if (!eventData) {
        throw new Error('Evento no encontrado')
      }

      setEvent(eventData)

      // Verificar si el código de invitación es válido (si se proporciona)
      if (invitationCode) {
        const { data: invitationData, error: invitationError } = await supabase
          .from('event_invitations')
          .select('*')
          .eq('event_id', eventId)
          .eq('invitation_code', invitationCode)
          .single()

        if (invitationError || !invitationData) {
          console.warn('Código de invitación no válido, pero permitiendo registro')
        }
      }

    } catch (err) {
      console.error('Error fetching event:', err)
      setError(err.message || 'Error al cargar los detalles del evento')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('El nombre completo es requerido')
      return false
    }

    if (!formData.email.trim()) {
      setError('El email es requerido')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido')
      return false
    }

    if (formData.plusOne && !formData.plusOneName.trim()) {
      setError('Si traes acompañante, por favor ingresa su nombre')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Verificar si el invitado ya está registrado
      const { data: existingGuest, error: checkError } = await supabase
        .from('event_guests')
        .select('*')
        .eq('event_id', eventId)
        .eq('email', formData.email.trim())
        .single()

      if (existingGuest) {
        throw new Error('Ya estás registrado para este evento')
      }

      // Registrar al invitado principal
      const guestData = {
        event_id: parseInt(eventId),
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        dietary_restrictions: formData.dietaryRestrictions || null,
        allergies: formData.allergies.trim() || null,
        special_requests: formData.specialRequests.trim() || null,
        attendance_confirmed: formData.attendanceConfirmed,
        plus_one: formData.plusOne,
        plus_one_name: formData.plusOne ? formData.plusOneName.trim() : null,
        invitation_code: invitationCode || null,
        registered_at: new Date().toISOString()
      }

      const { error: insertError } = await supabase
        .from('event_guests')
        .insert([guestData])

      if (insertError) {
        throw insertError
      }

      // Actualizar el estado de la invitación si existe
      if (invitationCode) {
        await supabase
          .from('event_invitations')
          .update({ 
            status: 'accepted',
            responded_at: new Date().toISOString()
          })
          .eq('invitation_code', invitationCode)
      }

      setSuccess(true)

    } catch (err) {
      console.error('Error registering guest:', err)
      setError(err.message || 'Error al registrar. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString ? new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }) : ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Cargando detalles del evento...</p>
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar el evento
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Registro exitoso!
            </h2>
            <p className="text-gray-600 mb-4">
              Te has registrado correctamente para <strong>{event?.title}</strong>
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Recibirás una confirmación por email</p>
              <p>• El organizador será notificado de tu registro</p>
              {formData.plusOne && (
                <p>• Tu acompañante: {formData.plusOneName}</p>
              )}
            </div>
            <Button 
              className="mt-4"
              onClick={() => window.close()}
            >
              Cerrar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <PartyPopper className="h-8 w-8 text-indigo-600 mr-2" />
              <CardTitle className="text-2xl">¡Estás invitado!</CardTitle>
            </div>
            <CardDescription className="text-lg">
              {event?.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(event?.event_date)}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(event?.event_time)}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {event?.address || 'Ubicación por confirmar'}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {event?.attendees_count} invitados esperados
              </div>
            </div>
            
            {event?.description && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{event.description}</p>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Organizado por: <strong>{event?.users?.full_name || event?.users?.email}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Confirma tu asistencia
            </CardTitle>
            <CardDescription>
              Por favor completa la información para registrarte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Información personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nombre completo *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Tu nombre completo"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Restricciones alimentarias */}
              <div>
                <Label>Restricciones alimentarias</Label>
                <Select onValueChange={(value) => handleSelectChange('dietaryRestrictions', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona si tienes alguna restricción" />
                  </SelectTrigger>
                  <SelectContent>
                    {dietaryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="allergies">Alergias alimentarias</Label>
                <Input
                  id="allergies"
                  name="allergies"
                  placeholder="Especifica cualquier alergia alimentaria"
                  value={formData.allergies}
                  onChange={handleChange}
                />
              </div>

              {/* Acompañante */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="plusOne"
                    name="plusOne"
                    checked={formData.plusOne}
                    onCheckedChange={(checked) => handleSelectChange('plusOne', checked)}
                  />
                  <Label htmlFor="plusOne">Asistiré con acompañante</Label>
                </div>

                {formData.plusOne && (
                  <div>
                    <Label htmlFor="plusOneName">Nombre del acompañante *</Label>
                    <Input
                      id="plusOneName"
                      name="plusOneName"
                      placeholder="Nombre de tu acompañante"
                      value={formData.plusOneName}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>

              {/* Solicitudes especiales */}
              <div>
                <Label htmlFor="specialRequests">Solicitudes especiales</Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  placeholder="¿Hay algo especial que el organizador debería saber?"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Confirmación de asistencia */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attendanceConfirmed"
                  name="attendanceConfirmed"
                  checked={formData.attendanceConfirmed}
                  onCheckedChange={(checked) => handleSelectChange('attendanceConfirmed', checked)}
                />
                <Label htmlFor="attendanceConfirmed">
                  Confirmo que asistiré a este evento
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !formData.attendanceConfirmed}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Confirmar asistencia
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GuestRegistrationV2

