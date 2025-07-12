import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PartyPackages from './PartyPackages'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Star,
  DollarSign,
  Calendar,
  Users,
  Utensils,
  Flower,
  Music,
  Camera,
  Car,
  MapPin,
  Settings,
  Package
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const ServiceManagement = ({ user }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('services')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [packages, setPackages] = useState([]) // Esto se manejará en PartyPackages
  const [services, setServices] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    unit: 'por evento',
    minCapacity: '',
    maxCapacity: '',
    coverageArea: '',
    isActive: true,
    specialRequirements: '',
    availableDays: [],
    promotionalPackages: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const serviceCategories = [
    { value: 'catering', label: 'Catering y Comida', icon: <Utensils className="h-4 w-4" /> },
    { value: 'decoracion', label: 'Decoración y Flores', icon: <Flower className="h-4 w-4" /> },
    { value: 'musica', label: 'Música y Entretenimiento', icon: <Music className="h-4 w-4" /> },
    { value: 'fotografia', label: 'Fotografía y Video', icon: <Camera className="h-4 w-4" /> },
    { value: 'transporte', label: 'Transporte', icon: <Car className="h-4 w-4" /> },
    { value: 'venues', label: 'Venues y Locaciones', icon: <MapPin className="h-4 w-4" /> },
    { value: 'planificacion', label: 'Planificación de Eventos', icon: <Calendar className="h-4 w-4" /> },
    { value: 'otros', label: 'Otros Servicios', icon: <Settings className="h-4 w-4" /> }
  ]

  const priceUnits = [
    { value: 'por evento', label: 'Por Evento' },
    { value: 'por persona', label: 'Por Persona' },
    { value: 'por hora', label: 'Por Hora' },
    { value: 'por día', label: 'Por Día' }
  ]

  // Fetch services when component mounts or user changes
  useEffect(() => {
    const fetchServices = async () => {
      if (!user || user.type !== 'provider') return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('provider_id', user.id);

        if (error) {
          throw error;
        }
        setServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err.message || 'Error al cargar los servicios.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    })
    setError('')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      unit: 'por evento',
      minCapacity: '',
      maxCapacity: '',
      coverageArea: '',
      isActive: true,
      specialRequirements: '',
      availableDays: [],
      promotionalPackages: ''
    })
    setEditingService(null)
    setShowAddForm(false)
    setError('')
  }

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price.toString(),
      unit: service.price_type, // Usar price_type del backend
      minCapacity: service.min_capacity ? service.min_capacity.toString() : '',
      maxCapacity: service.max_capacity ? service.max_capacity.toString() : '',
      coverageArea: service.location || '', // Usar location del backend
      isActive: service.available, // Usar available del backend
      specialRequirements: '', // No mapeado directamente desde el backend aún
      availableDays: [], // No mapeado directamente desde el backend aún
      promotionalPackages: '' // No mapeado directamente desde el backend aún
    })
    setEditingService(service)
    setShowAddForm(true)
  }

  const handleDelete = async (serviceId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('services')
          .delete()
          .eq('service_id', serviceId);

        if (error) {
          throw error;
        }
        setServices(services.filter(s => s.service_id !== serviceId));
      } catch (err) {
        console.error('Error deleting service:', err);
        setError(err.message || 'Error al eliminar el servicio.');
      } finally {
        setLoading(false);
      }
    }
  }

  const handleToggleActive = async (serviceId, currentStatus) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ available: !currentStatus })
        .eq('service_id', serviceId)
        .select();

      if (error) {
        throw error;
      }
      setServices(services.map(service => 
        service.service_id === serviceId 
          ? { ...service, available: !currentStatus }
          : service
      ));
    } catch (err) {
      console.error('Error toggling service status:', err);
      setError(err.message || 'Error al actualizar el estado del servicio.');
    } finally {
      setLoading(false);
    }
  }

  const validateForm = () => {
    if (!formData.name || !formData.category || !formData.description || !formData.price) {
      setError('Por favor completa todos los campos requeridos')
      return false
    }
    if (parseFloat(formData.price) <= 0) {
      setError('El precio debe ser mayor a 0')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const serviceData = {
        provider_id: user.id, // Asumiendo que user.id está disponible
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        price_type: formData.unit,
        duration: null, // No hay campo de duración en el formulario actual
        location: formData.coverageArea,
        available: formData.isActive,
        min_capacity: parseInt(formData.minCapacity) || null,
        max_capacity: parseInt(formData.maxCapacity) || null,
      };

      let result;
      if (editingService) {
        // Actualizar servicio existente
        result = await supabase
          .from('services')
          .update(serviceData)
          .eq('service_id', editingService.service_id)
          .select();
      } else {
        // Agregar nuevo servicio
        result = await supabase
          .from('services')
          .insert([serviceData])
          .select();
      }

      if (result.error) {
        throw result.error;
      }

      // Refrescar la lista de servicios después de la operación
      const { data: updatedServices, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user.id);
      
      if (fetchError) {
        throw fetchError;
      }
      setServices(updatedServices);

      resetForm();
    } catch (err) {
      console.error('Error al guardar el servicio:', err);
      setError(err.message || 'Error al guardar el servicio. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const getCategoryIcon = (category) => {
    const categoryData = serviceCategories.find(cat => cat.value === category)
    return categoryData?.icon || <Settings className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard/provider" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              Gestión de Servicios
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Servicios</h1>
            <p className="text-lg text-gray-600">Gestiona los servicios y paquetes que ofreces a tus clientes</p>
          </div>
          {activeTab === 'services' && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Servicio
            </Button>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('services')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Servicios Individuales
                </div>
              </button>
              <button
                onClick={() => setActiveTab('packages')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'packages'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Paquetes de Fiestas
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {loading ? (
                <p>Cargando servicios...</p>
              ) : services.length === 0 ? (
                <p>No hay servicios disponibles. Agrega uno nuevo.</p>
              ) : (
                services.map((service) => (
                  <Card key={service.service_id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(service.category)}
                          <div>
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            <CardDescription>{service.category}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={service.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {service.available ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <Switch
                            checked={service.available}
                            onCheckedChange={() => handleToggleActive(service.service_id, service.available)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">Precio</p>
                          <p className="font-semibold">${service.price} {service.price_type}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Capacidad</p>
                          <p className="font-semibold">{service.min_capacity || 'N/A'} - {service.max_capacity || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Reservas</p>
                          <p className="font-semibold">{service.bookings_count || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Calificación</p>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-semibold">{service.rating || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Zona de cobertura: {service.location || 'N/A'}</p>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(service.service_id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Add/Edit Service Form */}
          <div>
            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingService ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
                  </CardTitle>
                  <CardDescription>
                    Completa la información de tu servicio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div>
                      <Label htmlFor="name">Nombre del Servicio *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Ej: Catering Premium"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <Label>Categoría *</Label>
                      <Select onValueChange={(value) => handleSelectChange('category', value)} value={formData.category}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center space-x-2">
                                {category.icon}
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">Descripción *</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe tu servicio..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="price">Precio *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          placeholder="0"
                          value={formData.price}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label>Unidad</Label>
                        <Select onValueChange={(value) => handleSelectChange('unit', value)} value={formData.unit}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priceUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="minCapacity">Capacidad Mínima</Label>
                        <Input
                          id="minCapacity"
                          name="minCapacity"
                          type="number"
                          placeholder="1"
                          value={formData.minCapacity}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxCapacity">Capacidad Máxima</Label>
                        <Input
                          id="maxCapacity"
                          name="maxCapacity"
                          type="number"
                          placeholder="1000"
                          value={formData.maxCapacity}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="coverageArea">Zona de Cobertura</Label>
                      <Input
                        id="coverageArea"
                        name="coverageArea"
                        placeholder="Ciudad, región o área que cubres"
                        value={formData.coverageArea}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialRequirements">Requerimientos Especiales</Label>
                      <Textarea
                        id="specialRequirements"
                        name="specialRequirements"
                        placeholder="Menciona cualquier requerimiento especial..."
                        value={formData.specialRequirements}
                        onChange={handleChange}
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleSelectChange('isActive', checked)}
                      />
                      <Label>Servicio activo</Label>
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? 'Guardando...' : (editingService ? 'Actualizar' : 'Agregar')}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            {!showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Servicios Activos:</span>
                    <span className="font-semibold">{services.filter(s => s.available).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Reservas:</span>
                    <span className="font-semibold">{services.reduce((sum, s) => sum + (s.bookings_count || 0), 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calificación Promedio:</span>
                    <span className="font-semibold">
                      {(services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length).toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <PartyPackages 
            packages={packages}
            onPackagesChange={setPackages}
          />
        )}
      </div>
    </div>
  )
}

export default ServiceManagement


