import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { 
  User, 
  Mail, 
  Phone, 
  Users, 
  Utensils, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Heart,
  Gift
} from 'lucide-react';
import { useGuests } from '../../hooks/useGuests.js';

const GuestRegistrationForm = ({ eventId, invitationCode, onSuccess }) => {
  const { registerGuest, validateInvitationCode, loading, error } = useGuests();
  
  const [eventInfo, setEventInfo] = useState(null);
  const [validationLoading, setValidationLoading] = useState(true);
  const [validationError, setValidationError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    plus_one: false,
    plus_one_name: '',
    dietary_restrictions: [],
    allergies: '',
    special_notes: '',
    attendance_status: 'confirmed'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Opciones de restricciones alimentarias
  const dietaryOptions = [
    'Vegetariano',
    'Vegano',
    'Sin gluten',
    'Sin lactosa',
    'Kosher',
    'Halal',
    'Sin frutos secos',
    'Sin mariscos',
    'Diabético',
    'Bajo en sodio'
  ];

  // Validar código de invitación al cargar
  useEffect(() => {
    const validateCode = async () => {
      if (!eventId || !invitationCode) {
        setValidationError('Código de invitación inválido');
        setValidationLoading(false);
        return;
      }

      try {
        setValidationLoading(true);
        const result = await validateInvitationCode(eventId, invitationCode);
        
        if (result.error) {
          setValidationError(result.message);
        } else {
          setEventInfo(result.data);
        }
      } catch (error) {
        setValidationError('Error al validar la invitación');
      } finally {
        setValidationLoading(false);
      }
    };

    validateCode();
  }, [eventId, invitationCode, validateInvitationCode]);

  // Manejar cambio en los campos del formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Manejar cambio en restricciones alimentarias
  const handleDietaryChange = (restriction, checked) => {
    setFormData(prev => ({
      ...prev,
      dietary_restrictions: checked
        ? [...prev.dietary_restrictions, restriction]
        : prev.dietary_restrictions.filter(r => r !== restriction)
    }));
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.full_name.trim()) {
      errors.full_name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (formData.plus_one && !formData.plus_one_name.trim()) {
      errors.plus_one_name = 'El nombre del acompañante es requerido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const guestData = {
        event_id: eventId,
        invitation_code: invitationCode,
        ...formData,
        dietary_restrictions: formData.dietary_restrictions.length > 0 ? formData.dietary_restrictions : null,
        allergies: formData.allergies.trim() || null,
        special_notes: formData.special_notes.trim() || null,
        plus_one_name: formData.plus_one ? formData.plus_one_name : null
      };

      const result = await registerGuest(guestData);

      if (result.error) {
        setFormErrors({ submit: result.message });
      } else {
        setRegistrationSuccess(true);
        onSuccess?.(result.data);
      }
    } catch (error) {
      setFormErrors({ submit: 'Error inesperado al registrar' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Mostrar loading de validación
  if (validationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Validando invitación...</p>
        </div>
      </div>
    );
  }

  // Mostrar error de validación
  if (validationError || !eventInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {validationError || 'Invitación no válida'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar éxito de registro
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              ¡Registro Exitoso!
            </h2>
            <p className="text-green-700 mb-4">
              Tu asistencia ha sido confirmada para <strong>{eventInfo.title}</strong>
            </p>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-left">
              <h3 className="font-semibold text-green-900 mb-2">Detalles del evento:</h3>
              <p className="text-sm text-green-800">
                <strong>Fecha:</strong> {formatDate(eventInfo.event_date)}
              </p>
              <p className="text-sm text-green-800">
                <strong>Hora:</strong> {eventInfo.event_time}
              </p>
              {eventInfo.location_data?.venue_name && (
                <p className="text-sm text-green-800">
                  <strong>Lugar:</strong> {eventInfo.location_data.venue_name}
                </p>
              )}
            </div>
            <p className="text-sm text-green-600 mt-4">
              Recibirás un email de confirmación con todos los detalles.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header del evento */}
        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="pt-6 pb-6 text-center">
            <Gift className="h-12 w-12 mx-auto mb-3 opacity-90" />
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {eventInfo.title}
            </h1>
            <p className="text-blue-100">
              {formatDate(eventInfo.event_date)} • {eventInfo.event_time}
            </p>
          </CardContent>
        </Card>

        {/* Formulario de registro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Registro de Invitado
            </CardTitle>
            <CardDescription>
              Completa tus datos para confirmar tu asistencia
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mostrar errores */}
              {(error || formErrors.submit) && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    {error || formErrors.submit}
                  </AlertDescription>
                </Alert>
              )}

              {/* Información personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Personal</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="full_name"
                      placeholder="Tu nombre completo"
                      className={`pl-10 ${formErrors.full_name ? 'border-red-500' : ''}`}
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      required
                    />
                  </div>
                  {formErrors.full_name && (
                    <p className="text-sm text-red-500">{formErrors.full_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className={`pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+54 11 1234-5678"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Acompañante */}
              {eventInfo.allow_plus_one && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Acompañante</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="plus_one"
                      checked={formData.plus_one}
                      onCheckedChange={(checked) => handleInputChange('plus_one', checked)}
                    />
                    <Label htmlFor="plus_one" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Asistiré con acompañante (+1)
                    </Label>
                  </div>

                  {formData.plus_one && (
                    <div className="space-y-2">
                      <Label htmlFor="plus_one_name">Nombre del Acompañante *</Label>
                      <Input
                        id="plus_one_name"
                        placeholder="Nombre de tu acompañante"
                        className={formErrors.plus_one_name ? 'border-red-500' : ''}
                        value={formData.plus_one_name}
                        onChange={(e) => handleInputChange('plus_one_name', e.target.value)}
                      />
                      {formErrors.plus_one_name && (
                        <p className="text-sm text-red-500">{formErrors.plus_one_name}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Restricciones alimentarias */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Preferencias Alimentarias
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dietaryOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dietary-${option}`}
                        checked={formData.dietary_restrictions.includes(option)}
                        onCheckedChange={(checked) => handleDietaryChange(option, checked)}
                      />
                      <Label htmlFor={`dietary-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias Alimentarias</Label>
                  <Input
                    id="allergies"
                    placeholder="Especifica cualquier alergia alimentaria"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                  />
                </div>
              </div>

              {/* Notas especiales */}
              <div className="space-y-2">
                <Label htmlFor="special_notes">Notas Especiales</Label>
                <Textarea
                  id="special_notes"
                  placeholder="Cualquier información adicional que quieras compartir"
                  value={formData.special_notes}
                  onChange={(e) => handleInputChange('special_notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Botón de envío */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Asistencia
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                Al registrarte, confirmas tu asistencia al evento.
              </p>
              <p>
                Si tienes alguna pregunta, contacta al organizador: {eventInfo.organizer_email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuestRegistrationForm;

