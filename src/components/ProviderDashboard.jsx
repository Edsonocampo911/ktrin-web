import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  Music,
  Camera,
  Utensils,
  Flower
} from 'lucide-react'

const ProviderDashboard = ({ user, onLogout }) => {
  const [bookings, setBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Service categories mapping for provider types
  const serviceCategories = {
    'catering': { icon: <Utensils className="h-5 w-5" />, name: 'Catering y Comida' },
    'decoration': { icon: <Flower className="h-5 w-5" />, name: 'Decoración y Flores' },
    'entertainment': { icon: <Music className="h-5 w-5" />, name: 'Música y Entretenimiento' },
    'photography': { icon: <Camera className="h-5 w-5" />, name: 'Fotografía y Video' }
  }

  useEffect(() => {
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      // Fetch bookings for this provider
      // This assumes there's a provider_bookings table that links events to providers
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('provider_bookings')
        .select(`
          *,
          events (
            event_id,
            title,
            description,
            event_date,
            event_time,
            location_type,
            address,
            attendees_count,
            status,
            organizer_id,
            users (
              full_name,
              email
            )
          ),
          services (
            service_id,
            name,
            category,
            price
          )
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })

      if (bookingsError) {
        throw bookingsError
      }

      setBookings(bookingsData || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError(err.message || 'Error al cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('provider_bookings')
        .update({ status: newStatus })
        .eq('booking_id', bookingId)

      if (error) {
        throw error
      }

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.booking_id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        )
      )
    } catch (err) {
      console.error('Error updating booking status:', err)
      setError(err.message || 'Error al actualizar el estado de la reserva')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendiente</Badge>
      case 'confirmed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Confirmado</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rechazado</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Completado</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de proveedor...</p>
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
              <h1 className="text-xl font-semibold text-gray-900">Panel de Proveedor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Proveedor'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Reservas</p>
                  <p className="text-2xl font-semibold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Confirmadas</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Ingresos Est.</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${bookings
                      .filter(b => b.status === 'confirmed' || b.status === 'completed')
                      .reduce((sum, b) => sum + (b.services?.price || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>Calendario de Reservas</CardTitle>
            <CardDescription>
              Gestiona tus reservas y confirma tu disponibilidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tienes reservas aún</p>
                <p className="text-sm text-gray-400">Las nuevas reservas aparecerán aquí automáticamente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.booking_id} className="border-l-4 border-l-indigo-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(booking.status)}
                            <h3 className="font-semibold text-lg">{booking.events?.title}</h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(booking.events?.event_date)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(booking.events?.event_time)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>{booking.events?.attendees_count} invitados</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{booking.events?.address || 'Ubicación por confirmar'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {serviceCategories[booking.services?.category]?.icon || <Settings className="h-4 w-4" />}
                              <span>{booking.services?.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4" />
                              <span>${booking.services?.price?.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm text-gray-600">
                              <strong>Organizador:</strong> {booking.events?.users?.full_name} ({booking.events?.users?.email})
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                Ver Detalles
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalles de la Reserva</DialogTitle>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold">Información del Evento</h4>
                                    <p><strong>Nombre:</strong> {selectedBooking.events?.title}</p>
                                    <p><strong>Descripción:</strong> {selectedBooking.events?.description || 'Sin descripción'}</p>
                                    <p><strong>Fecha:</strong> {formatDate(selectedBooking.events?.event_date)}</p>
                                    <p><strong>Hora:</strong> {formatTime(selectedBooking.events?.event_time)}</p>
                                    <p><strong>Invitados:</strong> {selectedBooking.events?.attendees_count}</p>
                                    <p><strong>Ubicación:</strong> {selectedBooking.events?.address}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold">Servicio Solicitado</h4>
                                    <p><strong>Servicio:</strong> {selectedBooking.services?.name}</p>
                                    <p><strong>Categoría:</strong> {serviceCategories[selectedBooking.services?.category]?.name}</p>
                                    <p><strong>Precio:</strong> ${selectedBooking.services?.price?.toLocaleString()}</p>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold">Información del Organizador</h4>
                                    <p><strong>Nombre:</strong> {selectedBooking.events?.users?.full_name}</p>
                                    <p><strong>Email:</strong> {selectedBooking.events?.users?.email}</p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {booking.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => updateBookingStatus(booking.booking_id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirmar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => updateBookingStatus(booking.booking_id, 'rejected')}
                              >
                                Rechazar
                              </Button>
                            </div>
                          )}

                          {booking.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.booking_id, 'completed')}
                            >
                              Marcar Completado
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProviderDashboard

