import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

const InvitationPage = () => {
  const { invitationCode } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [event, setEvent] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [dietaryConditions, setDietaryConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const availableDietaryConditions = [
    'Vegano',
    'Vegetariano',
    'Celíaco (sin gluten)',
    'Alérgico a lácteos',
    'Alérgico a frutos secos',
    'Alérgico a mariscos',
    'Diabético',
    'Otros (especificar)'
  ];

  useEffect(() => {
    const fetchInvitationAndEvent = async () => {
      try {
        // Fetch invitation details
        const { data: invitationData, error: invitationError } = await supabase
          .from('event_invitations')
          .select('*')
          .eq('invitation_code', invitationCode)
          .single();

        if (invitationError) {
          throw invitationError;
        }

        if (!invitationData) {
          setError('Invitación no encontrada o inválida.');
          setLoading(false);
          return;
        }

        setInvitation(invitationData);

        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('event_id', invitationData.event_id)
          .single();

        if (eventError) {
          throw eventError;
        }

        if (!eventData) {
          setError('Evento asociado no encontrado.');
          setLoading(false);
          return;
        }

        setEvent(eventData);

        // If guest already registered, pre-fill data
        if (invitationData.guest_name) {
          setGuestName(invitationData.guest_name);
          setDietaryConditions(invitationData.dietary_conditions || []);
          setSuccess(true);
        }

      } catch (err) {
        console.error('Error fetching invitation or event:', err);
        setError(err.message || 'Error al cargar la invitación.');
      } finally {
        setLoading(false);
      }
    };

    if (invitationCode) {
      fetchInvitationAndEvent();
    }
  }, [invitationCode]);

  const handleDietaryConditionToggle = (condition) => {
    setDietaryConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!guestName.trim()) {
      setError('Por favor, ingresa tu nombre.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('event_invitations')
        .update({
          guest_name: guestName.trim(),
          dietary_conditions: dietaryConditions,
          status: 'confirmed' // Update status to confirmed
        })
        .eq('invitation_code', invitationCode)
        .select();

      if (updateError) {
        throw updateError;
      }

      setInvitation(data[0]); // Update local invitation state
      setSuccess(true);
    } catch (err) {
      console.error('Error al confirmar asistencia:', err);
      setError(err.message || 'Error al confirmar asistencia. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando invitación...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!invitation || !event) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertDescription>Invitación no válida.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">¡Estás invitado a:</CardTitle>
          <CardDescription className="text-center text-indigo-600 text-xl font-bold">{event.title}</CardDescription>
          <CardDescription className="text-center mt-2">
            Fecha: {event.event_date} | Hora: {event.event_time}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-4">
              <AlertDescription>¡Tu asistencia ha sido confirmada con éxito!</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="guestName">Tu Nombre Completo *</Label>
              <Input
                id="guestName"
                name="guestName"
                placeholder="Ej: Juan Pérez"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                disabled={success}
              />
            </div>

            <div>
              <Label>Condiciones Alimenticias (opcional)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {availableDietaryConditions.map(condition => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={dietaryConditions.includes(condition)}
                      onCheckedChange={() => handleDietaryConditionToggle(condition)}
                      disabled={success}
                    />
                    <Label htmlFor={condition}>{condition}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || success}>
              {loading ? 'Confirmando...' : success ? 'Asistencia Confirmada' : 'Confirmar Asistencia'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationPage;


