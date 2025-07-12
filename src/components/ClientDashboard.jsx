import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar,
  Plus,
  Users,
  Clock,
  MapPin,
  Star,
  MessageCircle,
  Settings,
  LogOut,
  PartyPopper,
  Heart,
  Gift
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const ClientDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getDietaryMismatch = (guestDietaryConditions, eventSelectedServices) => {
    // Define a mapping of dietary conditions to service categories they might conflict with
    const dietaryToServiceCategoryMap = {
      'Vegano': ['Catering y Comida'],
      'Vegetariano': ['Catering y Comida'],
      'Celíaco (sin gluten)': ['Catering y Comida', 'Pastelería Especializada'],
      'Alérgico a lácteos': ['Catering y Comida', 'Pastelería Especializada'],
      'Alérgico a frutos secos': ['Catering y Comida', 'Pastelería Especializada'],
      'Alérgico a mariscos': ['Catering y Comida'],
      'Diabético': ['Catering y Comida', 'Pastelería Especializada'],
    };

    const selectedServiceCategories = eventSelectedServices.map(serviceId => {
      const service = serviceCategories.flatMap(cat => cat.services).find(s => s.service_id === serviceId);
      return service ? serviceCategories.find(cat => cat.services.includes(service))?.category : null;
    }).filter(Boolean);

    for (const condition of guestDietaryConditions) {
      const conflictingCategories = dietaryToServiceCategoryMap[condition];
      if (conflictingCategories) {
        for (const conflictCat of conflictingCategories) {
          if (selectedServiceCategories.includes(conflictCat)) {
            // This is a simplified check. A more robust solution would check specific menu items.
            return true; // Found a potential mismatch
          }
        }
      }
    }
    return false; // No obvious mismatch found
  };

  // Add serviceCategories to ClientDashboard for dietary mismatch check
  const serviceCategories = [
    {
      category: 'Catering y Comida',
      services: [
        { service_id: 1, name: 'Catering Premium' },
        { service_id: 2, name: 'Catering Básico' },
        { service_id: 3, name: 'Bar Abierto' },
        { service_id: 4, name: 'Pastelería Especializada' }
      ]
    },
    {
      category: 'Decoración y Flores',
      services: [
        { service_id: 5, name: 'Decoración Temática' },
        { service_id: 6, name: 'Arreglos Florales' },
        { service_id: 7, name: 'Iluminación Especial' }
      ]
    },
    {
      category: 'Música y Entretenimiento',
      services: [
        { service_id: 8, name: 'DJ Profesional' },
        { service_id: 9, name: 'Banda en Vivo' },
        { service_id: 10, name: 'Animación para Niños' }
      ]
    },
    {
      category: 'Fotografía y Video',
      services: [
        { service_id: 11, name: 'Fotografía Profesional' },
        { service_id: 12, name: 'Video Profesional' },
        { service_id: 13, name: 'Cabina de Fotos' }
      ]
    }
  ];

  const fetchGuests = async (eventId) => {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("event_id", eventId);
      if (error) throw error;
      setGuests(data);
    } catch (error) {
      console.error("Error fetching guests:", error);
      setError(error.message);
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    fetchGuests(event.event_id);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user || user.type !== 'client') {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('organizer_id', user.id);

        if (error) {
          throw error;
        }
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Error al cargar los eventos.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'cumpleanos':
        return <Heart className="h-5 w-5 text-red-500" />
      case 'boda':
        return <PartyPopper className="h-5 w-5 text-pink-500" />
      case 'corporativo':
        return <Gift className="h-5 w-5 text-blue-500" />
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />
    }
  }

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">Ktrin</Link>
              <span className="ml-4 text-sm text-gray-500">Dashboard del Organizador</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Mensajes
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback>
                    {(user?.name || 'Usuario').split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user?.name || 'Usuario'}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Hola, {user?.name || 'Usuario'}!
          </h1>
          <p className="text-lg text-gray-600">
            Gestiona tus eventos y conecta con los mejores proveedores
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Activos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.filter(e => e.status !== 'completed').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invitados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.reduce((sum, e) => sum + e.attendees_count, 0)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${events.reduce((sum, e) => sum + e.budget, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Evento</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.length > 0 ? new Date(events[0].event_date).toLocaleDateString() : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events List */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mis Eventos</h2>
              <div className="space-x-2">
                <Link to="/create-event-optimized">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Evento (Nuevo)
                  </Button>
                </Link>
                <Link to="/create-event">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Evento (Clásico)
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <p>Cargando eventos...</p>
              ) : events.length === 0 ? (
                <p>No tienes eventos creados. ¡Crea tu primer evento ahora!</p>
              ) : (
                events.map((event) => (
                  <Card key={event.event_id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          {getEventIcon(event.event_type)}
                          <div>
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <CardDescription>{event.event_type}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {event.event_time}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.address || 'Ubicación no especificada'}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {event.attendees_count} invitados
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Servicios contratados:</p>
                        <div className="flex flex-wrap gap-2">
                          {/* Aquí necesitarías mapear los servicios reales del evento si los devuelve el backend */}
                          <Badge variant="secondary">
                            Servicios (pendiente de API)
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          Presupuesto: ${event.budget.toLocaleString()}
                        </span>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(event)}>
                            Ver Invitados
                          </Button>
                          <Button variant="outline" size="sm">
                            Ver Detalles
                          </Button>
                          <Button size="sm">
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/create-event">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nuevo Evento
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Buscar Proveedores
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ver Mensajes
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Proveedor confirmó servicio de catering</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Nuevo mensaje de decorador</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Recordatorio: Pago pendiente</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Consejos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>💡 Reserva tus proveedores con al menos 2 semanas de anticipación</p>
                  <p>📅 Usa nuestro calendario para evitar conflictos de fechas</p>
                  <p>💬 Mantén comunicación constante con tus proveedores</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Invitados para {selectedEvent.title}</DialogTitle>
              <DialogDescription>
                Lista de invitados registrados para este evento.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {guests.length === 0 ? (
                <p>No hay invitados registrados para este evento aún.</p>
              ) : (
                <div className="space-y-4">
                  {guests.map((guest) => (
                    <Card key={guest.id}>
                      <CardContent className="p-4">
                        <p className="font-semibold">{guest.name}</p>
                        <p className="text-sm text-gray-600">Email: {guest.email}</p>
                        {guest.dietary_conditions && guest.dietary_conditions.length > 0 && (
                          <p className="text-sm text-gray-600">Restricciones: {guest.dietary_conditions.join(", ")}</p>
                        )}
                        {selectedEvent && getDietaryMismatch(guest.dietary_conditions || [], selectedEvent.selected_services) && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertDescription className="text-sm">
                              ⚠️ Este invitado tiene restricciones alimenticias que podrían no estar cubiertas por los servicios de catering seleccionados.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}