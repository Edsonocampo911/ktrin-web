import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import QRCode from 'react-qr-code'
import {
  QrCode,
  Mail,
  Users,
  Plus,
  Trash2,
  Send,
  CheckCircle,
  AlertCircle,
  Copy,
  Download
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const InvitationGenerator = ({ event, user }) => {
  const [invitations, setInvitations] = useState([])
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sendingEmails, setSendingEmails] = useState(false)

  // Generar código único para invitación
  const generateInvitationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Cargar invitaciones existentes
  useEffect(() => {
    if (event?.event_id) {
      loadInvitations()
    }
  }, [event])

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_invitations')
        .select('*')
        .eq('event_id', event.event_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvitations(data || [])
    } catch (err) {
      console.error('Error loading invitations:', err)
      setError('Error al cargar las invitaciones')
    }
  }

  // Añadir nuevo invitado
  const handleAddGuest = async () => {
    if (!newGuest.name.trim() || !newGuest.email.trim()) {
      setError('Nombre y email son obligatorios')
      return
    }

    setLoading(true)
    setError('')

    try {
      const invitationCode = generateInvitationCode()
      const invitationUrl = `${window.location.origin}/invitation/${invitationCode}`

      const invitationData = {
        event_id: event.event_id,
        invitation_code: invitationCode,
        guest_email: newGuest.email,
        guest_name: newGuest.name,
        guest_phone: newGuest.phone || null,
        qr_code_url: invitationUrl,
        status: 'pending'
      }

      const { data, error } = await supabase
        .from('event_invitations')
        .insert([invitationData])
        .select()

      if (error) throw error

      setInvitations([data[0], ...invitations])
      setNewGuest({ name: '', email: '', phone: '' })
      setSuccess('Invitación creada exitosamente')
    } catch (err) {
      console.error('Error creating invitation:', err)
      setError('Error al crear la invitación')
    } finally {
      setLoading(false)
    }
  }

  // Eliminar invitación
  const handleDeleteInvitation = async (invitationId) => {
    try {
      const { error } = await supabase
        .from('event_invitations')
        .delete()
        .eq('invitation_id', invitationId)

      if (error) throw error

      setInvitations(invitations.filter(inv => inv.invitation_id !== invitationId))
      setSuccess('Invitación eliminada')
    } catch (err) {
      console.error('Error deleting invitation:', err)
      setError('Error al eliminar la invitación')
    }
  }

  // Copiar URL de invitación
  const copyInvitationUrl = (code) => {
    const url = `${window.location.origin}/invitation/${code}`
    navigator.clipboard.writeText(url)
    setSuccess('URL copiada al portapapeles')
  }

  // Descargar QR como imagen
  const downloadQR = (code, guestName) => {
    const svg = document.getElementById(`qr-${code}`)
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const link = document.createElement('a')
      link.download = `qr-invitation-${guestName.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  // Enviar emails (simulado - en producción usarías un servicio real)
  const sendInvitationEmails = async () => {
    setSendingEmails(true)
    setError('')

    try {
      // Aquí implementarías el envío real de emails
      // Por ahora solo simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Actualizar estado de invitaciones a 'sent'
      const invitationIds = invitations.map(inv => inv.invitation_id)
      const { error } = await supabase
        .from('event_invitations')
        .update({ status: 'sent' })
        .in('invitation_id', invitationIds)

      if (error) throw error

      setInvitations(invitations.map(inv => ({ ...inv, status: 'sent' })))
      setSuccess('Invitaciones enviadas por email')
    } catch (err) {
      console.error('Error sending emails:', err)
      setError('Error al enviar las invitaciones por email')
    } finally {
      setSendingEmails(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      sent: { color: 'bg-blue-100 text-blue-800', text: 'Enviada' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Aceptada' },
      declined: { color: 'bg-red-100 text-red-800', text: 'Rechazada' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    )
  }

  if (!event) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Selecciona un evento para generar invitaciones
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Invitaciones con QR - {event.title}
          </CardTitle>
          <CardDescription>
            Genera códigos QR únicos para cada invitado. Los invitados podrán escanear el código 
            para registrarse y especificar sus condiciones alimenticias.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Formulario para añadir invitados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Añadir Invitado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="guest-name">Nombre Completo *</Label>
              <Input
                id="guest-name"
                placeholder="Ej: María García"
                value={newGuest.name}
                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="guest-email">Email *</Label>
              <Input
                id="guest-email"
                type="email"
                placeholder="maria@email.com"
                value={newGuest.email}
                onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="guest-phone">Teléfono (opcional)</Label>
              <Input
                id="guest-phone"
                placeholder="+1234567890"
                value={newGuest.phone}
                onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleAddGuest} 
            disabled={loading}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Creando...' : 'Crear Invitación'}
          </Button>
        </CardContent>
      </Card>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Lista de invitaciones */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Invitaciones Creadas ({invitations.length})
              </CardTitle>
              <CardDescription>
                Gestiona las invitaciones y códigos QR de tu evento
              </CardDescription>
            </div>
            <Button 
              onClick={sendInvitationEmails}
              disabled={sendingEmails || invitations.length === 0}
              variant="outline"
            >
              <Mail className="h-4 w-4 mr-2" />
              {sendingEmails ? 'Enviando...' : 'Enviar por Email'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.invitation_id} className="border rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Información del invitado */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{invitation.guest_name}</h4>
                        {getStatusBadge(invitation.status)}
                      </div>
                      <p className="text-sm text-gray-600">{invitation.guest_email}</p>
                      {invitation.guest_phone && (
                        <p className="text-sm text-gray-600">{invitation.guest_phone}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Código: {invitation.invitation_code}
                      </p>
                    </div>

                    {/* Código QR */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-white p-2 rounded border">
                        <QRCode
                          id={`qr-${invitation.invitation_code}`}
                          value={invitation.qr_code_url}
                          size={120}
                          level="M"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyInvitationUrl(invitation.invitation_code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadQR(invitation.invitation_code, invitation.guest_name)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteInvitation(invitation.invitation_id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1">
              <span className="text-blue-600 font-bold text-sm">1</span>
            </div>
            <p className="text-sm">Crea invitaciones para cada invitado con su código QR único</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1">
              <span className="text-blue-600 font-bold text-sm">2</span>
            </div>
            <p className="text-sm">Los invitados escanean el QR para acceder al formulario de registro</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1">
              <span className="text-blue-600 font-bold text-sm">3</span>
            </div>
            <p className="text-sm">Completan sus condiciones alimenticias y confirman asistencia</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1">
              <span className="text-blue-600 font-bold text-sm">4</span>
            </div>
            <p className="text-sm">Recibes notificaciones sobre necesidades especiales para planificar un evento inclusivo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InvitationGenerator

