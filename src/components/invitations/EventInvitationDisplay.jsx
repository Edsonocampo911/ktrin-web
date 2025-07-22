import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mail, 
  Phone,
  Heart,
  Gift,
  Utensils,
  Music,
  Camera,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const EventInvitationDisplay = ({ eventId, invitationCode, onBack }) => {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simular carga de datos del evento (en producción vendría de la API)
  useEffect(() => {
    const loadEventData = async () => {
      try {
        setLoading(true);
        
        // Simular datos del evento
        const mockEventData = {
          event_id: eventId,
          title: "Cumpleaños de María",
          description: "¡Celebremos juntos los 30 años de María! Una noche llena de música, baile y diversión.",
          event_type: "Cumpleaños",
          event_date: "2024-08-15",
          event_time: "20:00",
          end_time: "02:00",
          location_type: "venue",
          location_data: {
            venue_name: "Salón de Eventos Luna Park",
            address: "Av. Corrientes 1234, Buenos Aires",
            capacity: 200
          },
          guest_count: 50,
          allow_plus_one: true,
          rsvp_deadline: "2024-08-10",
          organizer: {
            full_name: "María González",
            email: "maria@email.com",
            phone: "+54 11 1234-5678"
          },
          dress_code: "Elegante casual",
          special_requests: "Por favor, confirma tu asistencia antes del 10 de agosto. ¡No olvides traer tu mejor sonrisa!",
          dietary_notes: "Habrá opciones vegetarianas y sin gluten disponibles.",
          services: [
            { name: "DJ y Música", category: "Entretenimiento" },
            { name: "Catering Completo", category: "Comida y Bebida" },
            { name: "Fotografía", category: "Fotografía" },
            { name: "Decoración", category: "Decoración" }
          ]
        };

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setEventData(mockEventData);
      } catch (error) {
        setError('Error al cargar la información del evento');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear hora
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Obtener icono según el tipo de evento
  const getEventIcon = (eventType) => {
    const icons = {
      'Cumpleaños': Gift,
      'Boda': Heart,
      'Aniversario': Heart,
      'Graduación': Gift,
      'Baby Shower': Gift,
      'Despedida de Soltero/a': Users,
      'Reunión Familiar': Users,
      'Evento Corporativo': Users,
      'Conferencia': Users,
      'Lanzamiento de Producto': Gift,
      'Networking': Users
    };
    
    return icons[eventType] || Calendar;
  };

  // Obtener icono según la categoría de servicio
  const getServiceIcon = (category) => {
    const icons = {
      'Comida y Bebida': Utensils,
      'Entretenimiento': Music,
      'Fotografía': Camera,
      'Decoración': Gift,
      'Transporte': Users,
      'Seguridad': Users,
      'Limpieza': Users
    };
    
    return icons[category] || Gift;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando invitación...</p>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {error || 'No se pudo cargar la invitación'}
              </AlertDescription>
            </Alert>
            {onBack && (
              <Button variant="outline" onClick={onBack} className="w-full mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const EventIcon = getEventIcon(eventData.event_type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header con botón de volver */}
      {onBack && (
        <div className="p-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 pb-8">
        {/* Header de la invitación */}
        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mb-4">
              <EventIcon className="h-16 w-16 mx-auto mb-4 opacity-90" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              ¡Estás Invitado!
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              {eventData.title}
            </h2>
            <Badge variant="secondary" className="text-blue-600 bg-white">
              {eventData.event_type}
            </Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información principal del evento */}
          <div className="space-y-6">
            {/* Descripción */}
            {eventData.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sobre el Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {eventData.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Fecha y hora */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Fecha y Hora
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{formatDate(eventData.event_date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    {formatTime(eventData.event_time)}
                    {eventData.end_time && ` - ${formatTime(eventData.end_time)}`}
                  </span>
                </div>
                {eventData.rsvp_deadline && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Confirma tu asistencia antes del {formatDate(eventData.rsvp_deadline)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ubicación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventData.location_type === 'venue' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">
                      {eventData.location_data.venue_name}
                    </p>
                    <p className="text-gray-600">
                      {eventData.location_data.address}
                    </p>
                    {eventData.location_data.capacity && (
                      <p className="text-sm text-gray-500">
                        Capacidad: {eventData.location_data.capacity} personas
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información adicional */}
            {(eventData.dress_code || eventData.special_requests || eventData.dietary_notes) && (
              <Card>
                <CardHeader>
                  <CardTitle>Información Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {eventData.dress_code && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Código de Vestimenta</h4>
                      <p className="text-gray-600">{eventData.dress_code}</p>
                    </div>
                  )}
                  
                  {eventData.special_requests && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Solicitudes Especiales</h4>
                      <p className="text-gray-600">{eventData.special_requests}</p>
                    </div>
                  )}
                  
                  {eventData.dietary_notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Información Alimentaria</h4>
                      <p className="text-gray-600">{eventData.dietary_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Información del organizador */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Organizador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-lg">{eventData.organizer.full_name}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{eventData.organizer.email}</span>
                </div>
                {eventData.organizer.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{eventData.organizer.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalles del evento */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Invitados esperados</span>
                  <span className="font-medium">{eventData.guest_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Acompañantes</span>
                  <span className="font-medium">
                    {eventData.allow_plus_one ? 'Permitidos' : 'No permitidos'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Servicios incluidos */}
            {eventData.services && eventData.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Servicios Incluidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eventData.services.map((service, index) => {
                      const ServiceIcon = getServiceIcon(service.category);
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <ServiceIcon className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-700">{service.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botón de registro */}
            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <h3 className="text-xl font-bold mb-2">¡Confirma tu Asistencia!</h3>
                <p className="text-green-100 mb-4 text-sm">
                  Completa el formulario de registro para confirmar que asistirás
                </p>
                <Button 
                  size="lg" 
                  className="w-full bg-white text-green-600 hover:bg-green-50"
                  onClick={() => {
                    // En producción, esto navegaría al formulario de registro
                    alert('Redirigiendo al formulario de registro...');
                  }}
                >
                  Registrarse Ahora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventInvitationDisplay;

