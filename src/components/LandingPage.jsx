import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users, 
  Star, 
  MessageCircle, 
  CreditCard, 
  Bell,
  PartyPopper,
  Sparkles,
  Heart,
  Gift
} from 'lucide-react'

const LandingPage = () => {
  const [userType, setUserType] = useState(null)

  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-indigo-600" />,
      title: "Planificación Inteligente",
      description: "Organiza eventos de manera eficiente con nuestras herramientas intuitivas"
    },
    {
      icon: <Users className="h-8 w-8 text-pink-600" />,
      title: "Red de Proveedores",
      description: "Conecta con los mejores proveedores verificados en tu zona"
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-indigo-600" />,
      title: "Chat Integrado",
      description: "Comunícate directamente con proveedores y colaboradores"
    },
    {
      icon: <CreditCard className="h-8 w-8 text-pink-600" />,
      title: "Pagos Seguros",
      description: "Divide costos y realiza pagos de forma segura y transparente"
    },
    {
      icon: <Star className="h-8 w-8 text-indigo-600" />,
      title: "Sistema de Calificaciones",
      description: "Evalúa y encuentra los mejores servicios basados en reseñas reales"
    },
    {
      icon: <Bell className="h-8 w-8 text-pink-600" />,
      title: "Notificaciones",
      description: "Mantente al día con actualizaciones en tiempo real"
    }
  ]

  const eventTypes = [
    { name: "Cumpleaños", icon: <Heart className="h-4 w-4" />, color: "bg-pink-100 text-pink-800" },
    { name: "Bodas", icon: <Sparkles className="h-4 w-4" />, color: "bg-purple-100 text-purple-800" },
    { name: "Corporativos", icon: <Gift className="h-4 w-4" />, color: "bg-blue-100 text-blue-800" },
    { name: "Graduaciones", icon: <Star className="h-4 w-4" />, color: "bg-yellow-100 text-yellow-800" },
    { name: "Aniversarios", icon: <Heart className="h-4 w-4" />, color: "bg-red-100 text-red-800" },
    { name: "Fiestas", icon: <PartyPopper className="h-4 w-4" />, color: "bg-green-100 text-green-800" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Ktrin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Organiza eventos
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
                {" "}únicos
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Planifica, gestiona y disfruta de eventos únicos con nuestra plataforma integral.
            </p>
            
            {/* User Type Selection */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card 
                className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${
                  userType === 'client' ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                }`}
                onClick={() => setUserType('client')}
              >
                <CardHeader className="text-center">
                  <Calendar className="h-12 w-12 text-indigo-600 mx-auto mb-2" />
                  <CardTitle>Soy Organizador</CardTitle>
                  <CardDescription>Quiero organizar un evento</CardDescription>
                </CardHeader>
              </Card>
              
              <Card 
                className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${
                  userType === 'provider' ? 'ring-2 ring-pink-500 bg-pink-50' : ''
                }`}
                onClick={() => setUserType('provider')}
              >
                <CardHeader className="text-center">
                  <Users className="h-12 w-12 text-pink-600 mx-auto mb-2" />
                  <CardTitle>Soy Proveedor</CardTitle>
                  <CardDescription>Ofrezco servicios para eventos</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {userType && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <Link to="/register" state={{ userType }}>
                  <Button size="lg" className="text-lg px-8 py-3">
                    Comenzar como {userType === 'client' ? 'Organizador' : 'Proveedor'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tipos de Eventos
            </h2>
            <p className="text-lg text-gray-600">
              Organizamos todo tipo de celebraciones y eventos especiales
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {eventTypes.map((type, index) => (
              <Badge key={index} variant="secondary" className={`${type.color} px-4 py-2 text-sm font-medium`}>
                <span className="flex items-center gap-2">
                  {type.icon}
                  {type.name}
                </span>
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Ktrin?
            </h2>
            <p className="text-lg text-gray-600">
              Herramientas poderosas para hacer de tu evento una experiencia inolvidable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para crear tu próximo evento?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Únete a miles de organizadores y proveedores que confían en Ktrin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" state={{ userType: 'client' }}>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Organizar Evento
              </Button>
            </Link>
            <Link to="/register" state={{ userType: 'provider' }}>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-indigo-600">
                Ofrecer Servicios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-indigo-400 mb-4">Ktrin</h3>
            <p className="text-gray-400 mb-4">
              Conectando organizadores de eventos con los mejores proveedores
            </p>
            <p className="text-sm text-gray-500">
              © 2025 Ktrin. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

