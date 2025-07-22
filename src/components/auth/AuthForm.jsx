import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Loader2, Eye, EyeOff, Mail, Lock, User, Phone, Building } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { CONSTANTS } from '../../config.js';

const AuthForm = () => {
  const { signIn, signUp, resetPassword, loading, error, clearError } = useAuth();
  
  // Estados del formulario
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Estados de los formularios
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  });
  
  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    userType: '',
    businessName: '',
    businessDescription: ''
  });
  
  const [resetForm, setResetForm] = useState({
    email: ''
  });

  // Validaciones
  const validateSignIn = () => {
    if (!signInForm.email || !signInForm.password) {
      return 'Todos los campos son requeridos';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInForm.email)) {
      return 'Email inválido';
    }
    return null;
  };

  const validateSignUp = () => {
    if (!signUpForm.email || !signUpForm.password || !signUpForm.confirmPassword || 
        !signUpForm.fullName || !signUpForm.userType) {
      return 'Todos los campos marcados con * son requeridos';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpForm.email)) {
      return 'Email inválido';
    }
    if (signUpForm.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (signUpForm.password !== signUpForm.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    if (signUpForm.userType === CONSTANTS.USER_TYPE.PROVIDER && !signUpForm.businessName) {
      return 'El nombre del negocio es requerido para proveedores';
    }
    return null;
  };

  // Manejadores de eventos
  const handleSignIn = async (e) => {
    e.preventDefault();
    clearError();
    
    const validationError = validateSignIn();
    if (validationError) {
      return;
    }

    const result = await signIn(signInForm.email, signInForm.password);
    
    if (!result.error) {
      // El redirect se manejará en el componente padre
      console.log('Inicio de sesión exitoso');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    clearError();
    
    const validationError = validateSignUp();
    if (validationError) {
      return;
    }

    const userData = {
      full_name: signUpForm.fullName,
      phone: signUpForm.phone,
      user_type: signUpForm.userType,
      business_name: signUpForm.userType === CONSTANTS.USER_TYPE.PROVIDER ? signUpForm.businessName : null,
      business_description: signUpForm.userType === CONSTANTS.USER_TYPE.PROVIDER ? signUpForm.businessDescription : null
    };

    const result = await signUp(signUpForm.email, signUpForm.password, userData);
    
    if (!result.error) {
      setActiveTab('signin');
      // Mostrar mensaje de éxito
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearError();
    
    if (!resetForm.email) {
      return;
    }

    const result = await resetPassword(resetForm.email);
    
    if (!result.error) {
      setResetEmailSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Ktrin
          </CardTitle>
          <CardDescription>
            Plataforma de gestión de eventos
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
              <TabsTrigger value="reset">Recuperar</TabsTrigger>
            </TabsList>
            
            {/* Mostrar errores */}
            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Formulario de inicio de sesión */}
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={signInForm.password}
                      onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            {/* Formulario de registro */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10"
                      value={signUpForm.email}
                      onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Nombre Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="Tu nombre completo"
                      className="pl-10"
                      value={signUpForm.fullName}
                      onChange={(e) => setSignUpForm(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+1234567890"
                      className="pl-10"
                      value={signUpForm.phone}
                      onChange={(e) => setSignUpForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-usertype">Tipo de Usuario *</Label>
                  <Select 
                    value={signUpForm.userType} 
                    onValueChange={(value) => setSignUpForm(prev => ({ ...prev, userType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu tipo de usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CONSTANTS.USER_TYPE.CLIENT}>Cliente (Organizador de eventos)</SelectItem>
                      <SelectItem value={CONSTANTS.USER_TYPE.PROVIDER}>Proveedor de servicios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Campos adicionales para proveedores */}
                {signUpForm.userType === CONSTANTS.USER_TYPE.PROVIDER && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signup-business">Nombre del Negocio *</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-business"
                          type="text"
                          placeholder="Nombre de tu empresa"
                          className="pl-10"
                          value={signUpForm.businessName}
                          onChange={(e) => setSignUpForm(prev => ({ ...prev, businessName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-description">Descripción del Negocio</Label>
                      <Input
                        id="signup-description"
                        type="text"
                        placeholder="Breve descripción de tus servicios"
                        value={signUpForm.businessDescription}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, businessDescription: e.target.value }))}
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Contraseña *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={signUpForm.password}
                      onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmar Contraseña *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={signUpForm.confirmPassword}
                      onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            {/* Formulario de recuperación */}
            <TabsContent value="reset" className="space-y-4">
              {resetEmailSent ? (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    Se ha enviado un enlace de recuperación a tu email. Revisa tu bandeja de entrada.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        value={resetForm.email}
                        onChange={(e) => setResetForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Enlace de Recuperación'
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;

