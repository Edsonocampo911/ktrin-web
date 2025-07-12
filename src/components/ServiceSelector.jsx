import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Utensils, 
  Flower, 
  Music, 
  Camera, 
  Users, 
  DollarSign,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const ServiceSelector = ({ onServiceSelect, onNext }) => {
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  const serviceCategories = [
    {
      id: 'catering',
      category: 'Catering y Comida',
      icon: <Utensils className="h-8 w-8" />,
      description: 'Servicios de comida y bebida para tu evento',
      requiresGuests: true,
      services: [
        { id: 'catering-premium', service_id: 1, name: 'Catering Premium', price: 45, unit: 'por persona' },
        { id: 'catering-basico', service_id: 2, name: 'Catering Básico', price: 25, unit: 'por persona' },
        { id: 'bar-abierto', service_id: 3, name: 'Bar Abierto', price: 20, unit: 'por persona' },
        { id: 'pasteleria', service_id: 4, name: 'Pastelería Especializada', price: 150, unit: 'por evento' }
      ]
    },
    {
      id: 'decoracion',
      category: 'Decoración y Flores',
      icon: <Flower className="h-8 w-8" />,
      description: 'Decoración, flores e iluminación para ambientar tu evento',
      requiresGuests: false,
      services: [
        { id: 'decoracion-tematica', service_id: 5, name: 'Decoración Temática', price: 800, unit: 'por evento' },
        { id: 'arreglos-florales', service_id: 6, name: 'Arreglos Florales', price: 300, unit: 'por evento' },
        { id: 'iluminacion', service_id: 7, name: 'Iluminación Especial', price: 500, unit: 'por evento' }
      ]
    },
    {
      id: 'entretenimiento',
      category: 'Música y Entretenimiento',
      icon: <Music className="h-8 w-8" />,
      description: 'DJ, bandas y animación para hacer tu evento inolvidable',
      requiresGuests: false,
      services: [
        { id: 'dj-profesional', service_id: 8, name: 'DJ Profesional', price: 600, unit: 'por evento' },
        { id: 'banda-en-vivo', service_id: 9, name: 'Banda en Vivo', price: 1200, unit: 'por evento' },
        { id: 'animacion', service_id: 10, name: 'Animación para Niños', price: 400, unit: 'por evento' }
      ]
    },
    {
      id: 'fotografia',
      category: 'Fotografía y Video',
      icon: <Camera className="h-8 w-8" />,
      description: 'Captura los mejores momentos de tu evento',
      requiresGuests: false,
      services: [
        { id: 'fotografia-profesional', service_id: 11, name: 'Fotografía Profesional', price: 1200, unit: 'por evento' },
        { id: 'video-profesional', service_id: 12, name: 'Video Profesional', price: 1800, unit: 'por evento' },
        { id: 'fotobooth', service_id: 13, name: 'Cabina de Fotos', price: 400, unit: 'por evento' }
      ]
    }
  ]

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }

  const handleServiceToggle = (service) => {
    const isSelected = selectedServices.some(s => s.service_id === service.service_id)
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.service_id !== service.service_id))
    } else {
      setSelectedServices([...selectedServices, service])
    }
  }

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      alert('Por favor selecciona al menos un servicio')
      return
    }

    const requiresGuests = selectedServices.some(service => {
      const category = serviceCategories.find(cat => 
        cat.services.some(s => s.service_id === service.service_id)
      )
      return category?.requiresGuests
    })

    onServiceSelect({
      services: selectedServices,
      requiresGuests: requiresGuests,
      categories: [...new Set(selectedServices.map(service => {
        const category = serviceCategories.find(cat => 
          cat.services.some(s => s.service_id === service.service_id)
        )
        return category?.id
      }))]
    })

    onNext()
  }

  const calculateEstimatedCost = (guestCount = 1) => {
    return selectedServices.reduce((total, service) => {
      if (service.unit === 'por persona') {
        return total + (service.price * guestCount)
      } else {
        return total + service.price
      }
    }, 0)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¿Qué servicios necesitas para tu evento?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Selecciona los servicios que mejor se adapten a tu evento. Puedes elegir múltiples categorías.
        </p>
      </div>

      {/* Selección de Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {serviceCategories.map((category) => (
          <Card 
            key={category.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedCategory?.id === category.id 
                ? 'ring-2 ring-indigo-500 bg-indigo-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleCategorySelect(category)}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-full ${
                  selectedCategory?.id === category.id 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.icon}
                </div>
              </div>
              <CardTitle className="text-lg">{category.category}</CardTitle>
              <CardDescription className="text-sm">
                {category.description}
              </CardDescription>
              {category.requiresGuests && (
                <Badge variant="outline" className="mt-2">
                  <Users className="h-3 w-3 mr-1" />
                  Requiere cantidad de invitados
                </Badge>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Servicios de la Categoría Seleccionada */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {selectedCategory.icon}
              <span>{selectedCategory.category}</span>
            </CardTitle>
            <CardDescription>
              Selecciona los servicios específicos que necesitas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCategory.services.map((service) => (
                <div 
                  key={service.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedServices.some(s => s.service_id === service.service_id)
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleServiceToggle(service)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        ${service.price.toLocaleString()} {service.unit}
                      </p>
                    </div>
                    <div className="ml-4">
                      {selectedServices.some(s => s.service_id === service.service_id) ? (
                        <CheckCircle className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Servicios Seleccionados */}
      {selectedServices.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Servicios Seleccionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedServices.map((service) => (
                <div key={service.service_id} className="flex justify-between items-center">
                  <span className="font-medium text-green-800">{service.name}</span>
                  <span className="text-green-600">
                    ${service.price.toLocaleString()} {service.unit}
                  </span>
                </div>
              ))}
              
              <div className="border-t border-green-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-800">Costo Base Estimado:</span>
                  <span className="text-xl font-bold text-green-600">
                    ${calculateEstimatedCost().toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  *El costo final dependerá de la cantidad de invitados para servicios por persona
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón de Continuar */}
      {selectedServices.length > 0 && (
        <div className="flex justify-center">
          <Button 
            onClick={handleContinue}
            size="lg"
            className="px-8"
          >
            Continuar con estos servicios
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Puedes modificar tu selección en cualquier momento durante el proceso de creación del evento.
        </p>
      </div>
    </div>
  )
}

export default ServiceSelector

