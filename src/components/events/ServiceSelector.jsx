import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { 
  Search, 
  Plus, 
  Minus, 
  DollarSign, 
  Star, 
  Users, 
  Clock,
  ShoppingCart,
  X
} from 'lucide-react';
import { useServices } from '../../hooks/useServices.js';

const ServiceSelector = () => {
  const {
    services,
    categories,
    selectedServices,
    loading,
    error,
    loadActiveServices,
    loadServicesByCategory,
    searchServices,
    addServiceToSelection,
    removeServiceFromSelection,
    updateServiceQuantity,
    updateServiceCustomPrice,
    isServiceSelected,
    getSelectedServiceById,
    totalCost
  } = useServices();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showSelected, setShowSelected] = useState(false);

  // Cargar servicios iniciales
  useEffect(() => {
    loadActiveServices();
  }, [loadActiveServices]);

  // Manejar búsqueda
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchServices(term);
      setActiveCategory('search');
    } else {
      await loadActiveServices();
      setActiveCategory('all');
    }
  };

  // Manejar cambio de categoría
  const handleCategoryChange = async (category) => {
    setActiveCategory(category);
    setSearchTerm('');
    
    if (category === 'all') {
      await loadActiveServices();
    } else if (category === 'selected') {
      setShowSelected(true);
      return;
    } else {
      await loadServicesByCategory(category);
    }
    setShowSelected(false);
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  // Renderizar tarjeta de servicio
  const renderServiceCard = (service) => {
    const isSelected = isServiceSelected(service.service_id);
    const selectedService = getSelectedServiceById(service.service_id);

    return (
      <Card key={service.service_id} className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{service.category}</Badge>
                {service.provider_verified && (
                  <Badge variant="default" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{formatPrice(service.base_price)}</div>
              <div className="text-xs text-muted-foreground">
                {service.unit_type === 'per_person' && 'por persona'}
                {service.unit_type === 'per_hour' && 'por hora'}
                {service.unit_type === 'per_event' && 'por evento'}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Descripción */}
          {service.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {service.description}
            </p>
          )}

          {/* Información del proveedor */}
          {service.provider_name && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{service.provider_name}</span>
              {service.business_name && (
                <span className="text-muted-foreground">- {service.business_name}</span>
              )}
            </div>
          )}

          {/* Tiempo de preparación */}
          {service.preparation_time_hours > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{service.preparation_time_hours}h de preparación</span>
            </div>
          )}

          {/* Controles de selección */}
          <div className="flex items-center justify-between pt-2 border-t">
            {!isSelected ? (
              <Button
                onClick={() => addServiceToSelection(service, 1)}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedService.quantity > 1) {
                        updateServiceQuantity(service.service_id, selectedService.quantity - 1);
                      } else {
                        removeServiceFromSelection(service.service_id);
                      }
                    }}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <span className="px-3 py-1 text-sm font-medium">
                    {selectedService.quantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateServiceQuantity(service.service_id, selectedService.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeServiceFromSelection(service.service_id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Precio personalizado */}
          {isSelected && (
            <div className="space-y-2">
              <Label htmlFor={`custom-price-${service.service_id}`} className="text-xs">
                Precio personalizado (opcional)
              </Label>
              <Input
                id={`custom-price-${service.service_id}`}
                type="number"
                min="0"
                step="0.01"
                placeholder={`Precio base: ${formatPrice(service.base_price)}`}
                value={selectedService.custom_price || ''}
                onChange={(e) => updateServiceCustomPrice(
                  service.service_id, 
                  e.target.value ? parseFloat(e.target.value) : null
                )}
                className="text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con resumen */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Seleccionar Servicios</h3>
          <p className="text-sm text-muted-foreground">
            Elige los servicios que necesitas para tu evento
          </p>
        </div>
        
        {selectedServices.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedServices.length} servicio{selectedServices.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-lg font-bold">
                {formatPrice(totalCost)}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar servicios..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs de categorías */}
      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="selected">
            Seleccionados ({selectedServices.length})
          </TabsTrigger>
          {categories.slice(0, 4).map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Contenido de servicios */}
        <div className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button 
                variant="outline" 
                onClick={loadActiveServices}
                className="mt-2"
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              {/* Servicios seleccionados */}
              {activeCategory === 'selected' && (
                <div className="space-y-4">
                  {selectedServices.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay servicios seleccionados
                      </h3>
                      <p className="text-gray-500">
                        Explora las categorías para agregar servicios
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {selectedServices.map((service) => renderServiceCard(service))}
                    </div>
                  )}
                </div>
              )}

              {/* Lista de servicios */}
              {activeCategory !== 'selected' && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {services.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No se encontraron servicios
                      </h3>
                      <p className="text-gray-500">
                        {searchTerm 
                          ? 'Intenta con otros términos de búsqueda'
                          : 'No hay servicios disponibles en esta categoría'
                        }
                      </p>
                    </div>
                  ) : (
                    services.map((service) => renderServiceCard(service))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default ServiceSelector;

