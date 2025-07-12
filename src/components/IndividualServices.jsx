import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Search, Filter, DollarSign, Clock, MapPin } from 'lucide-react'

const IndividualServices = ({ userType = 'provider', onServiceSelect = null }) => {
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Catering Premium',
      category: 'alimentacion',
      description: 'Servicio de catering gourmet con menú personalizado',
      price: 45,
      priceType: 'por_persona',
      duration: '4 horas',
      location: 'A domicilio',
      provider: 'Catering Deluxe',
      rating: 4.8,
      available: true
    },
    {
      id: 2,
      name: 'DJ Profesional',
      category: 'entretenimiento',
      description: 'DJ con equipo de sonido profesional y luces',
      price: 800,
      priceType: 'por_evento',
      duration: '6 horas',
      location: 'A domicilio',
      provider: 'Sound Masters',
      rating: 4.9,
      available: true
    },
    {
      id: 3,
      name: 'Alquiler de Sillas Chiavari',
      category: 'mobiliario',
      description: 'Sillas elegantes para eventos formales',
      price: 8,
      priceType: 'por_unidad',
      duration: '1 día',
      location: 'Entrega incluida',
      provider: 'Mobiliario Eventos',
      rating: 4.7,
      available: true
    },
    {
      id: 4,
      name: 'Decoración Floral',
      category: 'decoracion',
      description: 'Arreglos florales personalizados para tu evento',
      price: 300,
      priceType: 'por_evento',
      duration: 'Instalación',
      location: 'A domicilio',
      provider: 'Flores & Diseño',
      rating: 4.6,
      available: true
    },
    {
      id: 5,
      name: 'Cerveza Artesanal',
      category: 'bebidas',
      description: 'Selección de cervezas artesanales locales',
      price: 12,
      priceType: 'por_persona',
      duration: 'Todo el evento',
      location: 'Entrega incluida',
      provider: 'Cervecería Local',
      rating: 4.5,
      available: true
    },
    {
      id: 6,
      name: 'Pastel Personalizado',
      category: 'postres',
      description: 'Pastel diseñado especialmente para tu celebración',
      price: 25,
      priceType: 'por_persona',
      duration: 'Entrega',
      location: 'A domicilio',
      provider: 'Pastelería Artesanal',
      rating: 4.9,
      available: true
    }
  ])

  const [filteredServices, setFilteredServices] = useState(services)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'alimentacion', label: 'Alimentación' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'postres', label: 'Postres' },
    { value: 'entretenimiento', label: 'Entretenimiento' },
    { value: 'decoracion', label: 'Decoración' },
    { value: 'mobiliario', label: 'Mobiliario' },
    { value: 'fotografia', label: 'Fotografía' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'seguridad', label: 'Seguridad' }
  ]

  const priceTypes = [
    { value: 'por_persona', label: 'Por persona' },
    { value: 'por_evento', label: 'Por evento' },
    { value: 'por_unidad', label: 'Por unidad' },
    { value: 'por_hora', label: 'Por hora' }
  ]

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    priceType: 'por_evento',
    duration: '',
    location: '',
    provider: userType === 'provider' ? 'Mi Empresa' : ''
  })

  // Filtrar servicios
  const filterServices = () => {
    let filtered = services

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.provider.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredServices(filtered)
  }

  // Ejecutar filtrado cuando cambien los filtros
  useState(() => {
    filterServices()
  }, [selectedCategory, searchTerm, services])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingService) {
      setServices(prev => prev.map(service =>
        service.id === editingService.id
          ? { ...service, ...formData, price: parseFloat(formData.price) }
          : service
      ))
    } else {
      const newService = {
        id: Date.now(),
        ...formData,
        price: parseFloat(formData.price),
        rating: 0,
        available: true
      }
      setServices(prev => [...prev, newService])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      priceType: 'por_evento',
      duration: '',
      location: '',
      provider: userType === 'provider' ? 'Mi Empresa' : ''
    })
    setShowCreateForm(false)
    setEditingService(null)
  }

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price.toString(),
      priceType: service.priceType,
      duration: service.duration,
      location: service.location,
      provider: service.provider
    })
    setEditingService(service)
    setShowCreateForm(true)
  }

  const handleDelete = (id) => {
    setServices(prev => prev.filter(service => service.id !== id))
  }

  const handleServiceSelect = (service) => {
    if (onServiceSelect) {
      onServiceSelect(service)
    } else {
      setSelectedServices(prev => {
        const isSelected = prev.find(s => s.id === service.id)
        if (isSelected) {
          return prev.filter(s => s.id !== service.id)
        } else {
          return [...prev, service]
        }
      })
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      alimentacion: 'bg-green-100 text-green-800',
      bebidas: 'bg-blue-100 text-blue-800',
      postres: 'bg-pink-100 text-pink-800',
      entretenimiento: 'bg-purple-100 text-purple-800',
      decoracion: 'bg-yellow-100 text-yellow-800',
      mobiliario: 'bg-gray-100 text-gray-800',
      fotografia: 'bg-indigo-100 text-indigo-800',
      transporte: 'bg-orange-100 text-orange-800',
      seguridad: 'bg-red-100 text-red-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {userType === 'provider' ? 'Mis Servicios' : 'Servicios Disponibles'}
              </h1>
              <p className="mt-2 text-gray-600">
                {userType === 'provider' 
                  ? 'Gestiona tus servicios individuales y sus precios'
                  : 'Selecciona los servicios que necesitas para tu evento'
                }
              </p>
            </div>
            {userType === 'provider' && (
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Servicio
              </Button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar servicios, proveedores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de creación/edición */}
        {showCreateForm && userType === 'provider' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingService ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
              </CardTitle>
              <CardDescription>
                Define los detalles y precio de tu servicio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Nombre del Servicio *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ej: DJ Profesional"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(cat => cat.value !== 'all').map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe tu servicio en detalle..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price">Precio *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="100"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="priceType">Tipo de Precio *</Label>
                    <Select value={formData.priceType} onValueChange={(value) => setFormData(prev => ({ ...prev, priceType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priceTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="duration">Duración</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="Ej: 4 horas"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Ubicación/Entrega</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Ej: A domicilio"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    {editingService ? 'Actualizar Servicio' : 'Agregar Servicio'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <Card 
              key={service.id} 
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                selectedServices.find(s => s.id === service.id) ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => handleServiceSelect(service)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {service.name}
                    </h3>
                    <Badge className={getCategoryColor(service.category)}>
                      {categories.find(cat => cat.value === service.category)?.label}
                    </Badge>
                  </div>
                  {userType === 'provider' && (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(service)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(service.id)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4">{service.description}</p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-purple-600">
                      ${service.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      {priceTypes.find(type => type.value === service.priceType)?.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {service.location}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Proveedor:</span> {service.provider}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron servicios</h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros de búsqueda.
            </p>
          </div>
        )}

        {/* Resumen de servicios seleccionados */}
        {selectedServices.length > 0 && userType !== 'provider' && (
          <Card className="mt-8 sticky bottom-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Servicios Seleccionados: {selectedServices.length}</h3>
                  <p className="text-sm text-gray-600">
                    Total estimado: ${selectedServices.reduce((sum, service) => sum + service.price, 0).toLocaleString()}
                  </p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Continuar con Selección
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default IndividualServices

