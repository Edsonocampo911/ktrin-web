import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Settings,
  Bell,
  LogOut,
  PartyPopper,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const ClientDashboardV2 = ({ user, onLogout }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalGuests: 0,
    totalBudget: 0,
    upcomingEvents: 0
  })

  useEffect(() => {
    fetchEvents()
  }, [user])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_services (
            service_id,
            services (
              name,
              price
            )
          )
        `)
        .eq('organizer_id', user.user_id)
        .order('event_date', { ascending: false })

      if (eventsError) {
        throw eventsError
      }

      setEvents(eventsData || [])
      
      // Calcular estadísticas
      const totalEvents = eventsData?.length || 0
      const totalGuests = eventsData?.reduce((sum, event) => sum + (event.attendees_count || 0), 0) || 0
      const totalBudget = eventsData?.reduce((sum, event) => sum + (event.budget || 0), 0) || 0
      const upcomingEvents = eventsData?.filter(event => new Date(event.event_date) > new Date()).length || 0

      setStats({
        totalEvents,
        totalGuests,
        totalBudget,
        upcomingEvents
      })

    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Error al cargar los eventos')
    } finally {
      setLoading(false)
    }
  }

  const getEventStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' },
      confirmed: { label: 'Confirmado', variant: 'default' },
      in_progress: { label: 'En Progreso', variant: 'default' },
      completed: { label: 'Completado', variant: 'outline' },
      cancelled: { label: 'Cancelado', variant: 'destructive' }
    }

    const config = statusConfig[status] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString ? new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }) : ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard del Organizador (V2)</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Hola, {user.full_name || user.email}!
          </h2>
          <p className="text-gray-600">
            Gestiona tus eventos y conecta con los mejores proveedores
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-indigo-600" />
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
                  <p className="text-2xl font-bold text-gray-900">${stats.totalBudget.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <PartyPopper className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Próximo Evento</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.upcomingEvents > 0 ? `${stats.upcomingEvents}` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events List */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Mis Eventos</h3>
              <div className="space-x-2">
                <Link to="/create-event">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Evento (Original)
                  </Button>
                </Link>
                <Link to="/create-event-v2">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Evento (V2)
                  </Button>
                </Link>
              </div>
            </div>

            {events.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <PartyPopper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes eventos creados
                  </h4>
                  <p className="text-gray-600 mb-4">
                    ¡Crea tu primer evento ahora!
                  </p>
                  <div className="space-x-2">
                    <Link to="/create-event">
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Evento (Original)
                      </Button>
                    </Link>
                    <Link to="/create-event-v2">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Evento (V2 - Recomendado)
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.event_id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {event.title}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {event.description}
                          </p>
                        </div>
                        {getEventStatusBadge(event.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(event.event_date)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatTime(event.event_time)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {event.attendees_count} invitados
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          ${event.budget?.toLocaleString() || '0'}
                        </div>
                      </div>

                      {event.address && (
                        <div className="flex items-center text-gray-600 text-sm mt-2">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.address}
                        </div>
                      )}

                      {event.event_services && event.event_services.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Servicios:</p>
                          <div className="flex flex-wrap gap-2">
                            {event.event_services.map((eventService, index) => (
                              <Badge key={index} variant="outline">
                                {eventService.services?.name || 'Servicio'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/create-event-v2" className="block">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nuevo Evento (V2)
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Buscar Proveedores
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Ver Mensajes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="text-sm">
                      <p className="font-medium">Proveedor confirmó servicio</p>
                      <p className="text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <div className="text-sm">
                      <p className="font-medium">Nuevo mensaje de proveedor</p>
                      <p className="text-gray-500">Hace 4 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div className="text-sm">
                      <p className="font-medium">Evento creado exitosamente</p>
                      <p className="text-gray-500">Hace 1 día</p>
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

export default ClientDashboardV2

