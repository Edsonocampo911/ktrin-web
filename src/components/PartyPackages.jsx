import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  X,
  Package,
  DollarSign,
  Users,
  Star,
  Gift,
  Utensils,
  Music,
  Camera,
  Flower,
  Car,
  MapPin,
  Calendar,
  Info,
  Edit,
  Trash2
} from 'lucide-react'

const PartyPackages = ({ user }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [packages, setPackages] = useState([])
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price: '',
    eventTypes: [],
    includedServices: [],
    minGuests: '',
    maxGuests: '',
    duration: '',
    isActive: true,
    discount: '',
    features: []
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const eventTypes = [
    { value: 'cumpleanos', label: 'Cumpleaños' },
    { value: 'boda', label: 'Bodas' },
    { value: 'corporativo', label: 'Eventos Corporativos' },
    { value: 'graduacion', label: 'Graduaciones' },
    { value: 'aniversario', label: 'Aniversarios' },
    { value: 'fiesta', label: 'Fiestas' },
    { value: 'quinceanos', label: 'Quinceaños' },
    { value: 'baby_shower', label: 'Baby Shower' }
  ]

  const availableServices = [
    { id: 'catering', name: 'Catering Completo', icon: <Utensils className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
    { id: 'decoracion', name: 'Decoración Temática', icon: <Flower className="h-4 w-4" />, color: 'bg-pink-100 text-pink-800' },
    { id: 'musica', name: 'DJ y Música', icon: <Music className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' },
    { id: 'fotografia', name: 'Fotografía Profesional', icon: <Camera className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
    { id: 'transporte', name: 'Transporte', icon: <Car className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
    { id: 'venue', name: 'Lugar del Evento', icon: <MapPin className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-800' },
    { id: 'animacion', name: 'Animación', icon: <Gift className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'coordinacion', name: 'Coordinación del Evento', icon: <Calendar className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800' }
  ]

  // Fetch packages when component mounts or user changes
  useEffect(() => {
    const fetchPackages = async () => {
      if (!user || user.type !== 'provider') return;
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/packages?provider_id=${user.id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar paquetes');
        }
        setPackages(data);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError(err.message || 'Error al cargar los paquetes.');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [user]);

  const addPredefinedPackage = async (packageData) => {
    if (packages.find(p => p.name === packageData.name)) {
      setError('Este paquete predefinido ya ha sido añadido.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_id: user.id,
          name: packageData.name,
          description: packageData.description,
          price: packageData.price,
          event_types: packageData.eventTypes,
          included_services: packageData.includedServices,
          min_guests: packageData.minGuests,
          max_guests: packageData.maxGuests,
          duration: packageData.duration,
          available: true,
          discount: packageData.discount,
          features: packageData.features
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al agregar el paquete predefinido');
      }
      setPackages([...packages, data]);
    } catch (err) {
      console.error('Error adding predefined package:', err);
      setError(err.message || 'Error al agregar el paquete predefinido.');
    } finally {
      setLoading(false);
    }
  };

  const addCustomPackage = async () => {
    if (!newPackage.name || !newPackage.price || newPackage.includedServices.length === 0) {
      setError('Por favor completa todos los campos requeridos para el paquete.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const packageDataToSend = {
        provider_id: user.id,
        name: newPackage.name,
        description: newPackage.description,
        price: parseFloat(newPackage.price),
        event_types: newPackage.eventTypes,
        included_services: newPackage.includedServices,
        min_guests: parseInt(newPackage.minGuests) || null,
        max_guests: parseInt(newPackage.maxGuests) || null,
        duration: newPackage.duration,
        available: newPackage.isActive,
        discount: parseFloat(newPackage.discount) || 0,
        features: newPackage.features
      };

      let response;
      if (editingPackage) {
        response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/packages/${editingPackage.package_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(packageDataToSend),
        });
      } else {
        response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/packages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(packageDataToSend),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el paquete.');
      }

      // Refetch packages to update the list
      const fetchPackages = async () => {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/packages?provider_id=${user.id}`);
        const d = await res.json();
        setPackages(d);
      };
      await fetchPackages();

      resetForm();
    } catch (err) {
      console.error('Error saving package:', err);
      setError(err.message || 'Error al guardar el paquete. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const editPackage = (packageData) => {
    setNewPackage({
      name: packageData.name,
      description: packageData.description,
      price: packageData.price.toString(),
      eventTypes: packageData.event_types || [],
      includedServices: packageData.included_services || [],
      minGuests: packageData.min_guests ? packageData.min_guests.toString() : '',
      maxGuests: packageData.max_guests ? packageData.max_guests.toString() : '',
      duration: packageData.duration || '',
      isActive: packageData.available,
      discount: packageData.discount ? packageData.discount.toString() : '',
      features: packageData.features || []
    });
    setEditingPackage(packageData);
    setShowAddForm(true);
  };

  const removePackage = async (packageId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paquete?')) {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/packages/${packageId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el paquete');
        }
        setPackages(packages.filter(p => p.package_id !== packageId));
      } catch (err) {
        console.error('Error deleting package:', err);
        setError(err.message || 'Error al eliminar el paquete.');
      } finally {
        setLoading(false);
      }
    }
  };

  const togglePackageActive = async (packageId, currentStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available: !currentStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el estado del paquete');
      }
      setPackages(packages.map(pkg => 
        pkg.package_id === packageId 
          ? { ...pkg, available: !currentStatus }
          : pkg
      ));
    } catch (err) {
      console.error('Error toggling package status:', err);
      setError(err.message || 'Error al actualizar el estado del paquete.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewPackage({
      name: '',
      description: '',
      price: '',
      eventTypes: [],
      includedServices: [],
      minGuests: '',
      maxGuests: '',
      duration: '',
      isActive: true,
      discount: '',
      features: []
    });
    setEditingPackage(null);
    setShowAddForm(false);
    setError('');
  };

  const handleServiceToggle = (serviceId) => {
    const updatedServices = newPackage.includedServices.includes(serviceId)
      ? newPackage.includedServices.filter(s => s !== serviceId)
      : [...newPackage.includedServices, serviceId];
    
    setNewPackage({ ...newPackage, includedServices: updatedServices });
  };

  const handleEventTypeToggle = (eventType) => {
    const updatedTypes = newPackage.eventTypes.includes(eventType)
      ? newPackage.eventTypes.filter(t => t !== eventType)
      : [...newPackage.eventTypes, eventType];
    
    setNewPackage({ ...newPackage, eventTypes: updatedTypes });
  };

  const handleFeatureAdd = (feature) => {
    if (feature && !newPackage.features.includes(feature)) {
      setNewPackage({ ...newPackage, features: [...newPackage.features, feature] });
    }
  };

  const handleFeatureRemove = (feature) => {
    setNewPackage({ 
      ...newPackage, 
      features: newPackage.features.filter(f => f !== feature) 
    });
  };

  const getServiceIcon = (serviceId) => {
    const service = availableServices.find(s => s.id === serviceId);
    return service?.icon || <Package className="h-4 w-4" />;
  };

  const getServiceName = (serviceId) => {
    const service = availableServices.find(s => s.id === serviceId);
    return service?.name || serviceId;
  };

  const getServiceColor = (serviceId) => {
    const service = availableServices.find(s => s.id === serviceId);
    return service?.color || 'bg-gray-100 text-gray-800';
  };

  const calculateSavings = (price, discount) => {
    return (price * (discount / 100)).toFixed(0);
  };

  const predefinedPackages = [
    {
      name: 'Paquete Cumpleaños Infantil',
      description: 'Todo lo necesario para una fiesta de cumpleaños infantil inolvidable',
      price: 800,
      eventTypes: ['cumpleanos'],
      includedServices: ['catering', 'decoracion', 'animacion', 'fotografia'],
      minGuests: 15,
      maxGuests: 50,
      duration: '4 horas',
      discount: 15,
      features: ['Pastel personalizado', 'Globos y decoración temática', 'Animador profesional', 'Sesión fotográfica']
    },
    {
      name: 'Paquete Boda Completa',
      description: 'Paquete integral para bodas con todos los servicios incluidos',
      price: 5000,
      eventTypes: ['boda'],
      includedServices: ['catering', 'decoracion', 'musica', 'fotografia', 'venue', 'coordinacion'],
      minGuests: 50,
      maxGuests: 200,
      duration: '8 horas',
      discount: 20,
      features: ['Menú de 3 tiempos', 'Decoración floral', 'DJ profesional', 'Fotografía y video', 'Coordinador de bodas']
    },
    {
      name: 'Paquete Corporativo Premium',
      description: 'Solución completa para eventos corporativos profesionales',
      price: 2500,
      eventTypes: ['corporativo'],
      includedServices: ['catering', 'venue', 'coordinacion', 'fotografia'],
      minGuests: 30,
      maxGuests: 100,
      duration: '6 horas',
      discount: 10,
      features: ['Coffee break', 'Almuerzo ejecutivo', 'Equipo audiovisual', 'Fotografía del evento']
    },
    {
      name: 'Paquete Quinceaños Elegante',
      description: 'Celebración especial para quinceaños con estilo y elegancia',
      price: 3000,
      eventTypes: ['quinceanos'],
      includedServices: ['catering', 'decoracion', 'musica', 'fotografia', 'transporte'],
      minGuests: 80,
      maxGuests: 150,
      duration: '6 horas',
      discount: 18,
      features: ['Vals especial', 'Decoración temática', 'Limousina', 'Sesión fotográfica profesional']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Paquetes de Fiestas
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Crea paquetes completos que incluyan varios servicios con descuentos especiales
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas de Paquetes */}
      {packages.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Paquetes Activos</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {packages.filter(p => p.available).length}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">Precio Promedio</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  ${packages.length > 0 ? Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length) : 0}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">Total Reservas</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {packages.reduce((sum, p) => sum + (p.bookings_count || 0), 0)}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">Rating Promedio</span>
                </div>
                <p className="text-2xl font-bold text-yellow-700">
                  {packages.length > 0 ? (packages.reduce((sum, p) => sum + (p.rating || 0), 0) / packages.length).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Paquetes Creados */}
      {loading ? (
        <p>Cargando paquetes...</p>
      ) : packages.length === 0 ? (
        <p>No hay paquetes disponibles. Agrega uno nuevo o selecciona uno predefinido.</p>
      ) : (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Mis Paquetes:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <Card key={pkg.package_id} className={`hover:shadow-lg transition-shadow ${!pkg.available ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={pkg.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {pkg.available ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">${pkg.price}</span>
                      {pkg.discount > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          {pkg.discount}% descuento
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>👥 {pkg.min_guests || 'N/A'} - {pkg.max_guests || 'N/A'} invitados</p>
                      <p>⏱️ Duración: {pkg.duration || 'N/A'}</p>
                      <p>📅 Reservas: {pkg.bookings_count || 0}</p>
                      {pkg.rating > 0 && (
                        <p>⭐ Rating: {pkg.rating}/5</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Servicios incluidos:</p>
                      <div className="flex flex-wrap gap-1">
                        {pkg.included_services.map((serviceId) => (
                          <Badge key={serviceId} className={getServiceColor(serviceId)} variant="secondary">
                            <span className="flex items-center gap-1">
                              {getServiceIcon(serviceId)}
                              {getServiceName(serviceId)}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {pkg.features && pkg.features.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Características:</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside">
                          {pkg.features.slice(0, 3).map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                          {pkg.features.length > 3 && (
                            <li>+{pkg.features.length - 3} más...</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => editPackage(pkg)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => removePackage(pkg.package_id)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => togglePackageActive(pkg.package_id, pkg.available)}
                      >
                        {pkg.available ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Paquetes Predefinidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paquetes Populares</CardTitle>
          <CardDescription>
            Selecciona de los paquetes más solicitados y personalízalos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predefinedPackages.map((pkg, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${
                  packages.find(p => p.name === pkg.name) 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => addPredefinedPackage(pkg)}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h5 className="font-semibold text-gray-900">{pkg.name}</h5>
                    <Badge className="bg-green-100 text-green-800">
                      ${pkg.price}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>👥 {pkg.minGuests}-{pkg.maxGuests}</span>
                    <span>⏱️ {pkg.duration}</span>
                    <span className="text-red-600">💰 {pkg.discount}% OFF</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pkg.includedServices.slice(0, 3).map((serviceId) => (
                      <Badge key={serviceId} className={getServiceColor(serviceId)} variant="secondary" size="sm">
                        {getServiceName(serviceId)}
                      </Badge>
                    ))}
                    {pkg.includedServices.length > 3 && (
                      <Badge variant="secondary" size="sm">
                        +{pkg.includedServices.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Formulario para Agregar/Editar Paquete */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {editingPackage ? 'Editar Paquete' : 'Crear Paquete Personalizado'}
          </CardTitle>
          <CardDescription>
            Diseña tu propio paquete con servicios específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showAddForm ? (
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Paquete Personalizado
            </Button>
          ) : (
            <div className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-900">Información Básica</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="package-name">Nombre del Paquete *</Label>
                    <Input
                      id="package-name"
                      placeholder="Ej: Paquete Cumpleaños Premium"
                      value={newPackage.name}
                      onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="package-price">Precio Total (USD) *</Label>
                    <Input
                      id="package-price"
                      type="number"
                      placeholder="0"
                      value={newPackage.price}
                      onChange={(e) => setNewPackage({...newPackage, price: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="package-description">Descripción</Label>
                  <Textarea
                    id="package-description"
                    placeholder="Describe qué incluye tu paquete..."
                    value={newPackage.description}
                    onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>

              {/* Tipos de Eventos */}
              <div>
                <Label>Tipos de Eventos Aplicables</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {eventTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        checked={newPackage.eventTypes.includes(type.value)}
                        onCheckedChange={() => handleEventTypeToggle(type.value)}
                      />
                      <Label className="text-sm">{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Servicios Incluidos */}
              <div>
                <Label>Servicios Incluidos *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {availableServices.map((service) => (
                    <div 
                      key={service.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        newPackage.includedServices.includes(service.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={newPackage.includedServices.includes(service.id)}
                          readOnly
                        />
                        {service.icon}
                        <span className="text-sm font-medium">{service.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detalles del Paquete */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="min-guests">Mínimo de Invitados</Label>
                  <Input
                    id="min-guests"
                    type="number"
                    placeholder="1"
                    value={newPackage.minGuests}
                    onChange={(e) => setNewPackage({...newPackage, minGuests: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="max-guests">Máximo de Invitados</Label>
                  <Input
                    id="max-guests"
                    type="number"
                    placeholder="100"
                    value={newPackage.maxGuests}
                    onChange={(e) => setNewPackage({...newPackage, maxGuests: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duración</Label>
                  <Input
                    id="duration"
                    placeholder="Ej: 4 horas"
                    value={newPackage.duration}
                    onChange={(e) => setNewPackage({...newPackage, duration: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="discount">Descuento (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  placeholder="0"
                  value={newPackage.discount}
                  onChange={(e) => setNewPackage({...newPackage, discount: e.target.value})}
                />
                {newPackage.price && newPackage.discount && (
                  <p className="text-sm text-green-600 mt-1">
                    Ahorro: ${calculateSavings(parseFloat(newPackage.price), parseFloat(newPackage.discount))}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={newPackage.isActive}
                  onCheckedChange={(checked) => setNewPackage({...newPackage, isActive: checked})}
                />
                <Label>Paquete activo</Label>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={addCustomPackage} 
                  disabled={loading || !newPackage.name || !newPackage.price || newPackage.includedServices.length === 0}
                >
                  {loading ? 'Guardando...' : (editingPackage ? 'Actualizar' : 'Crear')} Paquete
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {packages.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Los paquetes aparecerán en el catálogo de servicios para que los organizadores puedan 
            seleccionarlos al crear sus eventos. Los descuentos se aplicarán automáticamente.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PartyPackages;


