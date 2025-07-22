import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import QRGenerator from '../components/qr/QRGenerator.jsx';
import { useEvents } from '../hooks/useEvents.js';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const QRGeneratorPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const location = useLocation();
  const { getEventDetails, loading, error } = useEvents();
  
  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Cargar evento
  useEffect(() => {
    const loadEvent = async () => {
      // Primero intentar obtener el evento del state de navegación
      if (location.state?.event) {
        setEvent(location.state.event);
        setLoadingEvent(false);
        return;
      }

      // Si no está en el state, cargar desde la API
      if (eventId) {
        try {
          setLoadingEvent(true);
          const result = await getEventDetails(eventId);
          
          if (result.error) {
            console.error('Error al cargar evento:', result.message);
          } else {
            setEvent(result.data);
          }
        } catch (error) {
          console.error('Error al cargar evento:', error);
        } finally {
          setLoadingEvent(false);
        }
      } else {
        setLoadingEvent(false);
      }
    };

    loadEvent();
  }, [eventId, location.state, getEventDetails]);

  // Manejar volver al dashboard
  const handleBack = () => {
    navigate('/dashboard');
  };

  // Mostrar loading
  if (loadingEvent || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pudo cargar el evento
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error || 'No se pudo cargar la información del evento'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <QRGenerator
        event={event}
        onBack={handleBack}
      />
    </div>
  );
};

export default QRGeneratorPage;

