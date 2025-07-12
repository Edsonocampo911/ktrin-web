import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Navigation,
  Building,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'

const LocationSelectorV2 = ({ onLocationSelect }) => {
  const [locationType, setLocationType] = useState('')
  const [manualAddress, setManualAddress] = useState('')
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handleLocationTypeSelect = (type) => {
    setLocationType(type)
    setLocationError('')
    setSelectedLocation(null)
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError('La geolocalización no está soportada en este navegador')
      setIsGettingLocation(false)
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          type: 'current',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: `Ubicación actual (${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)})`,
          accuracy: position.coords.accuracy
        }
        
        setCurrentLocation(location)
        setSelectedLocation(location)
        setIsGettingLocation(false)
        
        if (onLocationSelect) {
          onLocationSelect(location)
        }
      },
      (error) => {
        setIsGettingLocation(false)
        
        let errorMessage = 'Error al obtener la ubicación'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Por favor, permite el acceso a la ubicación en tu navegador.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible. Intenta usar la dirección manual.'
            break
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado. Intenta nuevamente o usa la dirección manual.'
            break
          default:
            errorMessage = 'Error desconocido al obtener la ubicación. Usa la dirección manual como alternativa.'
            break
        }
        
        setLocationError(errorMessage)
      },
      options
    )
  }

  const handleManualAddressSubmit = () => {
    if (!manualAddress.trim()) {
      setLocationError('Por favor ingresa una dirección válida')
      return
    }

    const location = {
      type: 'address',
      address: manualAddress.trim(),
      manual: true
    }

    setSelectedLocation(location)
    setLocationError('')
    
    if (onLocationSelect) {
      onLocationSelect(location)
    }
  }

  const handleVenueSelect = (venue) => {
    const location = {
      type: 'venue',
      venue_id: venue.id,
      name: venue.name,
      address: venue.address,
      capacity: venue.capacity,
      price: venue.price
    }

    setSelectedLocation(location)
    setLocationError('')
    
    if (onLocationSelect) {
      onLocationSelect(location)
    }
  }

  // Venues de ejemplo (en una implementación real, estos vendrían de la base de datos)
  const sampleVenues = [
    {
      id: 1,
      name: 'Salón de Eventos Aurora',
      address: 'Av. Principal 123, Ciudad',
      capacity: 150,
      price: 800
    },
    {
      id: 2,
      name: 'Centro de Convenciones Plaza',
      address: 'Calle Central 456, Ciudad',
      capacity: 300,
      price: 1200
    },
    {
      id: 3,
      name: 'Jardín de Eventos Villa Rosa',
      address: 'Zona Residencial 789, Ciudad',
      capacity: 100,
      price: 600
    }
  ]

  return (
    <div className="space-y-4">
      {/* Selector de tipo de ubicación */}
      <div>
        <Label className="text-base font-medium">Selecciona el tipo de ubicación</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <Card 
            className={`cursor-pointer transition-all ${locationType === 'current' ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:shadow-md'}`}
            onClick={() => handleLocationTypeSelect('current')}
          >
            <CardContent className="p-4 text-center">
              <Navigation className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
              <span className="text-sm font-medium">Ubicación Actual</span>
              <p className="text-xs text-gray-500 mt-1">Usar GPS</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${locationType === 'manual' ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:shadow-md'}`}
            onClick={() => handleLocationTypeSelect('manual')}
          >
            <CardContent className="p-4 text-center">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
              <span className="text-sm font-medium">Dirección Manual</span>
              <p className="text-xs text-gray-500 mt-1">Escribir dirección</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${locationType === 'venue' ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:shadow-md'}`}
            onClick={() => handleLocationTypeSelect('venue')}
          >
            <CardContent className="p-4 text-center">
              <Building className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
              <span className="text-sm font-medium">Local Alquilado</span>
              <p className="text-xs text-gray-500 mt-1">Elegir de lista</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mostrar errores */}
      {locationError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}

      {/* Ubicación actual */}
      {locationType === 'current' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="h-5 w-5" />
              <span>Ubicación Actual</span>
            </CardTitle>
            <CardDescription>
              Usa tu ubicación actual detectada por GPS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Obteniendo ubicación...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Obtener Mi Ubicación
                </>
              )}
            </Button>

            {currentLocation && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Ubicación obtenida</p>
                    <p className="text-xs text-green-600">{currentLocation.address}</p>
                    <p className="text-xs text-green-500">Precisión: ±{Math.round(currentLocation.accuracy)}m</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dirección manual */}
      {locationType === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Dirección Manual</span>
            </CardTitle>
            <CardDescription>
              Ingresa la dirección del evento manualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="manualAddress">Dirección Completa</Label>
              <Input
                id="manualAddress"
                placeholder="Ej: Av. Libertador 1234, Buenos Aires, Argentina"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualAddressSubmit()}
              />
            </div>
            <Button 
              onClick={handleManualAddressSubmit}
              className="w-full"
              disabled={!manualAddress.trim()}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Confirmar Dirección
            </Button>

            {selectedLocation && selectedLocation.type === 'address' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Dirección confirmada</p>
                    <p className="text-xs text-green-600">{selectedLocation.address}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Local alquilado */}
      {locationType === 'venue' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Locales Disponibles</span>
            </CardTitle>
            <CardDescription>
              Selecciona un local de nuestra lista de venues disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sampleVenues.map((venue) => (
                <div
                  key={venue.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedLocation?.venue_id === venue.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleVenueSelect(venue)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{venue.name}</h4>
                      <p className="text-sm text-gray-600">{venue.address}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="secondary">
                          Capacidad: {venue.capacity} personas
                        </Badge>
                        <Badge variant="outline">
                          ${venue.price}/día
                        </Badge>
                      </div>
                    </div>
                    {selectedLocation?.venue_id === venue.id && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de ubicación seleccionada */}
      {selectedLocation && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="font-medium text-blue-800">Ubicación seleccionada</p>
                <p className="text-sm text-blue-600">
                  {selectedLocation.name || selectedLocation.address}
                </p>
                {selectedLocation.type === 'venue' && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {selectedLocation.capacity} personas
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      ${selectedLocation.price}/día
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LocationSelectorV2

