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
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Loader2,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle
} from 'lucide-react';
import { useEvents } from '../../hooks/useEvents.js';
import { useServices } from '../../hooks/useServices.js';
import ServiceSelector from './ServiceSelector.jsx';
import LocationInput from './LocationInput.jsx';
import { CONSTANTS } from '../../config.js';

const CreateEventForm = ({ onSuccess, onCancel }) => {
  const { createEvent, loading: eventLoading, error: eventError } = useEvents();
  const { selectedServices, totalCost, clearServiceSelection } = useServices();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Información básica
    title: '',
    description: '',
    event_type: '',
    
    // Fecha y hora
    event_date: '',
    event_time: '',
    end_time: '',
    
    // Ubicación
    location_type: CONSTANTS.LOCATION_TYPE.ADDRESS,
    location_data: {},
    
    // Invitados
    guest_count: '',
    allow_plus_one: false,
    rsvp_deadline: '',
    
    // Presupuesto y notas
    budget_estimate: '',
    special_requests: '',
    dietary_notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tipos de eventos predefinidos
  const eventTypes = [
    'Cumpleaños',
    'Boda',
    'Aniversario',
    'Graduación',
    'Baby Shower',
    'Despedida de Soltero/a',
    'Reunión Familiar',
    'Evento Corporativo',
    'Conferencia',
    'Lanzamiento de Producto',
    'Networking',
    'Otro'
  ];

  // Validaciones por paso
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Información básica
        if (!formData.title.trim()) {
          newErrors.title = 'El título es requerido';
        }
        if (!formData.event_type) {
          newErrors.event_type = 'El tipo de evento es requerido';
        }
        break;

      case 2: // Fecha y hora
        if (!formData.event_date) {
          newErrors.event_date = 'La fecha es requerida';
        } else {
          const eventDate = new Date(formData.event_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (eventDate < today) {
            newErrors.event_date = 'La fecha no puede ser en el pasado';
          }
        }
        
        if (!formData.event_time) {
          newErrors.event_time = 'La hora es requerida';
        }
        
        if (formData.rsvp_deadline) {
          const rsvpDate = new Date(formData.rsvp_deadline);
          const eventDate = new Date(formData.event_date);
          
          if (rsvpDate > eventDate) {
            newErrors.rsvp_deadline = 'La fecha límite no puede ser posterior al evento';
          }
        }
        break;

      case 3: // Ubicación
        if (!formData.location_data || Object.keys(formData.location_data).length === 0) {
          newErrors.location = 'La ubicación es requerida';
        }
        break;

      case 4: // Invitados
        if (!formData.guest_count || formData.guest_count < 1) {
          newErrors.guest_count = 'El número de invitados debe ser mayor a 0';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambio de paso
  const handleStepChange = (newStep) => {
    if (newStep > currentStep) {
      // Validar paso actual antes de avanzar
      if (!validateStep(currentStep)) {
        return;
      }
    }
    setCurrentStep(newStep);
  };

  // Manejar cambio en los campos del formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Manejar cambio de ubicación
  const handleLocationChange = (locationType, locationData) => {
    setFormData(prev => ({
      ...prev,
      location_type: locationType,
      location_data: locationData
    }));
    
    // Limpiar error de ubicación
    if (errors.location) {
      setErrors(prev => ({
        ...prev,
        location: undefined
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    // Validar todos los pasos
    let isValid = true;
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        isValid = false;
        setCurrentStep(step);
        break;
      }
    }

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const eventData = {
        ...formData,
        guest_count: parseInt(formData.guest_count),
        budget_estimate: formData.budget_estimate ? parseFloat(formData.budget_estimate) : null,
        selectedServices: selectedServices.map(service => ({
          service_id: service.service_id,
          quantity: service.quantity || 1,
          custom_price: service.custom_price || null,
          notes: service.notes || null
        }))
      };

      const result = await createEvent(eventData);

      if (result.error) {
        setErrors({ submit: result.message });
      } else {
        // Limpiar selección de servicios
        clearServiceSelection();
        
        // Llamar callback de éxito
        onSuccess?.(result.data);
      }
    } catch (error) {
      setErrors({ submit: 'Error inesperado al crear el evento' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Evento *</Label>
              <Input
                id="title"
                placeholder="Ej: Mi cumpleaños número 30"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Tipo de Evento *</Label>
              <Select 
                value={formData.event_type} 
                onValueChange={(value) => handleInputChange('event_type', value)}
              >
                <SelectTrigger className={errors.event_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona el tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.event_type && (
                <p className="text-sm text-red-500">{errors.event_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe tu evento (opcional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Fecha del Evento *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                  className={errors.event_date ? 'border-red-500' : ''}
                />
                {errors.event_date && (
                  <p className="text-sm text-red-500">{errors.event_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_time">Hora de Inicio *</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => handleInputChange('event_time', e.target.value)}
                  className={errors.event_time ? 'border-red-500' : ''}
                />
                {errors.event_time && (
                  <p className="text-sm text-red-500">{errors.event_time}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end_time">Hora de Finalización</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rsvp_deadline">Fecha Límite de Confirmación</Label>
                <Input
                  id="rsvp_deadline"
                  type="date"
                  value={formData.rsvp_deadline}
                  onChange={(e) => handleInputChange('rsvp_deadline', e.target.value)}
                  className={errors.rsvp_deadline ? 'border-red-500' : ''}
                />
                {errors.rsvp_deadline && (
                  <p className="text-sm text-red-500">{errors.rsvp_deadline}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <LocationInput
              locationType={formData.location_type}
              locationData={formData.location_data}
              onChange={handleLocationChange}
              error={errors.location}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guest_count">Número de Invitados *</Label>
              <Input
                id="guest_count"
                type="number"
                min="1"
                placeholder="Ej: 50"
                value={formData.guest_count}
                onChange={(e) => handleInputChange('guest_count', e.target.value)}
                className={errors.guest_count ? 'border-red-500' : ''}
              />
              {errors.guest_count && (
                <p className="text-sm text-red-500">{errors.guest_count}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow_plus_one"
                checked={formData.allow_plus_one}
                onCheckedChange={(checked) => handleInputChange('allow_plus_one', checked)}
              />
              <Label htmlFor="allow_plus_one">
                Permitir acompañantes (+1)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_estimate">Presupuesto Estimado</Label>
              <Input
                id="budget_estimate"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 50000"
                value={formData.budget_estimate}
                onChange={(e) => handleInputChange('budget_estimate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_requests">Solicitudes Especiales</Label>
              <Textarea
                id="special_requests"
                placeholder="Cualquier solicitud especial para el evento"
                value={formData.special_requests}
                onChange={(e) => handleInputChange('special_requests', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietary_notes">Notas Alimentarias</Label>
              <Textarea
                id="dietary_notes"
                placeholder="Restricciones alimentarias, alergias, etc."
                value={formData.dietary_notes}
                onChange={(e) => handleInputChange('dietary_notes', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <ServiceSelector />
            
            {selectedServices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen de Servicios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedServices.map((service) => (
                      <div key={service.service_id} className="flex justify-between items-center">
                        <span>{service.name} (x{service.quantity})</span>
                        <span className="font-medium">
                          ${((service.custom_price || service.base_price) * service.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between items-center font-bold">
                      <span>Total:</span>
                      <span>${totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: 'Información Básica', icon: Calendar },
    { number: 2, title: 'Fecha y Hora', icon: Clock },
    { number: 3, title: 'Ubicación', icon: MapPin },
    { number: 4, title: 'Invitados', icon: Users },
    { number: 5, title: 'Servicios', icon: DollarSign }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Crear Nuevo Evento</CardTitle>
          <CardDescription>
            Completa la información para crear tu evento
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Indicador de pasos */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm ${isActive ? 'font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-px bg-gray-300 mx-4" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mostrar errores */}
          {(eventError || errors.submit) && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {eventError || errors.submit}
              </AlertDescription>
            </Alert>
          )}

          {/* Contenido del paso actual */}
          {renderStep()}

          {/* Botones de navegación */}
          <div className="flex justify-between pt-6">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => handleStepChange(currentStep - 1)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>

              {currentStep < 5 ? (
                <Button
                  onClick={() => handleStepChange(currentStep + 1)}
                  disabled={isSubmitting}
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || eventLoading}
                >
                  {isSubmitting || eventLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Crear Evento
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEventForm;

