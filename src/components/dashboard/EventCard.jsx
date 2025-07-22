import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2,
  QrCode,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { CONSTANTS } from '../../config.js';

const EventCard = ({ 
  event, 
  onView, 
  onEdit, 
  onDelete, 
  onGenerateQR,
  className = "" 
}) => {
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

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0);
  };

  // Obtener color del badge según el estado
  const getStatusBadge = (status) => {
    const statusConfig = {
      [CONSTANTS.EVENT_STATUS.DRAFT]: {
        variant: 'secondary',
        label: 'Borrador',
        icon: AlertCircle
      },
      [CONSTANTS.EVENT_STATUS.CONFIRMED]: {
        variant: 'default',
        label: 'Confirmado',
        icon: CheckCircle
      },
      [CONSTANTS.EVENT_STATUS.IN_PROGRESS]: {
        variant: 'default',
        label: 'En Progreso',
        icon: Clock
      },
      [CONSTANTS.EVENT_STATUS.COMPLETED]: {
        variant: 'default',
        label: 'Completado',
        icon: CheckCircle
      },
      [CONSTANTS.EVENT_STATUS.CANCELLED]: {
        variant: 'destructive',
        label: 'Cancelado',
        icon: XCircle
      }
    };

    const config = statusConfig[status] || statusConfig[CONSTANTS.EVENT_STATUS.DRAFT];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Determinar si el evento es próximo o pasado
  const isUpcoming = () => {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  };

  // Obtener ubicación formateada
  const getLocationDisplay = () => {
    if (!event.location_data) return 'Ubicación no especificada';
    
    try {
      const locationData = typeof event.location_data === 'string' 
        ? JSON.parse(event.location_data) 
        : event.location_data;

      switch (event.location_type) {
        case CONSTANTS.LOCATION_TYPE.ADDRESS:
          return locationData.address || 'Dirección no especificada';
        case CONSTANTS.LOCATION_TYPE.VENUE:
          return locationData.venue_name || 'Venue no especificado';
        case CONSTANTS.LOCATION_TYPE.VIRTUAL:
          return `Virtual - ${locationData.platform || 'Plataforma no especificada'}`;
        case CONSTANTS.LOCATION_TYPE.COORDINATES:
          return locationData.address || `${locationData.lat}, ${locationData.lng}`;
        default:
          return 'Ubicación no especificada';
      }
    } catch (error) {
      return 'Ubicación no especificada';
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {event.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(event.status)}
              {!isUpcoming() && (
                <Badge variant="outline" className="text-xs">
                  Pasado
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView?.(event)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(event)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGenerateQR?.(event)}
              className="h-8 w-8 p-0"
            >
              <QrCode className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(event)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descripción */}
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {/* Fecha y hora */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(event.event_date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatTime(event.event_time)}</span>
          </div>

          {/* Ubicación */}
          <div className="flex items-center gap-2 md:col-span-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="line-clamp-1">{getLocationDisplay()}</span>
          </div>

          {/* Invitados */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {event.registered_guests || 0} / {event.guest_count} invitados
            </span>
          </div>

          {/* Presupuesto */}
          {(event.budget_estimate || event.total_cost) && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>
                {event.total_cost 
                  ? formatCurrency(event.total_cost)
                  : formatCurrency(event.budget_estimate)
                }
              </span>
            </div>
          )}
        </div>

        {/* Servicios */}
        {event.total_services > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {event.total_services} servicio{event.total_services !== 1 ? 's' : ''} contratado{event.total_services !== 1 ? 's' : ''}
              </span>
              {event.confirmed_guests > 0 && (
                <span className="text-green-600 font-medium">
                  {event.confirmed_guests} confirmado{event.confirmed_guests !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Acciones principales */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(event)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalles
          </Button>
          
          {event.status === CONSTANTS.EVENT_STATUS.CONFIRMED && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onGenerateQR?.(event)}
              className="flex-1"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;

