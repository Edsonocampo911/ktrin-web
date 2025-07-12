import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Package, DollarSign, Users, Star } from 'lucide-react'

const PromotionalPackages = ({ userType = 'provider' }) => {
  const [packages, setPackages] = useState([
    {
      id: 1,
      name: 'Paquete Graduación Premium',
      description: 'Paquete completo para celebraciones de graduación con todo incluido',
      price: 2500,
      services: ['Catering Premium', 'Decoración Temática', 'DJ Profesional', 'Fotografía'],
      capacity: '50-100 personas',
      rating: 4.8,
      bookings: 23,
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      name: 'Paquete Cumpleaños Infantil',
      description: 'Diversión garantizada para los más pequeños con animación y decoración',
      price: 1800,
      services: ['Animación Infantil', 'Decoración Temática', 'Pastelería Especializada', 'Juegos'],
      capacity: '20-40 niños',
      rating: 4.9,
      bookings: 45,
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      name: 'Paquete Boda Elegante',
      description: 'Todo lo necesario para una boda inolvidable con servicios de lujo',
      price: 5000,
      services: ['Catering Gourmet', 'Decoración Floral', 'Música en Vivo', 'Fotografía y Video'],
      capacity: '100-200 personas',
      rating: 4.7,
      bookings: 12,
      image: '/api/placeholder/300/200'
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    services: [],
    capacity: '',
    image: ''
  })

  const availableServices = [
    'Catering Premium', 'Catering Básico', 'Decoración Temática', 'Decoración Floral',
    'DJ Profesional', 'Música en Vivo', 'Animación Infantil', 'Fotografía',
    'Video Profesional', 'Pastelería Especializada', 'Bar Abierto', 'Alquiler de Mobiliario',
    'Iluminación Especial', 'Sonido Profesional', 'Seguridad', 'Valet Parking'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingPackage) {
      setPackages(prev => prev.map(pkg => 
        pkg.id === editingPackage.id 
          ? { ...pkg, ...formData, price: parseFloat(formData.price) }
          : pkg
      ))
    } else {
      const newPackage = {
        id: Date.now(),
        ...formData,
        price: parseFloat(formData.price),
        rating: 0,
        bookings: 0
      }
      setPackages(prev => [...prev, newPackage])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      services: [],
      capacity: '',
      image: ''
    })
    setShowCreateForm(false)
    setEditingPackage(null)
  }

  const handleEdit = (pkg) => {
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price.toString(),
      services: pkg.services,
      capacity: pkg.capacity,
      image: pkg.image || ''
    })
    setEditingPackage(pkg)
    setShowCreateForm(true)
  }

  const handleDelete = (id) => {
    setPackages(prev => prev.filter(pkg => pkg.id !== id))
  }

  if (userType !== 'provider') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Acceso Restringido</h3>
            <p className="mt-1 text-sm text-gray-500">
              Solo los proveedores pueden gestionar paquetes promocionales.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paquetes Promocionales</h1>
              <p className="mt-2 text-gray-600">
                Gestiona tus paquetes de servicios para ofrecer soluciones completas a tus clientes
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Paquete
            </Button>
          </div>
        </div>

        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingPackage ? 'Editar Paquete' : 'Crear Nuevo Paquete'}
              </CardTitle>
              <CardDescription>
                Define los servicios incluidos y el precio de tu paquete promocional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Nombre del Paquete *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ej: Paquete Graduación Premium"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio Total *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="2500"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe qué incluye tu paquete y qué lo hace especial..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="capacity">Capacidad</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Ej: 50-100 personas"
                  />
                </div>

                <div>
                  <Label>Servicios Incluidos *</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableServices.map(service => (
                      <div
                        key={service}
                        onClick={() => handleServiceToggle(service)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.services.includes(service)
                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium">{service}</div>
                      </div>
                    ))}
                  </div>
                  {formData.services.length === 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      Selecciona al menos un servicio para el paquete
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={formData.services.length === 0}
                  >
                    {editingPackage ? 'Actualizar Paquete' : 'Crear Paquete'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Package className="h-12 w-12 text-purple-400" />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(pkg)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-purple-600">
                      ${pkg.price.toLocaleString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{pkg.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {pkg.capacity}
                    </div>
                    <span>{pkg.bookings} contrataciones</span>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Servicios incluidos:</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.services.slice(0, 3).map(service => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {pkg.services.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{pkg.services.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {packages.length === 0 && !showCreateForm && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay paquetes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primer paquete promocional.
            </p>
            <div className="mt-6">
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Paquete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PromotionalPackages

