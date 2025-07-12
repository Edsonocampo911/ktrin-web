import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  QrCode,
  Download,
  Share2,
  Copy,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react'

const QRGenerator = ({ eventId, eventTitle, invitationCode }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [registrationUrl, setRegistrationUrl] = useState('')

  useEffect(() => {
    if (eventId && invitationCode) {
      generateQRCode()
    }
  }, [eventId, invitationCode])

  const generateQRCode = async () => {
    setLoading(true)
    setError('')

    try {
      // URL de registro de invitados
      const baseUrl = window.location.origin
      const regUrl = `${baseUrl}/guest-registration-v2/${eventId}?code=${invitationCode}`
      setRegistrationUrl(regUrl)

      // Generar QR usando una API pública gratuita
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(regUrl)}&format=png&ecc=M`
      
      // Verificar que la URL del QR funciona
      const response = await fetch(qrApiUrl)
      if (response.ok) {
        setQrCodeUrl(qrApiUrl)
      } else {
        throw new Error('Error al generar el código QR')
      }

    } catch (err) {
      console.error('Error generating QR code:', err)
      setError('Error al generar el código QR. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadQR = () => {
    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `qr-${eventTitle?.replace(/\s+/g, '-').toLowerCase() || 'evento'}-${eventId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareQR = async () => {
    if (navigator.share && registrationUrl) {
      try {
        await navigator.share({
          title: `Invitación a ${eventTitle}`,
          text: `¡Estás invitado a ${eventTitle}! Regístrate escaneando el QR o usando este enlace:`,
          url: registrationUrl
        })
      } catch (err) {
        console.error('Error sharing:', err)
        // Fallback: copiar al portapapeles
        copyToClipboard(registrationUrl)
      }
    } else {
      // Fallback: copiar al portapapeles
      copyToClipboard(registrationUrl)
    }
  }

  const openRegistrationPage = () => {
    if (registrationUrl) {
      window.open(registrationUrl, '_blank')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>Código QR del Evento</span>
        </CardTitle>
        <CardDescription>
          Comparte este QR para que los invitados se registren
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm text-gray-600">Generando código QR...</p>
          </div>
        ) : qrCodeUrl ? (
          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="flex justify-center">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                <img 
                  src={qrCodeUrl} 
                  alt="Código QR del evento"
                  className="w-64 h-64 object-contain"
                  onError={() => setError('Error al cargar el código QR')}
                />
              </div>
            </div>

            {/* Event Info */}
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">{eventTitle}</h3>
              <Badge variant="outline" className="mt-1">
                ID: {eventId}
              </Badge>
            </div>

            {/* Registration URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Enlace de registro:
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 bg-gray-50 border rounded text-xs text-gray-600 break-all">
                  {registrationUrl}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(registrationUrl)}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  ¡Enlace copiado al portapapeles!
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQR}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareQR}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>

            {/* Test Registration Button */}
            <Button
              variant="default"
              size="sm"
              onClick={openRegistrationPage}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Probar Registro
            </Button>

            {/* Instructions */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Los invitados pueden escanear el QR con su cámara</p>
              <p>• También pueden usar el enlace directo</p>
              <p>• Los registros se guardan automáticamente</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No se pudo generar el código QR</p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateQRCode}
              className="mt-2"
            >
              Intentar de nuevo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QRGenerator

