import { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users, DollarSign, Eye, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const EventCalendar = ({ userType = "provider" }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [viewMode, setViewMode] = useState('month') // month, week, day
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Datos de ejemplo de eventos
  useEffect(() => {
    const sampleEvents = [
      {
        id: 1,
        title: "Boda de María y Carlos",
        date: new Date(2025, 6, 15), // 15 de julio
        time: "18:00",
        location: "Salón de Eventos El Jardín",
        attendees: 120,
        status: "confirmado",
        type: "boda",
        budget: 15000,
        services: ["Catering", "Decoración", "Fotografía"],
        description: "Celebración de boda con cena y baile",
        contact: "maria.gonzalez@email.com",
        isPast: false
      },
      {
        id: 2,
        title: "Cumpleaños de Ana",
        date: new Date(2025, 6, 8), // 8 de julio
        time: "16:00",
        location: "Casa de Ana",
        attendees: 25,
        status: "pendiente",
        type: "cumpleanos",
        budget: 3500,
        services: ["Catering", "Animación"],
        description: "Fiesta de cumpleaños infantil",
        contact: "ana.rodriguez@email.com",
        isPast: false
      },
      {
        id: 3,
        title: "Evento Corporativo TechCorp",
        date: new Date(2025, 5, 20), // 20 de junio (pasado)
        time: "14:00",
        location: "Hotel Intercontinental",
        attendees: 80,
        status: "completado",
        type: "corporativo",
        budget: 8000,
        services: ["Catering", "Sonido", "Proyección"],
        description: "Conferencia anual de la empresa",
        contact: "eventos@techcorp.com",
        isPast: true
      },
      {
        id: 4,
        title: "Graduación Universidad Nacional",
        date: new Date(2025, 7, 15), // 15 de agosto
        time: "10:00",
        location: "Auditorio Principal",
        attendees: 200,
        status: "confirmado",
        type: "graduacion",
        budget: 12000,
        services: ["Catering", "Sonido", "Decoración"],
        description: "Ceremonia de graduación con almuerzo",
        contact: "graduacion@uni.edu.py",
        isPast: false
      },
      {
        id: 5,
        title: "Aniversario Empresa ABC",
        date: new Date(2025, 4, 10), // 10 de mayo (pasado)
        time: "19:00",
        location: "Club de Campo",
        attendees: 150,
        status: "completado",
        type: "aniversario",
        budget: 18000,
        services: ["Catering", "Música", "Decoración", "Fotografía"],
        description: "Celebración 25 años de la empresa",
        contact: "rrhh@empresaabc.com",
        isPast: true
      }
    ]
    setEvents(sampleEvents)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800'
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      case 'completado': return 'bg-blue-100 text-blue-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'boda': return 'bg-pink-100 text-pink-800'
      case 'cumpleanos': return 'bg-purple-100 text-purple-800'
      case 'corporativo': return 'bg-blue-100 text-blue-800'
      case 'graduacion': return 'bg-green-100 text-green-800'
      case 'aniversario': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({ date: nextDate, isCurrentMonth: false })
    }
    
    return days
  }

  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + (direction * 7))
      return newDate
    })
  }

  const navigateDay = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + direction)
      return newDate
    })
  }

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Lunes como primer día
    startOfWeek.setDate(diff)

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDays.push(day)
    }
    return weekDays
  }

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate)
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

    return (
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day.date)
          const isToday = day.date.toDateString() === new Date().toDateString()
          
          return (
            <div
              key={index}
              className={`min-h-[100px] p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
              onClick={() => setSelectedDate(day.date)}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                {day.date.getDate()}
              </div>
              <div className="space-y-1 mt-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate cursor-pointer ${getStatusColor(event.status)}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedEvent(event)
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} más
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate)
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="grid grid-cols-8 gap-1">
        <div className="p-2"></div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="p-2 text-center border-b">
            <div className="font-medium">{day.toLocaleDateString('es-ES', { weekday: 'short' })}</div>
            <div className={`text-lg ${day.toDateString() === new Date().toDateString() ? 'text-blue-600 font-bold' : ''}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
        
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="p-2 text-sm text-gray-500 border-r">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map(day => {
              const dayEvents = getEventsForDate(day).filter(event => {
                const eventHour = parseInt(event.time.split(':')[0])
                return eventHour === hour
              })
              
              return (
                <div key={`${day.toISOString()}-${hour}`} className="min-h-[60px] p-1 border border-gray-100">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded mb-1 cursor-pointer ${getStatusColor(event.status)}`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-75">{event.time}</div>
                    </div>
                  ))}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    )
  }

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate).sort((a, b) => a.time.localeCompare(b.time))
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{formatDate(currentDate)}</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-1">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(event => {
              const eventHour = parseInt(event.time.split(':')[0])
              return eventHour === hour
            })
            
            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-20 p-2 text-sm text-gray-500 border-r">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 min-h-[60px] p-2">
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      className={`p-2 rounded mb-2 cursor-pointer ${getStatusColor(event.status)}`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm opacity-75 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {event.time}
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderEventDetails = () => {
    if (!selectedEvent) return null

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {selectedEvent.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge className={getStatusColor(selectedEvent.status)}>
              {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
            </Badge>
            <Badge className={getTypeColor(selectedEvent.type)}>
              {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
            </Badge>
            {selectedEvent.isPast && (
              <Badge variant="outline">Evento Pasado</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{formatDate(selectedEvent.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{selectedEvent.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{selectedEvent.attendees} invitados</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span>{formatCurrency(selectedEvent.budget)}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Contacto:</div>
                <div>{selectedEvent.contact}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500 mb-2">Servicios Contratados:</div>
            <div className="flex flex-wrap gap-2">
              {selectedEvent.services.map((service, index) => (
                <Badge key={index} variant="outline">{service}</Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Descripción:</div>
            <p className="text-sm">{selectedEvent.description}</p>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button size="sm" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Ver Detalles
            </Button>
            {!selectedEvent.isPast && (
              <>
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    )
  }

  const pastEvents = events.filter(event => event.isPast)
  const upcomingEvents = events.filter(event => !event.isPast)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Calendario de Eventos
        </h2>
        
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList>
              <TabsTrigger value="month">Mes</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="day">Día</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {viewMode === 'month' && currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              {viewMode === 'week' && `Semana del ${getWeekDays(currentDate)[0].getDate()} al ${getWeekDays(currentDate)[6].getDate()} de ${currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`}
              {viewMode === 'day' && formatDate(currentDate)}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'month') navigateMonth(-1)
                  else if (viewMode === 'week') navigateWeek(-1)
                  else navigateDay(-1)
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoy
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'month') navigateMonth(1)
                  else if (viewMode === 'week') navigateWeek(1)
                  else navigateDay(1)
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </CardContent>
      </Card>

      {/* Resumen de eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Eventos ({upcomingEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.slice(0, 5).map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-gray-500">
                      {event.date.toLocaleDateString('es-ES')} - {event.time}
                    </div>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay eventos próximos</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eventos Pasados ({pastEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastEvents.slice(0, 5).map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-gray-500">
                      {event.date.toLocaleDateString('es-ES')} - {event.time}
                    </div>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
              ))}
              {pastEvents.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay eventos pasados</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para detalles del evento */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        {renderEventDetails()}
      </Dialog>
    </div>
  )
}

export default EventCalendar

