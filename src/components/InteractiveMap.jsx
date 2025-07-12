import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Navigation, Search } from 'lucide-react'

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Componente para manejar clics en el mapa
function LocationMarker({ position, setPosition, onLocationSelect }) {
  const map = useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng]
      setPosition(newPosition)
      
      // Geocodificación inversa simple (en una implementación real, usarías una API)
      const address = `Lat: ${e.latlng.lat.toFixed(6)}, Lng: ${e.latlng.lng.toFixed(6)}`
      
      if (onLocationSelect) {
        onLocationSelect({
          coordinates: newPosition,
          address: address,
          type: 'custom'
        })
      }
    },
  })

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div className="text-center">
          <MapPin className="h-6 w-6 mx-auto mb-2 text-purple-600" />
          <p className="font-medium">Ubicación seleccionada</p>
          <p className="text-sm text-gray-600">
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}

const InteractiveMap = ({ onLocationSelect, initialPosition = null }) => {
  const [position, setPosition] = useState(initialPosition || [19.4326, -99.1332]) // Ciudad de México por defecto
  const [markerPosition, setMarkerPosition] = useState(initialPosition)
  const [searchAddress, setSearchAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const mapRef = useRef()

  // Obtener ubicación actual del usuario
  const getCurrentLocation = () => {
    setIsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const newPosition = [location.coords.latitude, location.coords.longitude]
          setPosition(newPosition)
          setMarkerPosition(newPosition)
          
          if (onLocationSelect) {
            onLocationSelect({
              coordinates: newPosition,
              address: 'Ubicación actual detectada',
              type: 'current'
            })
          }
          
          // Centrar el mapa en la nueva ubicación
          if (mapRef.current) {
            mapRef.current.setView(newPosition, 15)
          }
          setIsLoading(false)
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error)
          alert('No se pudo obtener la ubicación. Por favor, haz clic en el mapa para seleccionar una ubicación.')
          setIsLoading(false)
        }
      )
    } else {
      alert('La geolocalización no está soportada en este navegador.')
      setIsLoading(false)
    }
  }

  // Búsqueda de dirección (simulada - en una implementación real usarías una API de geocodificación)
  const searchLocation = async () => {
    if (!searchAddress.trim()) return
    
    setIsLoading(true)
    
    // Simulación de búsqueda de dirección
    // En una implementación real, usarías una API como Nominatim (OpenStreetMap) o Google Geocoding
    try {
      // Ejemplo de coordenadas para algunas ciudades comunes
      const commonLocations = {
        'ciudad de mexico': [19.4326, -99.1332],
        'guadalajara': [20.6597, -103.3496],
        'monterrey': [25.6866, -100.3161],
        'puebla': [19.0414, -98.2063],
        'tijuana': [32.5149, -117.0382],
        'leon': [21.1619, -101.6921],
        'juarez': [31.6904, -106.4245],
        'torreon': [25.5428, -103.4068],
        'queretaro': [20.5888, -100.3899],
        'merida': [20.9674, -89.5926]
      }
      
      const searchKey = searchAddress.toLowerCase().trim()
      const foundLocation = commonLocations[searchKey]
      
      if (foundLocation) {
        setPosition(foundLocation)
        setMarkerPosition(foundLocation)
        
        if (onLocationSelect) {
          onLocationSelect({
            coordinates: foundLocation,
            address: searchAddress,
            type: 'search'
          })
        }
        
        // Centrar el mapa en la nueva ubicación
        if (mapRef.current) {
          mapRef.current.setView(foundLocation, 13)
        }
      } else {
        alert('Ubicación no encontrada. Por favor, haz clic en el mapa para seleccionar una ubicación.')
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      alert('Error al buscar la ubicación. Por favor, intenta de nuevo.')
    }
    
    setIsLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchLocation()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Seleccionar Ubicación en el Mapa
        </CardTitle>
        <CardDescription>
          Haz clic en el mapa para seleccionar la ubicación exacta de tu evento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles de búsqueda */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="search">Buscar dirección</Label>
            <Input
              id="search"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ej: Ciudad de México, Guadalajara..."
              className="mt-1"
            />
          </div>
          <div className="flex flex-col justify-end gap-2">
            <Button 
              onClick={searchLocation}
              disabled={isLoading}
              variant="outline"
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={getCurrentLocation}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            <Navigation className="h-4 w-4 mr-2" />
            {isLoading ? 'Obteniendo ubicación...' : 'Usar Mi Ubicación'}
          </Button>
        </div>

        {/* Mapa interactivo */}
        <div className="h-96 w-full rounded-lg overflow-hidden border">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker 
              position={markerPosition} 
              setPosition={setMarkerPosition}
              onLocationSelect={onLocationSelect}
            />
          </MapContainer>
        </div>

        {/* Información de la ubicación seleccionada */}
        {markerPosition && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-green-800">Ubicación Seleccionada</h4>
                <p className="text-sm text-green-600">
                  Coordenadas: {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Puedes mover el marcador haciendo clic en otra parte del mapa
                </p>
              </div>
              <Button 
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  if (onLocationSelect) {
                    onLocationSelect({
                      coordinates: markerPosition,
                      address: `Ubicación personalizada: ${markerPosition[0].toFixed(6)}, ${markerPosition[1].toFixed(6)}`,
                      type: 'custom'
                    })
                  }
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <h5 className="font-medium text-blue-800 mb-1">Instrucciones:</h5>
          <ul className="space-y-1 text-blue-700">
            <li>• Haz clic en cualquier parte del mapa para colocar un marcador</li>
            <li>• Usa el botón "Usar Mi Ubicación" para detectar tu ubicación actual</li>
            <li>• Busca una ciudad específica en el campo de búsqueda</li>
            <li>• Puedes hacer zoom y mover el mapa libremente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default InteractiveMap

