import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { 
  QrCode, 
  Download, 
  Copy, 
  Share2, 
  Eye, 
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import QRCodeReact from 'react-qr-code';
import QRCodeLib from 'qrcode';

const QRGenerator = ({ event, onBack }) => {
  const [qrData, setQrData] = useState('');
  const [qrSize, setQrSize] = useState(256);
  const [copied, setCopied] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('png');
  const canvasRef = useRef(null);

  // Generar URL de registro para el evento
  useEffect(() => {
    if (event) {
      // En producción, esta sería la URL real de tu aplicación
      const baseUrl = window.location.origin;
      const registrationUrl = `${baseUrl}/register/${event.event_id}?code=${event.invitation_code || 'KTRIN2024'}`;
      setQrData(registrationUrl);
    }
  }, [event]);

  // Copiar URL al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  // Descargar QR como imagen
  const downloadQR = async (format = 'png') => {
    try {
      const canvas = document.createElement('canvas');
      const options = {
        width: qrSize,
        height: qrSize,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };

      await QRCodeLib.toCanvas(canvas, qrData, options);

      // Crear enlace de descarga
      const link = document.createElement('a');
      link.download = `qr-${event.title.replace(/\s+/g, '-').toLowerCase()}.${format}`;
      
      if (format === 'png') {
        link.href = canvas.toDataURL('image/png');
      } else if (format === 'svg') {
        const svgString = await QRCodeLib.toString(qrData, { type: 'svg', ...options });
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        link.href = URL.createObjectURL(blob);
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar QR:', error);
    }
  };

  // Compartir QR (si el navegador lo soporta)
  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Registro para ${event.title}`,
          text: `¡Estás invitado a ${event.title}! Escanea el código QR para registrarte.`,
          url: qrData
        });
      } catch (error) {
        console.error('Error al compartir:', error);
      }
    } else {
      // Fallback: copiar al portapapeles
      copyToClipboard();
    }
  };

  // Formatear fecha del evento
  const formatEventDate = (dateString, timeString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const [hours, minutes] = timeString.split(':');
    const formattedTime = `${hours}:${minutes}`;
    
    return `${formattedDate} a las ${formattedTime}`;
  };

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            No se pudo cargar la información del evento.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Código QR del Evento</h1>
          <p className="text-gray-600">{event.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo: Información del evento */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Información del Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Título</Label>
                <p className="text-lg font-semibold">{event.title}</p>
              </div>
              
              {event.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Descripción</Label>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Fecha y Hora</Label>
                <p className="text-gray-600">{formatEventDate(event.event_date, event.event_time)}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Invitados Esperados</Label>
                <p className="text-gray-600">{event.guest_count} personas</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">URL de Registro</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={qrData}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 mt-1">¡URL copiada al portapapeles!</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instrucciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Instrucciones para Invitados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                  <p>Abre la cámara de tu teléfono o una aplicación de escaneo QR</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                  <p>Apunta la cámara hacia el código QR</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                  <p>Toca la notificación que aparece para abrir el enlace</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                  <p>Completa el formulario de registro para confirmar tu asistencia</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho: Código QR y opciones */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Código QR</CardTitle>
              <CardDescription>
                Comparte este código para que los invitados se registren
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg shadow-sm border">
                  <QRCodeReact
                    value={qrData}
                    size={qrSize}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              </div>

              {/* Tamaño del QR */}
              <div className="space-y-2">
                <Label htmlFor="qr-size">Tamaño del QR</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="qr-size"
                    type="range"
                    min="128"
                    max="512"
                    step="32"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-16">{qrSize}px</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => downloadQR('png')}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PNG
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => downloadQR('svg')}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar SVG
                </Button>
                
                <Button
                  variant="outline"
                  onClick={shareQR}
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.open(qrData, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Probar Enlace
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vista previa del registro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista Previa
              </CardTitle>
              <CardDescription>
                Así verán los invitados el formulario de registro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {formatEventDate(event.event_date, event.event_time)}
                  </p>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs text-gray-500 mb-2">Formulario de registro</p>
                    <div className="space-y-2">
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-6 bg-blue-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;

