import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { MapPin, Navigation, Search, DollarSign, Users, Star, Wifi, Car, Utensils } from 'lucide-react'
import InteractiveMap from './InteractiveMap'

const LocationSelector = ({ onLocationSelect = null }) => {
  const [locationType, setLocationType] = useState('own') // 'own' or 'rental'
  const [currentLocation, setCurrentLocation] = useState(null)
  const [manualAddress, setManualAddress] = useState('')
  const [searchRadius, setSearchRadius] = useState([10])
  const [budgetRange, setBudgetRange] = useState([1000, 5000])
  const [venues, setVenues] = useState([])
  const [filteredVenues, setFilteredVenues] = useState([])
  const [selectedVenue, setSelectedVenue] = useState(null)

  // Datos de ejemplo de locales disponibles
  const sampleVenues = [
    {
      id: 1,
      name: 'Salón Elegante Centro',
      address: 'Av. Principal 123, Centro',
      capacity: 150,
      pricePerHour: 200,
      pricePerEvent: 1500,
      rating: 4.8,
      distance: 2.5,
      amenities: ['wifi', 'parking', 'catering', 'sound', 'lighting'],
      images: ['/api/placeholder/400/300'],
      description: 'Elegante salón en el centro de la ciudad con todas las comodidades',
      available: true
    },
    {
      id: 2,
      name: 'Jardín Las Flores',
      address: 'Calle Jardines 456, Norte',
      capacity: 200,
      pricePerHour: 150,
      pricePerEvent: 1200,
      rating: 4.6,
      distance: 5.8,
      amenities: ['parking', 'catering', 'garden', 'sound'],
      images: ['/api/placeholder/400/300'],
      description: 'Hermoso jardín al aire libre perfecto para celebraciones',
      available: true
    },
    {
      id: 3,
      name: 'Centro de Convenciones Plaza',
      address: 'Boulevard Plaza 789, Sur',
      capacity: 300,
      pricePerHour: 300,
      pricePerEvent: 2500,
      rating: 4.9,
      distance: 8.2,
      amenities: ['wifi', 'parking', 'catering', 'sound', 'lighting', 'security'],
      images: ['/api/placeholder/400/300'],
      description: 'Moderno centro de convenciones con tecnología de punta',
      available: true
    },
    {
      id: 4,
      name: 'Hacienda San Miguel',
      address: 'Carretera Rural Km 15, Afueras',
      capacity: 120,
      pricePerHour: 180,
      pricePerEvent: 1800,
      rating: 4.7,
      distance: 15.3,
      amenities: ['parking', 'catering', 'garden', 'pool'],
      images: ['/api/placeholder/400/300'],
      description: 'Hacienda tradicional con amplios jardines y alberca',
      available: true
    },
    {
      id: 5,
      name: 'Terraza Vista Ciudad',
      address: 'Torre Ejecutiva Piso 20, Centro',
      capacity: 80,
      pricePerHour: 250,
      pricePerEvent: 2000,
      rating: 4.5,
      distance: 3.1,
      amenities: ['wifi', 'parking', 'catering', 'view'],
      images: ['/api/placeholder/400/300'],
      description: 'Terraza con vista panorámica de la ciudad',
      available: true
    }
  ]

  useEffect(() => {
    setVenues(sampleVenues)
    setFilteredVenues(sampleVenues)
  }, [])

  // Obtener ubicación actual del usuario
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          // Aquí podrías hacer una llamada a una API de geocodificación inversa
          // para obtener la dirección legible
          setManualAddress('Ubicación actual detectada')
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error)
          alert('No se pudo obtener la ubicación. Por favor, ingresa la dirección manualmente.')
        }
      )
    } else {
      alert('La geolocalización no está soportada en este navegador.')
    }
  }

  // Filtrar locales basado en criterios
  const filterVenues = () => {
    let filtered = venues

    // Filtrar por radio de búsqueda
    filtered = filtered.filter(venue => venue.distance <= searchRadius[0])

    // Filtrar por presupuesto
    filtered = filtered.filter(venue => 
      venue.pricePerEvent >= budgetRange[0] && venue.pricePerEvent <= budgetRange[1]
    )

    setFilteredVenues(filtered)
  }

  useEffect(() => {
    filterVenues()
  }, [searchRadius, budgetRange, venues])

  const getAmenityIcon = (amenity) => {
    const icons = {
      wifi: <Wifi className="h-4 w-4" />,
      parking: <Car className="h-4 w-4" />,
      catering: <Utensils className="h-4 w-4" />,
      sound: '🎵',
      lighting: '💡',
      garden: '🌳',
      pool: '🏊',
      security: '🛡️',
      view: '🏙️'
    }
    return icons[amenity] || '✓'
  }

  const getAmenityLabel = (amenity) => {
    const labels = {
      wifi: 'WiFi',
      parking: 'Estacionamiento',
      catering: 'Catering',
      sound: 'Sonido',
      lighting: 'Iluminación',
      garden: 'Jardín',
      pool: 'Alberca',
      security: 'Seguridad',
      view: 'Vista'
    }
    return labels[amenity] || amenity
  }

  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue)
    if (onLocationSelect) {
      onLocationSelect({
        type: 'rental',
        venue: venue,
        address: venue.address
      })
    }
  }

  const handleOwnLocationConfirm = () => {
    if (onLocationSelect) {
      onLocationSelect({
        type: 'own',
        address: manualAddress,
        coordinates: currentLocation
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ubicación del Evento</CardTitle>
          <CardDescription>
            Selecciona dónde se realizará tu evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de tipo de ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-colors ${
                locationType === 'own' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setLocationType('own')}
            >
              <CardContent className="p-4 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Mi Ubicación</h3>
                <p className="text-sm text-gray-600">Casa, oficina o lugar propio</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${
                locationType === 'rental' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setLocationType('rental')}
            >
              <CardContent className="p-4 text-center">
                <Search className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Alquilar Local</h3>
                <p className="text-sm text-gray-600">Buscar locales disponibles</p>
              </CardContent>
            </Card>
          </div>

          {/* Configuración para ubicación propia */}
          {locationType === 'own' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Dirección del Evento</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="address"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Ingresa la dirección completa..."
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={getCurrentLocation}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Usar Ubicación Actual
                  </Button>
                </div>
              </div>

              {/* Mapa interactivo */}
              <InteractiveMap 
                onLocationSelect={(locationData) => {
                  setCurrentLocation(locationData.coordinates)
                  setManualAddress(locationData.address)
                }}
                initialPosition={currentLocation}
              />

              {manualAddress && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-800">Ubicación Confirmada</h4>
                      <p className="text-sm text-green-600">{manualAddress}</p>
                    </div>
                    <Button 
                      onClick={handleOwnLocationConfirm}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Confirmar Ubicación
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Configuración para alquiler de local */}
          {locationType === 'rental' && (
            <div className="space-y-6">
              {/* Filtros de búsqueda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Radio de Búsqueda: {searchRadius[0]} km</Label>
                  <Slider
                    value={searchRadius}
                    onValueChange={setSearchRadius}
                    max={50}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Presupuesto: ${budgetRange[0]} - ${budgetRange[1]}</Label>
                  <Slider
                    value={budgetRange}
                    onValueChange={setBudgetRange}
                    max={10000}
                    min={500}
                    step={100}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Lista de locales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Locales Disponibles ({filteredVenues.length})
                </h3>
                
                {filteredVenues.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900">No se encontraron locales</h4>
                    <p className="text-gray-600">
                      Intenta ajustar el radio de búsqueda o el presupuesto
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredVenues.map(venue => (
                      <Card 
                        key={venue.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedVenue?.id === venue.id ? 'ring-2 ring-purple-500' : ''
                        }`}
                        onClick={() => handleVenueSelect(venue)}
                      >
                        <CardContent className="p-0">
                          {/* Imagen del local */}
                          <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <MapPin className="h-12 w-12 text-purple-400" />
                          </div>
                          
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-lg">{venue.name}</h4>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600 ml-1">{venue.rating}</span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3">{venue.description}</p>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-purple-600">
                                  ${venue.pricePerEvent.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500">por evento</span>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  Hasta {venue.capacity} personas
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {venue.distance} km
                                </div>
                              </div>
                              
                              <div className="pt-2">
                                <p className="text-xs text-gray-500 mb-2">Servicios incluidos:</p>
                                <div className="flex flex-wrap gap-1">
                                  {venue.amenities.slice(0, 4).map(amenity => (
                                    <Badge key={amenity} variant="secondary" className="text-xs">
                                      {getAmenityIcon(amenity)} {getAmenityLabel(amenity)}
                                    </Badge>
                                  ))}
                                  {venue.amenities.length > 4 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{venue.amenities.length - 4} más
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmación de selección */}
      {selectedVenue && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800">Local Seleccionado</h4>
                <p className="text-sm text-green-600">
                  {selectedVenue.name} - ${selectedVenue.pricePerEvent.toLocaleString()}
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                Confirmar Local
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LocationSelector

