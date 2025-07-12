import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  AlertTriangle,
  CheckCircle,
  X,
  Check,
  Info,
  Utensils,
  Shield
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const GuestInvitationPage = () => {
  const { invitationCode } = useParams()
  const navigate = useNavigate()
  
  const [invitation, setInvitation] = useState(null)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState(1) // 1: Confirmación, 2: Condiciones alimenticias, 3: Completado

  const [formData, setFormData] = useState({
    willAttend: null,
    dietaryRestrictions: [],
    allergies: [],
    emergencyContactName: '',
    emergencyContactPhone: '',
    specialRequests: '',
    accessibilityNeeds: '',
    customDietaryNote: ''
  })

  // Condiciones alimenticias predefinidas
  const dietaryConditions = [
    { id: 'vegetarian', name: 'Vegetariano', severity: 'baja', icon: '🌱', color: 'green' },
    { id: 'vegan', name: 'Vegano', severity: 'baja', icon: '🌿', color: 'green' },
    { id: 'gluten-free', name: 'Sin Gluten (Celiaquía)', severity: 'alta', icon: '🚫', color: 'red' },
    { id: 'lactose-free', name: 'Sin Lactosa', severity: 'media', icon: '🥛', color: 'yellow' },
    { id: 'nut-allergy', name: 'Alergia a Frutos Secos', severity: 'alta', icon: '🥜', color: 'red' },
    { id: 'egg-allergy', name: 'Alergia al Huevo', severity: 'alta', icon: '🥚', color: 'red' },
    { id: 'fish-allergy', name: 'Alergia al Pescado/Mariscos', severity: 'alta', icon: '🐟', color: 'red' },
    { id: 'diabetes', name: 'Diabetes (Control de Azúcar)', severity: 'alta', icon: '💉', color: 'red' },
    { id: 'halal', name: 'Halal', severity: 'media', icon: '☪️', color: 'blue' },
    { id: 'kosher', name: 'Kosher', severity: 'media', icon: '✡️', color: 'blue' },
    { id: 'keto', name: 'Dieta Cetogénica', severity: 'baja', icon: '🥑', color: 'purple' },
    { id: 'low-sodium', name: 'Bajo en Sodio', severity: 'media', icon: '🧂', color: 'yellow' }
  ]

  // Cargar invitación y evento
  useEffect(() => {
    if (invitationCode) {
      loadInvitation()
    }
  }, [invitationCode])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      
      // Cargar invitación
      const { data: invitationData, error: invitationError } = await supabase
        .from('event_invitations')
        .select('*')
        .eq('invitation_code', invitationCode)
        .single()

      if (invitationError) throw invitationError

      if (!invitationData) {
        setError('Código de invitación no válido')
        return
      }

      setInvitation(invitationData)

      // Cargar evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('event_id', invitationData.event_id)
        .single()

      if (eventError) throw eventError
      setEvent(eventData)

      // Si ya respondió, mostrar estado
      if (invitationData.status !== 'pending' && invitationData.status !== 'sent') {
        setStep(3)
      }

    } catch (err) {
      console.error('Error loading invitation:', err)
      setError('Error al cargar la invitación')
    } finally {
      setLoading(false)
    }
  }

  const handleDietaryChange = (conditionId, checked) => {
    if (checked) {
      setFormData({
        ...formData,
        dietaryRestrictions: [...formData.dietaryRestrictions, conditionId]
      })
    } else {
      setFormData({
        ...formData,
        dietaryRestrictions: formData.dietaryRestrictions.filter(id => id !== conditionId)
      })
    }
  }

  const handleSubmitResponse = async () => {
    setSubmitting(true)
    setError('')

    try {
      // Crear respuesta de invitación
      const responseData = {
        invitation_id: invitation.invitation_id,
        will_attend: formData.willAttend,
        dietary_restrictions: formData.dietaryRestrictions,
        allergies: formData.allergies,
        emergency_contact_name: formData.emergencyContactName || null,
        emergency_contact_phone: formData.emergencyContactPhone || null,
        special_requests: formData.specialRequests || null,
        accessibility_needs: formData.accessibilityNeeds || null
      }

      const { error: responseError } = await supabase
        .from('invitation_responses')
        .insert([responseData])

      if (responseError) throw responseError

      // Actualizar estado de invitación
      const newStatus = formData.willAttend ? 'accepted' : 'declined'
      const { error: updateError } = await supabase
        .from('event_invitations')
        .update({ 
          status: newStatus,
          responded_at: new Date().toISOString()
        })
        .eq('invitation_id', invitation.invitation_id)

      if (updateError) throw updateError

      // Si asiste y tiene restricciones alimenticias, crear registro de invitado
      if (formData.willAttend) {
        const guestData = {
          event_id: event.event_id,
          first_name: invitation.guest_name.split(' ')[0],
          last_name: invitation.guest_name.split(' ').slice(1).join(' '),
          email: invitation.guest_email,
          phone: invitation.guest_phone,
          invitation_id: invitation.invitation_id,
          dietary_restrictions: formData.dietaryRestrictions.join(', '),
          allergies: formData.allergies.join(', '),
          special_dietary_notes: formData.customDietaryNote,
          emergency_contact_name: formData.emergencyContactName,
          emergency_contact_phone: formData.emergencyContactPhone,
          dietary_severity: getDietarySeverity(),
          requires_special_menu: formData.dietaryRestrictions.length > 0 || formData.allergies.length > 0
        }

        const { error: guestError } = await supabase
          .from('guests')
          .insert([guestData])

        if (guestError) throw guestError

        // Crear notificaciones si hay restricciones alimenticias
        if (formData.dietaryRestrictions.length > 0 || formData.allergies.length > 0) {
          await createDietaryNotifications()
        }
      }

      setStep(3)
      setSuccess(formData.willAttend ? 'Asistencia confirmada exitosamente' : 'Respuesta registrada')

    } catch (err) {
      console.error('Error submitting response:', err)
      setError('Error al enviar la respuesta')
    } finally {
      setSubmitting(false)
    }
  }

  const getDietarySeverity = () => {
    const severities = formData.dietaryRestrictions.map(id => {
      const condition = dietaryConditions.find(c => c.id === id)
      return condition?.severity || 'baja'
    })

    if (severities.includes('alta')) return 'alta'
    if (severities.includes('media')) return 'media'
    return 'baja'
  }

  const createDietaryNotifications = async () => {
    try {
      const restrictions = [...formData.dietaryRestrictions, ...formData.allergies]
      const severity = getDietarySeverity()
      
      const notificationData = {
        event_id: event.event_id,
        organizer_id: event.organizer_id,
        dietary_condition: restrictions.join(', '),
        severity: severity,
        message: `${invitation.guest_name} ha reportado condiciones alimenticias: ${restrictions.join(', ')}. ${severity === 'alta' ? 'Requiere atención especial.' : ''}`,
        status: 'pending'
      }

      await supabase
        .from('dietary_notifications')
        .insert([notificationData])

    } catch (err) {
      console.error('Error creating dietary notifications:', err)
    }
  }

  const getSeverityBadge = (severity) => {
    const config = {
      alta: { color: 'bg-red-100 text-red-800', text: 'Alta Prioridad' },
      media: { color: 'bg-yellow-100 text-yellow-800', text: 'Media Prioridad' },
      baja: { color: 'bg-green-100 text-green-800', text: 'Baja Prioridad' }
    }
    
    const severityConfig = config[severity] || config.baja
    return (
      <Badge className={severityConfig.color}>
        {severityConfig.text}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando invitación...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <X className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/')}
            >
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header del evento */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              {event?.title}
            </CardTitle>
            <CardDescription>
              Invitación para {invitation?.guest_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{new Date(event?.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{event?.event_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{event?.address || 'Ubicación por confirmar'}</span>
              </div>
            </div>
            {event?.description && (
              <p className="mt-4 text-gray-600">{event.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Paso 1: Confirmación de asistencia */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>¿Podrás asistir?</CardTitle>
              <CardDescription>
                Por favor confirma tu asistencia al evento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant={formData.willAttend === true ? "default" : "outline"}
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setFormData({ ...formData, willAttend: true })}
                >
                  <Check className="h-6 w-6" />
                  Sí, asistiré
                </Button>
                <Button
                  variant={formData.willAttend === false ? "destructive" : "outline"}
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setFormData({ ...formData, willAttend: false })}
                >
                  <X className="h-6 w-6" />
                  No podré asistir
                </Button>
              </div>

              {formData.willAttend !== null && (
                <div className="pt-4">
                  <Button 
                    onClick={() => formData.willAttend ? setStep(2) : handleSubmitResponse()}
                    className="w-full"
                    disabled={submitting}
                  >
                    {formData.willAttend ? 'Continuar' : 'Enviar Respuesta'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Paso 2: Condiciones alimenticias */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Condiciones Alimenticias
                </CardTitle>
                <CardDescription>
                  Ayúdanos a preparar un menú inclusivo para todos. Selecciona todas las condiciones que apliquen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Condiciones alimenticias */}
                <div>
                  <Label className="text-base font-semibold">Restricciones Alimenticias</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {dietaryConditions.map((condition) => (
                      <div key={condition.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={condition.id}
                          checked={formData.dietaryRestrictions.includes(condition.id)}
                          onCheckedChange={(checked) => handleDietaryChange(condition.id, checked)}
                        />
                        <div className="flex-1">
                          <label htmlFor={condition.id} className="flex items-center gap-2 cursor-pointer">
                            <span className="text-lg">{condition.icon}</span>
                            <span className="font-medium">{condition.name}</span>
                            {getSeverityBadge(condition.severity)}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nota personalizada */}
                <div>
                  <Label htmlFor="custom-dietary">Otras condiciones o notas especiales</Label>
                  <Textarea
                    id="custom-dietary"
                    placeholder="Describe cualquier otra condición alimenticia, alergia o preferencia especial..."
                    value={formData.customDietaryNote}
                    onChange={(e) => setFormData({ ...formData, customDietaryNote: e.target.value })}
                    className="mt-2"
                  />
                </div>

                {/* Contacto de emergencia */}
                <Separator />
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Contacto de Emergencia
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label htmlFor="emergency-name">Nombre</Label>
                      <Input
                        id="emergency-name"
                        placeholder="Nombre del contacto"
                        value={formData.emergencyContactName}
                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency-phone">Teléfono</Label>
                      <Input
                        id="emergency-phone"
                        placeholder="+1234567890"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Solicitudes especiales */}
                <div>
                  <Label htmlFor="special-requests">Solicitudes Especiales</Label>
                  <Textarea
                    id="special-requests"
                    placeholder="¿Hay algo más que debamos saber? (accesibilidad, ubicación preferida, etc.)"
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    className="mt-2"
                  />
                </div>

                {/* Información importante */}
                {formData.dietaryRestrictions.some(id => 
                  dietaryConditions.find(c => c.id === id)?.severity === 'alta'
                ) && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Has seleccionado condiciones de alta prioridad. El organizador y los proveedores 
                      serán notificados para asegurar que el menú sea seguro para ti.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Volver
                  </Button>
                  <Button 
                    onClick={handleSubmitResponse}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Enviando...' : 'Confirmar Asistencia'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Paso 3: Completado */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                ¡Respuesta Registrada!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invitation?.status === 'accepted' ? (
                <div>
                  <p className="text-green-600 font-semibold">Tu asistencia ha sido confirmada</p>
                  <p className="text-gray-600 mt-2">
                    Gracias por confirmar tu asistencia. El organizador ha sido notificado sobre 
                    tus condiciones alimenticias y trabajará con los proveedores para asegurar 
                    que tengas opciones seguras y deliciosas en el evento.
                  </p>
                  {formData.dietaryRestrictions.length > 0 && (
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Hemos notificado al organizador sobre tus condiciones alimenticias. 
                        Si tienes alguna pregunta adicional, puedes contactar directamente al organizador.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">
                    Lamentamos que no puedas asistir. Tu respuesta ha sido registrada.
                  </p>
                </div>
              )}
              
              <Button 
                onClick={() => navigate('/')}
                className="w-full mt-6"
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Alertas */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}

export default GuestInvitationPage

