import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  Share2, 
  QrCode, 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  Copy,
  Check,
  Sparkles
} from 'lucide-react'
import QRCode from 'qrcode'

const EventInvitation = ({ eventData, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)

  // Generar URL única del evento
  const eventUrl = `https://ktrin.app/event/${eventData.id || 'demo-event'}`
  
  // Datos del evento con valores por defecto
  const event = {
    name: eventData.name || 'Mi Evento Especial',
    type: eventData.type || 'Celebración',
    date: eventData.date || '2025-08-15',
    time: eventData.time || '18:00',
    endTime: eventData.endTime || '23:00',
    location: eventData.location || 'Ubicación por confirmar',
    description: eventData.description || 'Te invitamos a celebrar con nosotros',
    organizer: eventData.organizer || 'Organizador del Evento',
    guestCount: eventData.guestCount || 50,
    dresscode: eventData.dresscode || 'Casual elegante',
    ...eventData
  }

  useEffect(() => {
    generateQRCode()
  }, [eventUrl])

  const generateQRCode = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(eventUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#4F46E5',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const copyEventUrl = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const downloadInvitation = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Configurar canvas
    canvas.width = 800
    canvas.height = 1200
    
    // Fondo degradado
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Fondo blanco para el contenido
    ctx.fillStyle = 'white'
    ctx.roundRect(40, 80, canvas.width - 80, canvas.height - 160, 20)
    ctx.fill()
    
    // Título
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('¡Estás Invitado!', canvas.width / 2, 180)
    
    // Nombre del evento
    ctx.font = 'bold 36px Arial'
    ctx.fillStyle = '#4f46e5'
    ctx.fillText(event.name, canvas.width / 2, 250)
    
    // Tipo de evento
    ctx.font = '24px Arial'
    ctx.fillStyle = '#6b7280'
    ctx.fillText(event.type, canvas.width / 2, 290)
    
    // Detalles del evento
    ctx.textAlign = 'left'
    ctx.font = '20px Arial'
    ctx.fillStyle = '#374151'
    
    const details = [
      `📅 ${formatDate(event.date)}`,
      `🕐 ${event.time} - ${event.endTime}`,
      `📍 ${event.location}`,
      `👥 ${event.guestCount} invitados`,
      `👔 ${event.dresscode}`
    ]
    
    details.forEach((detail, index) => {
      ctx.fillText(detail, 80, 360 + (index * 40))
    })
    
    // Descripción
    if (event.description) {
      ctx.font = '18px Arial'
      ctx.fillStyle = '#6b7280'
      const words = event.description.split(' ')
      let line = ''
      let y = 580
      
      words.forEach(word => {
        const testLine = line + word + ' '
        const metrics = ctx.measureText(testLine)
        if (metrics.width > 640 && line !== '') {
          ctx.fillText(line, 80, y)
          line = word + ' '
          y += 25
        } else {
          line = testLine
        }
      })
      ctx.fillText(line, 80, y)
    }
    
    // QR Code
    if (qrCodeUrl) {
      const qrImage = new Image()
      qrImage.onload = () => {
        ctx.drawImage(qrImage, canvas.width / 2 - 100, 750, 200, 200)
        
        // Texto del QR
        ctx.font = '16px Arial'
        ctx.fillStyle = '#6b7280'
        ctx.textAlign = 'center'
        ctx.fillText('Escanea para confirmar asistencia', canvas.width / 2, 980)
        ctx.fillText('Solo usuarios de Ktrin pueden asistir', canvas.width / 2, 1000)
        
        // Organizador
        ctx.font = '14px Arial'
        ctx.fillText(`Organizado por: ${event.organizer}`, canvas.width / 2, 1050)
        
        // Descargar
        const link = document.createElement('a')
        link.download = `invitacion-${event.name.replace(/\s+/g, '-').toLowerCase()}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
      qrImage.src = qrCodeUrl
    }
  }

  const shareInvitation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invitación: ${event.name}`,
          text: `¡Estás invitado a ${event.name}! ${formatDate(event.date)} a las ${event.time}`,
          url: eventUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      copyEventUrl()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invitación Generada</h2>
              <p className="text-gray-600">Tu evento está listo para compartir</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Invitación Preview */}
          <Card className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-2xl font-bold text-gray-900">¡Estás Invitado!</h3>
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="text-xl font-semibold text-indigo-700 mb-2">{event.name}</h4>
                <Badge className="bg-indigo-100 text-indigo-800">{event.type}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    <span>{event.time} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="h-4 w-4 text-indigo-600" />
                    <span>{event.guestCount} invitados</span>
                  </div>
                  {event.dresscode && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-indigo-600">👔</span>
                      <span>{event.dresscode}</span>
                    </div>
                  )}
                </div>
              </div>

              {event.description && (
                <div className="mb-6">
                  <p className="text-gray-600 text-center italic">"{event.description}"</p>
                </div>
              )}

              {/* QR Code */}
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-lg shadow-sm border">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 mx-auto" />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Escanea para confirmar asistencia
                </p>
                <p className="text-xs text-gray-500">
                  Solo usuarios de Ktrin pueden asistir
                </p>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Organizado por: <span className="font-medium">{event.organizer}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* URL del Evento */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Enlace del Evento</CardTitle>
              <CardDescription>
                Comparte este enlace con tus invitados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={eventUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyEventUrl}
                  className="flex items-center gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={downloadInvitation} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Descargar Invitación
            </Button>
            <Button variant="outline" onClick={shareInvitation} className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          </div>

          {/* Información Importante */}
          <Alert className="mt-6">
            <QrCode className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Solo los usuarios registrados en Ktrin podrán confirmar su asistencia 
              escaneando el código QR. Esto garantiza la seguridad y control de acceso a tu evento.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Canvas oculto para generar la imagen */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default EventInvitation

