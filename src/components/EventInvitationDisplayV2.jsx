import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import QRGenerator from './QRGenerator'
import {
  X,
  PartyPopper,
  Users,
  Mail,
  QrCode,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Share2
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const EventInvitationDisplayV2 = ({ eventId, onClose }) => {
  const [event, setEvent] = useState(null)
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mainInvitationCode, setMainInvitationCode] = useState('')

  useEffect(() => {
    if (eventId) {
      fetchEventAndInvitations()
    }
  }, [eventId])

  const fetchEventAndInvitations = async () => {
    try {
      setLoading(true)
      setError('')

      // Obtener detalles del evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('event_id', eventId)
        .single()

      if (eventError) {
        throw eventError
      }

      setEvent(eventData)

      // Obtener invitaciones existentes
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('event_invitations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (invitationsError) {
        console.error('Error fetching invitations:', invitationsError)
        // No es crítico, continuamos sin las invitaciones
      } else {
        setInvitations(invitationsData || [])
      }

      // Crear o obtener invitación principal para el QR
      let mainCode = ''
      if (invitationsData && invitationsData.length > 0) {
        // Usar la primera invitación como principal
        mainCode = invitationsData[0].invitation_code
      } else {
        // Crear una invitación principal
        mainCode = `${eventId}_${Date.now()}_main_${Math.random().toString(36).substr(2, 9)}`
        
        try {
          const { error: createError } = await supabase
            .from('event_invitations')
            .insert([{
              event_id: eventId,
              guest_email: 'general@invitation.com',
              invitation_code: mainCode,
              qr_code_url: `${window.location.origin}/guest-registration-v2/${eventId}?code=${mainCode}`,
              status: 'sent',
              created_at: new Date().toISOString()
            }])

          if (createError) {
            console.error('Error creating main invitation:', createError)
            // Usar un código simple si falla
            mainCode = `${eventId}_main`
          }
        } catch (err) {
          console.error('Error creating main invitation:', err)
          mainCode = `${eventId}_main`
        }
      }

      setMainInvitationCode(mainCode)

    } catch (err) {
      console.error('Error fetching event and invitations:', err)
      setError(err.message || 'Error al cargar la información del evento')
    } finally {
      setLoading(false)
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      sent: { label: 'Enviada', variant: 'secondary' },
      accepted: { label: 'Aceptada', variant: 'default' },
      declined: { label: 'Rechazada', variant: 'destructive' },
      pending: { label: 'Pendiente', variant: 'outline' }
    }

    const config = statusConfig[status] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const shareEvent = async () => {
    const registrationUrl = `${window.location.origin}/guest-registration-v2/${eventId}?code=${mainInvitationCode}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invitación a ${event?.title}`,
          text: `¡Estás invitado a ${event?.title}! Regístrate usando este enlace:`,
          url: registrationUrl
        })
      } catch (err) {
        console.error('Error sharing:', err)
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(registrationUrl)
        alert('Enlace copiado al portapapeles')
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(registrationUrl)
        alert('Enlace copiado al portapapeles')
      } catch (err) {
        console.error('Error copying to clipboard:', err)
      }
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-gray-600">Cargando invitaciones...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <PartyPopper className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              ¡Evento creado exitosamente!
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="p-6 border-b">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Event Summary */}
          {event && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>{event.title}</span>
                </CardTitle>
                <CardDescription>
                  Tu evento ha sido creado y está listo para recibir invitados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(event.event_date)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatTime(event.event_time)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {event.attendees_count} invitados esperados
                  </div>
                </div>
                
                {event.address && (
                  <div className="flex items-center text-gray-600 text-sm mt-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.address}
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" onClick={shareEvent}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir evento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                Código QR para invitados
              </h3>
              
              {mainInvitationCode ? (
                <QRGenerator 
                  eventId={eventId}
                  eventTitle={event?.title}
                  invitationCode={mainInvitationCode}
                />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-gray-600">No se pudo generar el código QR</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchEventAndInvitations}
                      className="mt-2"
                    >
                      Intentar de nuevo
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Invitations List */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Invitaciones enviadas
              </h3>
              
              <Card>
                <CardContent className="p-4">
                  {invitations.length === 0 ? (
                    <div className="text-center py-4">
                      <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">
                        No hay invitaciones por email específicas
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Los invitados pueden registrarse usando el QR
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {invitations.map((invitation, index) => (
                        <div 
                          key={invitation.invitation_code || index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {invitation.guest_email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(invitation.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          {getStatusBadge(invitation.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                ¿Qué sigue?
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Comparte el código QR con tus invitados</p>
                <p>• Los invitados pueden escanear el QR para registrarse</p>
                <p>• Recibirás notificaciones cuando se registren</p>
                <p>• Puedes ver la lista de invitados en tu dashboard</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={onClose}>
              Ir al Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventInvitationDisplayV2

