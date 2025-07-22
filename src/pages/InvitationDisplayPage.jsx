import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import EventInvitationDisplay from '../components/invitations/EventInvitationDisplay.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { AlertTriangle } from 'lucide-react';

const InvitationDisplayPage = () => {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invitationCode = searchParams.get('code');

  // Manejar volver atrás
  const handleBack = () => {
    // Si hay historial, volver atrás, sino ir a la página principal
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Verificar que tenemos los parámetros necesarios
  if (!eventId || !invitationCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <p className="font-medium">Enlace de invitación inválido</p>
                <p>
                  El enlace que has seguido no es válido o está incompleto.
                </p>
                <p className="text-sm">
                  Por favor, verifica que hayas copiado el enlace completo o escanea nuevamente el código QR.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <EventInvitationDisplay
      eventId={eventId}
      invitationCode={invitationCode}
      onBack={handleBack}
    />
  );
};

export default InvitationDisplayPage;

