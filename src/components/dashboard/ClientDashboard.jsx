import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { 
  Plus, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  Loader2,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useEvents } from '../../hooks/useEvents.js';
import DashboardStats from './DashboardStats.jsx';
import EventCard from './EventCard.jsx';
import { CONSTANTS } from '../../config.js';

const ClientDashboard = ({ onCreateEvent, onViewEvent, onEditEvent, onGenerateQR }) => {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { 
    events, 
    stats, 
    loading: eventsLoading, 
    error: eventsError,
    loadUserEvents,
    loadEventStats,
    deleteEvent,
    updateEventStatus,
    refresh,
    getUpcomingEvents,
    getPastEvents,
    getEventsByStatus
  } = useEvents();

  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [user, refresh]);

  // Filtrar eventos según criterios
  const getFilteredEvents = () => {
    let filteredEvents = events;

    // Filtrar por estado
    if (filterStatus !== 'all') {
      if (filterStatus === 'upcoming') {
        filteredEvents = getUpcomingEvents();
      } else if (filterStatus === 'past') {
        filteredEvents = getPastEvents();
      } else {
        filteredEvents = getEventsByStatus(filterStatus);
      }
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.event_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredEvents;
  };

  // Manejar eliminación de evento
  const handleDeleteEvent = async (event) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el evento "${event.title}"?`)) {
      const result = await deleteEvent(event.event_id);
      if (!result.error) {
        // Evento eliminado exitosamente
      }
    }
  };

  // Manejar cambio de estado de evento
  const handleStatusChange = async (eventId, newStatus) => {
    const result = await updateEventStatus(eventId, newStatus);
    if (!result.error) {
      // Estado actualizado exitosamente
    }
  };

  // Manejar cierre de sesión
  const handleSignOut = async () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await signOut();
    }
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Ktrin</h1>
              <span className="ml-2 text-sm text-gray-500">Dashboard</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hola, {profile?.full_name || user?.email}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={eventsLoading}
              >
                {eventsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                disabled={authLoading}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mostrar errores */}
        {eventsError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {eventsError}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="events">Eventos</TabsTrigger>
              <TabsTrigger value="calendar">Calendario</TabsTrigger>
            </TabsList>
            
            <Button onClick={onCreateEvent} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear Evento
            </Button>
          </div>

          {/* Tab: Resumen */}
          <TabsContent value="overview" className="space-y-6">
            {/* Estadísticas */}
            <DashboardStats stats={stats} loading={eventsLoading} />

            {/* Eventos recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Eventos Recientes</CardTitle>
                <CardDescription>
                  Tus últimos eventos creados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes eventos creados
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Comienza creando tu primer evento
                    </p>
                    <Button onClick={onCreateEvent}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Evento
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.slice(0, 6).map((event) => (
                      <EventCard
                        key={event.event_id}
                        event={event}
                        onView={onViewEvent}
                        onEdit={onEditEvent}
                        onDelete={handleDeleteEvent}
                        onGenerateQR={onGenerateQR}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Eventos */}
          <TabsContent value="events" className="space-y-6">
            {/* Filtros y búsqueda */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Búsqueda */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar eventos..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Filtro por estado */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los eventos</option>
                      <option value="upcoming">Próximos</option>
                      <option value="past">Pasados</option>
                      <option value={CONSTANTS.EVENT_STATUS.DRAFT}>Borradores</option>
                      <option value={CONSTANTS.EVENT_STATUS.CONFIRMED}>Confirmados</option>
                      <option value={CONSTANTS.EVENT_STATUS.COMPLETED}>Completados</option>
                      <option value={CONSTANTS.EVENT_STATUS.CANCELLED}>Cancelados</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de eventos */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron eventos
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Intenta cambiar los filtros de búsqueda'
                      : 'Comienza creando tu primer evento'
                    }
                  </p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <EventCard
                    key={event.event_id}
                    event={event}
                    onView={onViewEvent}
                    onEdit={onEditEvent}
                    onDelete={handleDeleteEvent}
                    onGenerateQR={onGenerateQR}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab: Calendario */}
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vista de Calendario</CardTitle>
                <CardDescription>
                  Próximamente: Vista de calendario interactiva
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    La vista de calendario estará disponible próximamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClientDashboard;

