import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  X, 
  Heart, 
  Leaf, 
  Cross, 
  AlertTriangle,
  Info,
  Utensils
} from 'lucide-react'

const DietaryConditions = ({ conditions = [], onConditionsChange }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCondition, setNewCondition] = useState({
    type: '',
    category: '',
    description: '',
    severity: 'medium'
  })

  const predefinedConditions = [
    {
      type: 'Celiaquía',
      category: 'health',
      description: 'Intolerancia al gluten',
      severity: 'high',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800'
    },
    {
      type: 'Diabetes',
      category: 'health',
      description: 'Control de azúcar en sangre',
      severity: 'high',
      icon: <Heart className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800'
    },
    {
      type: 'Veganismo',
      category: 'lifestyle',
      description: 'Sin productos de origen animal',
      severity: 'medium',
      icon: <Leaf className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800'
    },
    {
      type: 'Vegetarianismo',
      category: 'lifestyle',
      description: 'Sin carne ni pescado',
      severity: 'medium',
      icon: <Leaf className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800'
    },
    {
      type: 'Halal',
      category: 'religious',
      description: 'Alimentación según ley islámica',
      severity: 'high',
      icon: <Cross className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      type: 'Kosher',
      category: 'religious',
      description: 'Alimentación según ley judía',
      severity: 'high',
      icon: <Cross className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      type: 'Alergia a frutos secos',
      category: 'allergy',
      description: 'Reacción alérgica a nueces y similares',
      severity: 'high',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800'
    },
    {
      type: 'Intolerancia a la lactosa',
      category: 'health',
      description: 'Dificultad para digerir lácteos',
      severity: 'medium',
      icon: <Info className="h-4 w-4" />,
      color: 'bg-yellow-100 text-yellow-800'
    }
  ]

  const categories = [
    { value: 'health', label: 'Salud', color: 'bg-red-50 border-red-200' },
    { value: 'allergy', label: 'Alergia', color: 'bg-red-50 border-red-200' },
    { value: 'religious', label: 'Religioso', color: 'bg-blue-50 border-blue-200' },
    { value: 'lifestyle', label: 'Estilo de vida', color: 'bg-green-50 border-green-200' },
    { value: 'other', label: 'Otro', color: 'bg-gray-50 border-gray-200' }
  ]

  const severityLevels = [
    { value: 'low', label: 'Baja', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800' }
  ]

  const addPredefinedCondition = (condition) => {
    if (!conditions.find(c => c.type === condition.type)) {
      const updatedConditions = [...conditions, { ...condition, id: Date.now() }]
      onConditionsChange(updatedConditions)
    }
  }

  const addCustomCondition = () => {
    if (newCondition.type && newCondition.category) {
      const condition = {
        ...newCondition,
        id: Date.now(),
        icon: <Utensils className="h-4 w-4" />,
        color: categories.find(c => c.value === newCondition.category)?.color || 'bg-gray-100 text-gray-800'
      }
      const updatedConditions = [...conditions, condition]
      onConditionsChange(updatedConditions)
      setNewCondition({ type: '', category: '', description: '', severity: 'medium' })
      setShowAddForm(false)
    }
  }

  const removeCondition = (conditionId) => {
    const updatedConditions = conditions.filter(c => c.id !== conditionId)
    onConditionsChange(updatedConditions)
  }

  const getSeverityColor = (severity) => {
    const level = severityLevels.find(s => s.value === severity)
    return level?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Condiciones Alimenticias
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Especifica las condiciones alimenticias, alergias o preferencias dietéticas de los invitados
        </p>
      </div>

      {/* Selected Conditions */}
      {conditions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Condiciones seleccionadas:</h4>
          <div className="flex flex-wrap gap-2">
            {conditions.map((condition) => (
              <Badge
                key={condition.id}
                className={`${condition.color} flex items-center gap-2 px-3 py-1`}
              >
                {condition.icon}
                <span>{condition.type}</span>
                <button
                  onClick={() => removeCondition(condition.id)}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Predefined Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Condiciones Comunes</CardTitle>
          <CardDescription>
            Selecciona de las condiciones más frecuentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {predefinedConditions.map((condition, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${
                  conditions.find(c => c.type === condition.type) 
                    ? 'border-indigo-300 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => addPredefinedCondition(condition)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {condition.icon}
                    <div>
                      <p className="font-medium text-sm">{condition.type}</p>
                      <p className="text-xs text-gray-600">{condition.description}</p>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(condition.severity)} variant="secondary">
                    {severityLevels.find(s => s.value === condition.severity)?.label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Custom Condition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar Condición Personalizada</CardTitle>
          <CardDescription>
            ¿No encuentras la condición que buscas? Agrégala aquí
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showAddForm ? (
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Condición Personalizada
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition-type">Tipo de Condición *</Label>
                  <Input
                    id="condition-type"
                    placeholder="Ej: Alergia al maní"
                    value={newCondition.type}
                    onChange={(e) => setNewCondition({...newCondition, type: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="condition-category">Categoría *</Label>
                  <select
                    id="condition-category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newCondition.category}
                    onChange={(e) => setNewCondition({...newCondition, category: e.target.value})}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="condition-description">Descripción</Label>
                <Textarea
                  id="condition-description"
                  placeholder="Describe la condición o restricción..."
                  value={newCondition.description}
                  onChange={(e) => setNewCondition({...newCondition, description: e.target.value})}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="condition-severity">Nivel de Importancia</Label>
                <select
                  id="condition-severity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newCondition.severity}
                  onChange={(e) => setNewCondition({...newCondition, severity: e.target.value})}
                >
                  {severityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={addCustomCondition} disabled={!newCondition.type || !newCondition.category}>
                  Agregar
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {conditions.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Esta información será compartida con los proveedores de catering para asegurar que puedan 
            atender adecuadamente las necesidades alimenticias de todos los invitados.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default DietaryConditions

