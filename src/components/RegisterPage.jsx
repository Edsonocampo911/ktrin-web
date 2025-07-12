import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, ArrowLeft, Calendar, Users } from 'lucide-react'
import { supabase } from '../supabaseClient'

const RegisterPage = ({ setUser }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const initialUserType = location.state?.userType || 'client'
  
  const [userType, setUserType] = useState(initialUserType)
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Campos específicos para proveedores (mantenerlos en el estado para el formulario)
    businessName: '',
    description: '',
    coverageArea: '',
    serviceCategory: '',
    // Condiciones alimenticias
    hasAllergies: false,
    allergies: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDiabetic: false,
    otherDietaryRestrictions: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const serviceCategories = [
    'Catering y Comida',
    'Decoración y Flores',
    'Música y Entretenimiento',
    'Fotografía y Video',
    'Transporte',
    'Venues y Locaciones',
    'Planificación de Eventos',
    'Otros Servicios'
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    })
    setError('')
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    if (userType === 'provider' && !formData.businessName) {
      setError('El nombre comercial es requerido para proveedores')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Prepare data for insertion into 'users' table
        const userInsertData = {
          user_id: authData.user.id, // Use Supabase user ID
          email: formData.email,
          first_name: formData.name,
          last_name: formData.lastName,
          user_type: userType,
          phone: formData.phone,
          // Condiciones alimenticias
          has_allergies: formData.hasAllergies,
          allergies: formData.allergies || null,
          is_vegetarian: formData.isVegetarian,
          is_vegan: formData.isVegan,
          is_gluten_free: formData.isGlutenFree,
          is_diabetic: formData.isDiabetic,
          other_dietary_restrictions: formData.otherDietaryRestrictions || null
        };

        // Add provider-specific fields only if user is a provider
        if (userType === 'provider') {
          userInsertData.company_name = formData.businessName;
          userInsertData.description = formData.description;
          userInsertData.coverage_area = formData.coverageArea; // Now this column exists
          userInsertData.service_category = formData.serviceCategory; // Now this column exists
        }

        const { error: insertError } = await supabase
          .from('users')
          .insert(userInsertData);

        if (insertError) {
          throw insertError;
        }

        const userData = {
          id: authData.user.id,
          email: formData.email,
          name: `${formData.name} ${formData.lastName}`,
          type: userType,
          businessName: formData.businessName || null
        }
        
        setUser(userData)
        
        // Redirigir según el tipo de usuario
        if (userType === 'provider') {
          navigate('/dashboard/provider')
        } else {
          navigate('/dashboard/client')
        }
      } else {
        throw new Error('No se pudo crear el usuario en Supabase.');
      }

    } catch (err) {
      console.error('Error al registrar usuario:', err);
      setError(err.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Crear Cuenta
            </CardTitle>
            <CardDescription>
              Únete a la comunidad de Ktrin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* User Type Selection */}
            <div className="mb-6">
              <Label className="text-base font-medium">Tipo de cuenta</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Card 
                  className={`cursor-pointer transition-all ${userType === 'client' ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:shadow-md'}`}
                  onClick={() => setUserType('client')}
                >
                  <CardHeader className="text-center py-4">
                    <Calendar className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <CardTitle className="text-sm">Organizador</CardTitle>
                    <CardDescription className="text-xs">Organizo eventos</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${userType === 'provider' ? 'ring-2 ring-pink-500 bg-pink-50' : 'hover:shadow-md'}`}
                  onClick={() => setUserType('provider')}
                >
                  <CardHeader className="text-center py-4">
                    <Users className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <CardTitle className="text-sm">Proveedor</CardTitle>
                    <CardDescription className="text-xs">Ofrezco servicios</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Información personal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Tu apellido"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Campos específicos para proveedores */}
              {userType === 'provider' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nombre Comercial</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      placeholder="Nombre de tu negocio"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceCategory">Categoría de Servicio</Label>
                    <Select onValueChange={(value) => handleSelectChange('serviceCategory', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverageArea">Zona de Cobertura</Label>
                    <Input
                      id="coverageArea"
                      name="coverageArea"
                      placeholder="Ciudad, región o área que cubres"
                      value={formData.coverageArea}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción de Servicios</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe los servicios que ofreces..."
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Condiciones Alimenticias */}
              <div className="space-y-4 border-t pt-4">
                <Label className="text-base font-medium">Condiciones Alimenticias (Opcional)</Label>
                <p className="text-sm text-gray-600">Esta información nos ayuda a crear eventos más inclusivos</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isVegetarian"
                      checked={formData.isVegetarian}
                      onChange={(e) => setFormData({...formData, isVegetarian: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isVegetarian" className="text-sm">Vegetariano</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isVegan"
                      checked={formData.isVegan}
                      onChange={(e) => setFormData({...formData, isVegan: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isVegan" className="text-sm">Vegano</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isGlutenFree"
                      checked={formData.isGlutenFree}
                      onChange={(e) => setFormData({...formData, isGlutenFree: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isGlutenFree" className="text-sm">Sin Gluten</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDiabetic"
                      checked={formData.isDiabetic}
                      onChange={(e) => setFormData({...formData, isDiabetic: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isDiabetic" className="text-sm">Diabético</Label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasAllergies"
                    checked={formData.hasAllergies}
                    onChange={(e) => setFormData({...formData, hasAllergies: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="hasAllergies" className="text-sm">Tengo alergias alimentarias</Label>
                </div>
                
                {formData.hasAllergies && (
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Especifica tus alergias</Label>
                    <Textarea
                      id="allergies"
                      name="allergies"
                      placeholder="Ej: nueces, mariscos, lácteos..."
                      value={formData.allergies}
                      onChange={handleChange}
                      rows={2}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="otherDietaryRestrictions">Otras restricciones alimentarias</Label>
                  <Textarea
                    id="otherDietaryRestrictions"
                    name="otherDietaryRestrictions"
                    placeholder="Cualquier otra restricción o preferencia alimentaria..."
                    value={formData.otherDietaryRestrictions}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>
              </div>

              {/* Contraseñas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage


