import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { 
  MapPin, 
  Navigation, 
  Building, 
  Monitor, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { CONSTANTS } from '../../config.js';

const LocationInput = ({ locationType, locationData, onChange, error }) => {
  const [currentType, setCurrentType] = useState(locationType || CONSTANTS.LOCATION_TYPE.ADDRESS);
  const [formData, setFormData] = useState(locationData || {});
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [geoSuccess, setGeoSuccess] = useState(false);

  // Actualizar datos cuando cambian las props
  useEffect(() => {
    setCurrentType(locationType || CONSTANTS.LOCATION_TYPE.ADDRESS);
    setFormData(locationData || {});
  }, [locationType, locationData]);

  // Manejar cambio de tipo de ubicación
  const handleTypeChange = (newType) => {
    setCurrentType(newType);
    setFormData({});
    setGeoError(null);
    setGeoSuccess(false);
    onChange?.(newType, {});
  };

  // Manejar cambio en los campos del formulario
  const handleFieldChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(currentType, newData);
  };

  // Obtener ubicación actual usando GPS
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('La geolocalización no está soportada en este navegador');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);
    setGeoSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Intentar obtener la dirección usando reverse geocoding
          // En un entorno real, usarías una API como Google Maps o OpenStreetMap
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          const newData = {
            lat: latitude,
            lng: longitude,
            address: address
          };
          
          setFormData(newData);
          onChange?.(CONSTANTS.LOCATION_TYPE.COORDINATES, newData);
          setGeoSuccess(true);
        } catch (error) {
          console.error('Error al obtener la dirección:', error);
          const newData = {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          };
          
          setFormData(newData);
          onChange?.(CONSTANTS.LOCATION_TYPE.COORDINATES, newData);
          setGeoSuccess(true);
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Permiso de ubicación denegado. Por favor, permite el acceso a la ubicación.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('La información de ubicación no está disponible.');
            break;
          case error.TIMEOUT:
            setGeoError('La solicitud de ubicación ha expirado.');
            break;
          default:
            setGeoError('Error desconocido al obtener la ubicación.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Renderizar campos según el tipo de ubicación
  const renderLocationFields = () => {
    switch (currentType) {
      case CONSTANTS.LOCATION_TYPE.ADDRESS:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
                value={formData.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  placeholder="Buenos Aires"
                  value={formData.city || ''}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Provincia/Estado</Label>
                <Input
                  id="state"
                  placeholder="CABA"
                  value={formData.state || ''}
                  onChange={(e) => handleFieldChange('state', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zip">Código Postal</Label>
                <Input
                  id="zip"
                  placeholder="1000"
                  value={formData.zip || ''}
                  onChange={(e) => handleFieldChange('zip', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case CONSTANTS.LOCATION_TYPE.COORDINATES:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={geoLoading}
                className="flex items-center gap-2"
              >
                {geoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {geoLoading ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
              </Button>
              
              {geoSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Ubicación obtenida</span>
                </div>
              )}
            </div>

            {geoError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {geoError}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitud *</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  placeholder="-34.6037"
                  value={formData.lat || ''}
                  onChange={(e) => handleFieldChange('lat', parseFloat(e.target.value) || '')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lng">Longitud *</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  placeholder="-58.3816"
                  value={formData.lng || ''}
                  onChange={(e) => handleFieldChange('lng', parseFloat(e.target.value) || '')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coord-address">Descripción de la ubicación</Label>
              <Input
                id="coord-address"
                placeholder="Ej: Frente al Obelisco, Centro de Buenos Aires"
                value={formData.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
              />
            </div>
          </div>
        );

      case CONSTANTS.LOCATION_TYPE.VENUE:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venue_name">Nombre del Venue *</Label>
              <Input
                id="venue_name"
                placeholder="Ej: Salón de Eventos Luna Park"
                value={formData.venue_name || ''}
                onChange={(e) => handleFieldChange('venue_name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="venue_address">Dirección del Venue *</Label>
              <Input
                id="venue_address"
                placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
                value={formData.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad (opcional)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                placeholder="Ej: 200"
                value={formData.capacity || ''}
                onChange={(e) => handleFieldChange('capacity', parseInt(e.target.value) || '')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="venue_notes">Notas adicionales</Label>
              <Textarea
                id="venue_notes"
                placeholder="Información adicional sobre el venue"
                value={formData.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case CONSTANTS.LOCATION_TYPE.VIRTUAL:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Plataforma *</Label>
              <Select 
                value={formData.platform || ''} 
                onValueChange={(value) => handleFieldChange('platform', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="meet">Google Meet</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="webex">Cisco Webex</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="skype">Skype</SelectItem>
                  <SelectItem value="other">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meeting_url">URL de la reunión *</Label>
              <Input
                id="meeting_url"
                type="url"
                placeholder="https://zoom.us/j/123456789"
                value={formData.meeting_url || ''}
                onChange={(e) => handleFieldChange('meeting_url', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meeting_id">ID de la reunión</Label>
              <Input
                id="meeting_id"
                placeholder="123-456-789"
                value={formData.meeting_id || ''}
                onChange={(e) => handleFieldChange('meeting_id', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meeting_password">Contraseña (si aplica)</Label>
              <Input
                id="meeting_password"
                placeholder="Contraseña de acceso"
                value={formData.meeting_password || ''}
                onChange={(e) => handleFieldChange('meeting_password', e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const locationTypes = [
    {
      value: CONSTANTS.LOCATION_TYPE.ADDRESS,
      label: 'Dirección física',
      icon: MapPin,
      description: 'Dirección específica con calle y número'
    },
    {
      value: CONSTANTS.LOCATION_TYPE.COORDINATES,
      label: 'Coordenadas GPS',
      icon: Navigation,
      description: 'Ubicación exacta usando latitud y longitud'
    },
    {
      value: CONSTANTS.LOCATION_TYPE.VENUE,
      label: 'Venue/Salón',
      icon: Building,
      description: 'Lugar específico como salón de eventos'
    },
    {
      value: CONSTANTS.LOCATION_TYPE.VIRTUAL,
      label: 'Evento virtual',
      icon: Monitor,
      description: 'Reunión online por videollamada'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Ubicación del Evento
        </CardTitle>
        <CardDescription>
          Especifica dónde se realizará tu evento
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Selector de tipo de ubicación */}
        <div className="space-y-3">
          <Label>Tipo de ubicación *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {locationTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = currentType === type.value;
              
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {type.label}
                      </div>
                      <div className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {type.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campos específicos del tipo de ubicación */}
        {renderLocationFields()}

        {/* Mostrar error si existe */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationInput;

