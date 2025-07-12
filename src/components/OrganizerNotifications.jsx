import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Calendar,
  Heart,
  Leaf,
  Shield,
  X,
  Eye,
  Users
} from 'lucide-react'

const OrganizerNotifications = ({ eventId = null, onNotificationAction = null }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showAll, setShowAll] = useState(false)

  // Datos de ejemplo de notificaciones
  const sampleNotifications = [
    {
      id: 1,
      type: 'dietary_condition',
      severity: 'alta',
      guestName: 'Ana García',
      guestEmail: 'ana.garcia@email.com',
      conditions: ['celiac', 'nut_allergy'],
      customCondition: '',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
      isRead: false,
      eventName: 'Fiesta de Graduación'
    },
    {
      id: 2,
      type: 'dietary_condition',
      severity: 'media',
      guestName: 'Carlos Mendoza',
      guestEmail: 'carlos.mendoza@email.com',
      conditions: ['lactose_intolerant', 'halal'],
      customCondition: '',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
      isRead: false,
      eventName: 'Fiesta de Graduación'
    },
    {
      id: 3,
      type: 'dietary_condition',
      severity: 'baja',
      guestName: 'Laura Rodríguez',
      guestEmail: 'laura.rodriguez@email.com',
      conditions: ['vegan'],
      customCondition: 'Prefiere productos orgánicos cuando sea posible',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 horas atrás
      isRead: true,
      eventName: 'Fiesta de Graduación'
    },
    {
      id: 4,
      type: 'dietary_condition',
      severity: 'alta',
      guestName: 'Miguel Torres',
      guestEmail: 'miguel.torres@email.com',
      conditions: ['diabetes'],
      customCondition: 'Necesita opciones sin azúcar añadido',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 horas atrás
      isRead: true,
      eventName: 'Fiesta de Graduación'
    }
  ]

  useEffect(() => {
    // Simular carga de notificaciones
    setNotifications(sampleNotifications)
    setUnreadCount(sampleNotifications.filter(n => !n.isRead).length)
  }, [])

  const dietaryConditions = {
    celiac: {
      name: 'Celiaquía',
      description: 'Intolerancia al gluten',
      severity: 'alta',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800'
    },
    diabetes: {
      name: 'Diabetes',
      description: 'Control de azúcar en sangre',
      severity: 'alta',
      icon: <Heart className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800'
    },
    lactose_intolerant: {
      name: 'Intolerancia a la Lactosa',
      description: 'No puede consumir lácteos',
      severity: 'media',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'bg-yellow-100 text-yellow-800'
    },
    nut_allergy: {
      name: 'Alergia a Frutos Secos',
      description: 'Alergia severa a nueces y almendras',
      severity: 'alta',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800'
    },
    vegan: {
      name: 'Veganismo',
      description: 'No consume productos de origen animal',
      severity: 'baja',
      icon: <Leaf className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800'
    },
    vegetarian: {
      name: 'Vegetarianismo',
      description: 'No consume carne ni pescado',
      severity: 'baja',
      icon: <Leaf className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800'
    },
    halal: {
      name: 'Halal',
      description: 'Alimentación según preceptos islámicos',
      severity: 'media',
      icon: <Shield className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800'
    },
    kosher: {
      name: 'Kosher',
      description: 'Alimentación según preceptos judíos',
      severity: 'media',
      icon: <Shield className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'alta':
        return 'border-red-500 bg-red-50'
      case 'media':
        return 'border-yellow-500 bg-yellow-50'
      case 'baja':
        return 'border-green-500 bg-green-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'alta':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'media':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'baja':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    const notification = notifications.find(n => n.id === notificationId)
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`
    } else if (hours < 24) {
      return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`
    } else {
      return `Hace ${days} día${days !== 1 ? 's' : ''}`
    }
  }

  const getConditionSummary = () => {
    const conditionCounts = {}
    notifications.forEach(notification => {
      notification.conditions.forEach(conditionId => {
        conditionCounts[conditionId] = (conditionCounts[conditionId] || 0) + 1
      })
    })
    return conditionCounts
  }

  const conditionSummary = getConditionSummary()
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header con resumen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-6 w-6 mr-2 text-purple-600" />
              <div>
                <CardTitle>Notificaciones de Condiciones Alimenticias</CardTitle>
                <CardDescription>
                  Invitados que han reportado restricciones dietéticas
                </CardDescription>
              </div>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount} nuevas
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(conditionSummary).length > 0 ? (
            <div>
              <h4 className="font-semibold mb-3">Resumen de Condiciones:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(conditionSummary).map(([conditionId, count]) => {
                  const condition = dietaryConditions[conditionId]
                  if (!condition) return null
                  
                  return (
                    <Badge key={conditionId} className={condition.color}>
                      {condition.icon}
                      <span className="ml-1">{condition.name} ({count})</span>
                    </Badge>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No hay condiciones alimenticias reportadas aún</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de notificaciones */}
      {notifications.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Notificaciones Recientes</h3>
            {notifications.length > 5 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Mostrar menos' : `Ver todas (${notifications.length})`}
              </Button>
            )}
          </div>

          {displayedNotifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`transition-all ${getSeverityColor(notification.severity)} ${
                !notification.isRead ? 'ring-2 ring-purple-200' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getSeverityIcon(notification.severity)}
                      <div className="ml-2">
                        <h4 className="font-semibold">
                          {notification.guestName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {notification.guestEmail}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Badge className="ml-2 bg-purple-500 text-white text-xs">
                          Nuevo
                        </Badge>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">Condiciones reportadas:</p>
                      <div className="flex flex-wrap gap-1">
                        {notification.conditions.map(conditionId => {
                          const condition = dietaryConditions[conditionId]
                          if (!condition) return null
                          
                          return (
                            <Badge key={conditionId} className={condition.color}>
                              {condition.icon}
                              <span className="ml-1">{condition.name}</span>
                            </Badge>
                          )
                        })}
                      </div>
                    </div>

                    {notification.customCondition && (
                      <div className="mb-3">
                        <p className="text-sm font-medium">Condición adicional:</p>
                        <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                          {notification.customCondition}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTimestamp(notification.timestamp)}</span>
                      <span>{notification.eventName}</span>
                    </div>
                  </div>

                  <div className="flex space-x-1 ml-4">
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                        title="Marcar como leído"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissNotification(notification.id)}
                      title="Descartar notificación"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recomendaciones */}
      {Object.keys(conditionSummary).length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.keys(conditionSummary).some(id => dietaryConditions[id]?.severity === 'alta') && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    <strong>Atención:</strong> Hay invitados con condiciones alimenticias de alta severidad. 
                    Contacta a tus proveedores de catering inmediatamente para asegurar opciones seguras.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-sm text-blue-700">
                <h4 className="font-semibold mb-2">Acciones sugeridas:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Contacta a tu proveedor de catering para ajustar el menú</li>
                  <li>Solicita etiquetas claras en todos los alimentos</li>
                  <li>Considera tener opciones separadas para alergias severas</li>
                  <li>Informa al personal del evento sobre las restricciones</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default OrganizerNotifications

