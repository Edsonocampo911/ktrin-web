import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  AlertTriangle,
  Users,
  Utensils,
  CheckCircle,
  Clock,
  TrendingUp,
  PieChart,
  Bell,
  Shield,
  Heart,
  Info
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const DietaryDashboard = ({ event, user }) => {
  const [summary, setSummary] = useState(null)
  const [guests, setGuests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [menuAdjustments, setMenuAdjustments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (event?.event_id) {
      loadDietaryData()
    }
  }, [event])

  const loadDietaryData = async () => {
    try {
      setLoading(true)

      // Cargar resumen de condiciones alimenticias
      const { data: summaryData, error: summaryError } = await supabase
        .from('event_dietary_summary')
        .select('*')
        .eq('event_id', event.event_id)
        .single()

      if (summaryError && summaryError.code !== 'PGRST116') {
        console.error('Error loading summary:', summaryError)
      } else if (summaryData) {
        setSummary(summaryData)
      }

      // Cargar invitados con condiciones alimenticias
      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select('*')
        .eq('event_id', event.event_id)
        .not('dietary_restrictions', 'is', null)

      if (guestsError) {
        console.error('Error loading guests:', guestsError)
      } else {
        setGuests(guestsData || [])
      }

      // Cargar notificaciones alimenticias
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('dietary_notifications')
        .select('*')
        .eq('event_id', event.event_id)
        .order('created_at', { ascending: false })

      if (notificationsError) {
        console.error('Error loading notifications:', notificationsError)
      } else {
        setNotifications(notificationsData || [])
      }

      // Cargar ajustes de menú
      const { data: adjustmentsData, error: adjustmentsError } = await supabase
        .from('menu_adjustments')
        .select('*')
        .eq('event_id', event.event_id)
        .order('created_at', { ascending: false })

      if (adjustmentsError) {
        console.error('Error loading menu adjustments:', adjustmentsError)
      } else {
        setMenuAdjustments(adjustmentsData || [])
      }

    } catch (err) {
      console.error('Error loading dietary data:', err)
      setError('Error al cargar los datos de condiciones alimenticias')
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('dietary_notifications')
        .update({ 
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('notification_id', notificationId)

      if (error) throw error

      setNotifications(notifications.map(notif => 
        notif.notification_id === notificationId 
          ? { ...notif, status: 'acknowledged', acknowledged_at: new Date().toISOString() }
          : notif
      ))
    } catch (err) {
      console.error('Error acknowledging notification:', err)
    }
  }

  const approveMenuAdjustment = async (adjustmentId) => {
    try {
      const { error } = await supabase
        .from('menu_adjustments')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('adjustment_id', adjustmentId)

      if (error) throw error

      setMenuAdjustments(menuAdjustments.map(adj => 
        adj.adjustment_id === adjustmentId 
          ? { ...adj, status: 'approved', approved_at: new Date().toISOString() }
          : adj
      ))
    } catch (err) {
      console.error('Error approving menu adjustment:', err)
    }
  }

  const getSeverityBadge = (severity) => {
    const config = {
      alta: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Alta Prioridad', icon: AlertTriangle },
      media: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Media Prioridad', icon: Clock },
      baja: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Baja Prioridad', icon: CheckCircle }
    }
    
    const severityConfig = config[severity] || config.baja
    const IconComponent = severityConfig.icon
    
    return (
      <Badge className={`${severityConfig.color} border`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {severityConfig.text}
      </Badge>
    )
  }

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      acknowledged: { color: 'bg-blue-100 text-blue-800', text: 'Reconocido' },
      resolved: { color: 'bg-green-100 text-green-800', text: 'Resuelto' },
      proposed: { color: 'bg-purple-100 text-purple-800', text: 'Propuesto' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Aprobado' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rechazado' }
    }
    
    const statusConfig = config[status] || config.pending
    return (
      <Badge className={statusConfig.color}>
        {statusConfig.text}
      </Badge>
    )
  }

  const calculateInclusivityScore = () => {
    if (!summary || summary.total_guests === 0) return 0
    
    const baseScore = 70 // Puntuación base por tener el sistema
    const restrictionHandling = summary.guests_with_restrictions > 0 ? 20 : 0
    const severityHandling = summary.high_severity_count === 0 ? 10 : 0
    
    return Math.min(100, baseScore + restrictionHandling + severityHandling)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Selecciona un evento para ver el dashboard de condiciones alimenticias
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Utensils className="h-6 w-6" />
          Dashboard de Inclusividad - {event.title}
        </h2>
        <p className="text-gray-600 mt-1">
          Gestiona las condiciones alimenticias y asegura un evento inclusivo para todos
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invitados</p>
                <p className="text-2xl font-bold">{summary?.total_guests || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Con Restricciones</p>
                <p className="text-2xl font-bold text-orange-600">{summary?.guests_with_restrictions || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alta Prioridad</p>
                <p className="text-2xl font-bold text-red-600">{summary?.high_severity_count || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Puntuación Inclusividad</p>
                <p className="text-2xl font-bold text-green-600">{calculateInclusivityScore()}%</p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={calculateInclusivityScore()} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Alertas importantes */}
      {summary?.high_severity_count > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Hay {summary.high_severity_count} invitado(s) con condiciones alimenticias de alta prioridad. 
            Es crucial coordinar con los proveedores para asegurar opciones seguras.
          </AlertDescription>
        </Alert>
      )}

      {summary?.requires_special_catering && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Este evento requiere catering especializado debido a las condiciones alimenticias de los invitados.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs principales */}
      <Tabs defaultValue="guests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="guests">Invitados</TabsTrigger>
          <TabsTrigger value="notifications">
            Notificaciones
            {notifications.filter(n => n.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {notifications.filter(n => n.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="menu">Ajustes de Menú</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        {/* Tab de Invitados */}
        <TabsContent value="guests">
          <Card>
            <CardHeader>
              <CardTitle>Invitados con Condiciones Alimenticias</CardTitle>
              <CardDescription>
                Lista detallada de invitados que han reportado restricciones alimenticias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {guests.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay invitados con condiciones alimenticias reportadas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {guests.map((guest) => (
                    <div key={guest.guest_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{guest.first_name} {guest.last_name}</h4>
                          <p className="text-sm text-gray-600">{guest.email}</p>
                          
                          <div className="mt-3 space-y-2">
                            {guest.dietary_restrictions && (
                              <div>
                                <span className="text-sm font-medium">Restricciones: </span>
                                <span className="text-sm">{guest.dietary_restrictions}</span>
                              </div>
                            )}
                            
                            {guest.allergies && (
                              <div>
                                <span className="text-sm font-medium text-red-600">Alergias: </span>
                                <span className="text-sm">{guest.allergies}</span>
                              </div>
                            )}
                            
                            {guest.special_dietary_notes && (
                              <div>
                                <span className="text-sm font-medium">Notas especiales: </span>
                                <span className="text-sm">{guest.special_dietary_notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {getSeverityBadge(guest.dietary_severity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Notificaciones */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones de Condiciones Alimenticias
              </CardTitle>
              <CardDescription>
                Alertas sobre condiciones alimenticias que requieren atención
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay notificaciones</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.notification_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getSeverityBadge(notification.severity)}
                            {getStatusBadge(notification.status)}
                          </div>
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        
                        {notification.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => acknowledgeNotification(notification.notification_id)}
                          >
                            Reconocer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Ajustes de Menú */}
        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle>Ajustes de Menú Propuestos</CardTitle>
              <CardDescription>
                Revisa y aprueba las modificaciones de menú sugeridas por los proveedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {menuAdjustments.length === 0 ? (
                <div className="text-center py-8">
                  <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay ajustes de menú propuestos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {menuAdjustments.map((adjustment) => (
                    <div key={adjustment.adjustment_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{adjustment.dietary_condition}</Badge>
                            {getStatusBadge(adjustment.status)}
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Elemento original: </span>
                              <span className="text-sm">{adjustment.original_item}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Alternativa propuesta: </span>
                              <span className="text-sm">{adjustment.adjusted_item}</span>
                            </div>
                            {adjustment.adjustment_notes && (
                              <div>
                                <span className="text-sm font-medium">Notas: </span>
                                <span className="text-sm">{adjustment.adjustment_notes}</span>
                              </div>
                            )}
                            {adjustment.additional_cost > 0 && (
                              <div>
                                <span className="text-sm font-medium">Costo adicional: </span>
                                <span className="text-sm font-semibold text-green-600">
                                  ${adjustment.additional_cost}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {adjustment.status === 'proposed' && (
                          <div className="ml-4 space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveMenuAdjustment(adjustment.adjustment_id)}
                            >
                              Aprobar
                            </Button>
                            <Button size="sm" variant="outline">
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Análisis */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribución por Severidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alta Prioridad</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ 
                            width: `${summary?.total_guests > 0 ? (summary.high_severity_count / summary.total_guests) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{summary?.high_severity_count || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Media Prioridad</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ 
                            width: `${summary?.total_guests > 0 ? (summary.medium_severity_count / summary.total_guests) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{summary?.medium_severity_count || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Baja Prioridad</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ 
                            width: `${summary?.total_guests > 0 ? (summary.low_severity_count / summary.total_guests) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{summary?.low_severity_count || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary?.high_severity_count > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Coordina inmediatamente con proveedores para condiciones de alta prioridad
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {summary?.requires_special_catering && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Considera contratar un proveedor especializado en alimentación inclusiva
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Tu puntuación de inclusividad es {calculateInclusivityScore()}%. 
                      {calculateInclusivityScore() >= 90 ? '¡Excelente trabajo!' : 'Hay oportunidades de mejora.'}
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alertas de error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default DietaryDashboard

