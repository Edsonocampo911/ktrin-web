import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Users,
  DollarSign,
  Plus,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  MessageSquare,
  Settings
} from 'lucide-react'

const ClientDashboardV3 = ({ user }) => {
  const navigate = useNavigate()
  
  // Estados
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalGuests: 0,
    totalBudget: 0,
    upcomingEvents: 0
  })

  // Cargar eventos del usuario
  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError('')

      if (!user?.id) {
        throw new Error('Usuario no autenticado')
      }

      // Obtener eventos del usuario con servicios asociados
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_services (
            service_id,
            services (
              name,
              price,
              category
            )
          )
        `)
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })

      if (eventsError) {
        throw eventsError
      }

      console.log('Eventos cargados:', eventsData)
      setEvents(eventsData || [])

      // Calcular estadísticas
      if (eventsData && eventsData.length > 0) {
        const totalEvents = eventsData.length
        const totalGuests = eventsData.reduce((sum, event) => sum + (event.invited_guests || 0), 0)
        const totalBudget = eventsData.reduce((sum, event) => sum + (parseFloat(event.estimated_cost) || 0), 0)
        
        // Eventos próximos (fecha futura)
        const today = new Date().toISOString().split('T')[0]
        const upcomingEvents = eventsData.filter(event => event.event_date >= today).length

        setStats({
          totalEvents,
          totalGuests,
          totalBudget,
          upcomingEvents
        })
      } else {
        setStats({
          totalEvents: 0,
          totalGuests: 0,
          totalBudget: 0,
          upcomingEvents: 0
        })
      }

    } catch (err) {
      console.error('Error al cargar eventos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [user])

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Formatear hora
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Determinar estado del evento
  const getEventStatus = (eventDate) => {
    const today = new Date().toISOString().split('T')[0]
    const eventDateObj = new Date(eventDate)
    const todayObj = new Date(today)

    if (eventDateObj > todayObj) {
      return { status: 'upcoming', label: 'Próximo', variant: 'default' }
    } else if (eventDateObj.toDateString() === todayObj.toDateString()) {
      return { status: 'today', label: 'Hoy', variant: 'destructive' }
    } else {
      return { status: 'past', label: 'Pasado', variant: 'secondary' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ¡Hola, {user?.user_metadata?.full_name || user?.email}!
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona tus eventos y conecta con los mejores proveedores
              </p>
            </div>
            <div className="flex space-x-3">
              <Button asChild>
                <Link to="/create-event-v3">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Evento
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mensajes de error */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Eventos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Invitados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Presupuesto Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.totalBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Próximo Evento</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.upcomingEvents > 0 ? stats.upcomingEvents : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de eventos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mis Eventos</span>
                  <Button asChild size="sm">
                    <Link to="/create-event-v3">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Evento
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes eventos creados
                    </h3>
                    <p className="text-gray-600 mb-6">
                      ¡Crea tu primer evento ahora!
                    </p>
                    <Button asChild>
                      <Link to="/create-event-v3">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Nuevo Evento
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => {
                      const eventStatus = getEventStatus(event.event_date)
                      return (
                        <div
                          key={event.event_id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                <Badge variant={eventStatus.variant}>
                                  {eventStatus.label}
                                </Badge>
                              </div>
                              
                              {event.description && (
                                <p className="text-gray-600 mb-3">{event.description}</p>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {formatDate(event.event_date)}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Clock className="h-4 w-4 mr-2" />
                                  {formatTime(event.event_time)}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {event.location}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Users className="h-4 w-4 mr-2" />
                                  {event.invited_guests} invitados
                                </div>
                              </div>

                              {/* Servicios */}
                              {event.event_services && event.event_services.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Servicios:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {event.event_services.map((eventService, index) => (
                                      <Badge key={index} variant="outline">
                                        {eventService.services?.name || 'Servicio desconocido'}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-lg font-semibold text-green-600">
                                  ${parseFloat(event.estimated_cost || 0).toLocaleString()}
                                </span>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    Ver Detalles
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    Gestionar Invitados
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Acciones rápidas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full" variant="outline">
                  <Link to="/create-event-v3">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nuevo Evento
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/search-providers">
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Proveedores
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ver Mensajes
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Actividad reciente */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Proveedor confirmó servicio</p>
                      <p className="text-xs text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Nuevo mensaje de proveedor</p>
                      <p className="text-xs text-gray-500">Hace 1 día</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Invitado confirmó asistencia</p>
                      <p className="text-xs text-gray-500">Hace 2 días</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboardV3

