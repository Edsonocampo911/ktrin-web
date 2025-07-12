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
  Gift, 
  DollarSign,
  Users,
  Heart,
  ShoppingBag,
  Camera,
  Home,
  Gamepad2,
  Book,
  Music,
  Info
} from 'lucide-react'

const GiftSuggestions = ({ gifts = [], onGiftsChange }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGift, setNewGift] = useState({
    name: '',
    description: '',
    estimatedPrice: '',
    category: '',
    link: '',
    priority: 'medium'
  })

  const predefinedGifts = [
    {
      name: 'Cámara Digital',
      description: 'Para capturar momentos especiales',
      estimatedPrice: 300,
      category: 'electronics',
      icon: <Camera className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'Set de Cocina',
      description: 'Utensilios de cocina profesionales',
      estimatedPrice: 150,
      category: 'home',
      icon: <Home className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800'
    },
    {
      name: 'Experiencia Spa',
      description: 'Día de relajación y bienestar',
      estimatedPrice: 200,
      category: 'experience',
      icon: <Heart className="h-4 w-4" />,
      color: 'bg-pink-100 text-pink-800'
    },
    {
      name: 'Consola de Videojuegos',
      description: 'Para entretenimiento en casa',
      estimatedPrice: 500,
      category: 'electronics',
      icon: <Gamepad2 className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      name: 'Colección de Libros',
      description: 'Libros de su autor favorito',
      estimatedPrice: 80,
      category: 'books',
      icon: <Book className="h-4 w-4" />,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      name: 'Equipo de Audio',
      description: 'Altavoces o auriculares de calidad',
      estimatedPrice: 250,
      category: 'electronics',
      icon: <Music className="h-4 w-4" />,
      color: 'bg-indigo-100 text-indigo-800'
    }
  ]

  const categories = [
    { value: 'electronics', label: 'Electrónicos', icon: <Camera className="h-4 w-4" /> },
    { value: 'home', label: 'Hogar', icon: <Home className="h-4 w-4" /> },
    { value: 'experience', label: 'Experiencias', icon: <Heart className="h-4 w-4" /> },
    { value: 'books', label: 'Libros', icon: <Book className="h-4 w-4" /> },
    { value: 'fashion', label: 'Moda', icon: <ShoppingBag className="h-4 w-4" /> },
    { value: 'other', label: 'Otro', icon: <Gift className="h-4 w-4" /> }
  ]

  const priorityLevels = [
    { value: 'low', label: 'Baja', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Media', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'Alta', color: 'bg-green-100 text-green-800' }
  ]

  const addPredefinedGift = (gift) => {
    if (!gifts.find(g => g.name === gift.name)) {
      const updatedGifts = [...gifts, { ...gift, id: Date.now(), contributors: 0, collectedAmount: 0 }]
      onGiftsChange(updatedGifts)
    }
  }

  const addCustomGift = () => {
    if (newGift.name && newGift.estimatedPrice) {
      const gift = {
        ...newGift,
        id: Date.now(),
        estimatedPrice: parseFloat(newGift.estimatedPrice),
        contributors: 0,
        collectedAmount: 0,
        icon: <Gift className="h-4 w-4" />,
        color: 'bg-gray-100 text-gray-800'
      }
      const updatedGifts = [...gifts, gift]
      onGiftsChange(updatedGifts)
      setNewGift({ name: '', description: '', estimatedPrice: '', category: '', link: '', priority: 'medium' })
      setShowAddForm(false)
    }
  }

  const removeGift = (giftId) => {
    const updatedGifts = gifts.filter(g => g.id !== giftId)
    onGiftsChange(updatedGifts)
  }

  const getPriorityColor = (priority) => {
    const level = priorityLevels.find(p => p.value === priority)
    return level?.color || 'bg-gray-100 text-gray-800'
  }

  const getTotalEstimatedValue = () => {
    return gifts.reduce((total, gift) => total + (gift.estimatedPrice || 0), 0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Regalos Sugeridos
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Sugiere regalos para que los invitados puedan contribuir de forma colaborativa
        </p>
      </div>

      {/* Selected Gifts Summary */}
      {gifts.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Gift className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">Regalos Sugeridos</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">{gifts.length}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">Valor Total Estimado</span>
                </div>
                <p className="text-2xl font-bold text-green-700">${getTotalEstimatedValue()}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Contribuyentes</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {gifts.reduce((total, gift) => total + (gift.contributors || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Gifts List */}
      {gifts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Lista de regalos:</h4>
          <div className="space-y-3">
            {gifts.map((gift) => (
              <Card key={gift.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {gift.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-gray-900">{gift.name}</h5>
                          <Badge className={getPriorityColor(gift.priority)} variant="secondary">
                            {priorityLevels.find(p => p.value === gift.priority)?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{gift.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${gift.estimatedPrice}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {gift.contributors || 0} contribuyentes
                          </span>
                        </div>
                        {gift.link && (
                          <a 
                            href={gift.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1 block"
                          >
                            Ver producto
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeGift(gift.id)}
                      className="ml-2 p-1 hover:bg-red-100 rounded-full text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Predefined Gifts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Regalos Populares</CardTitle>
          <CardDescription>
            Selecciona de los regalos más solicitados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {predefinedGifts.map((gift, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${
                  gifts.find(g => g.name === gift.name) 
                    ? 'border-purple-300 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => addPredefinedGift(gift)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {gift.icon}
                    <div>
                      <p className="font-medium text-sm">{gift.name}</p>
                      <p className="text-xs text-gray-600">{gift.description}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800" variant="secondary">
                    ${gift.estimatedPrice}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Custom Gift */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar Regalo Personalizado</CardTitle>
          <CardDescription>
            ¿Tienes algo específico en mente? Agrégalo aquí
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
              Agregar Regalo Personalizado
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gift-name">Nombre del Regalo *</Label>
                  <Input
                    id="gift-name"
                    placeholder="Ej: Tablet para lectura"
                    value={newGift.name}
                    onChange={(e) => setNewGift({...newGift, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="gift-price">Precio Estimado (USD) *</Label>
                  <Input
                    id="gift-price"
                    type="number"
                    placeholder="0"
                    value={newGift.estimatedPrice}
                    onChange={(e) => setNewGift({...newGift, estimatedPrice: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="gift-description">Descripción</Label>
                <Textarea
                  id="gift-description"
                  placeholder="Describe el regalo y por qué sería especial..."
                  value={newGift.description}
                  onChange={(e) => setNewGift({...newGift, description: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gift-category">Categoría</Label>
                  <select
                    id="gift-category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newGift.category}
                    onChange={(e) => setNewGift({...newGift, category: e.target.value})}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="gift-priority">Prioridad</Label>
                  <select
                    id="gift-priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newGift.priority}
                    onChange={(e) => setNewGift({...newGift, priority: e.target.value})}
                  >
                    {priorityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="gift-link">Enlace del Producto (Opcional)</Label>
                <Input
                  id="gift-link"
                  type="url"
                  placeholder="https://..."
                  value={newGift.link}
                  onChange={(e) => setNewGift({...newGift, link: e.target.value})}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={addCustomGift} disabled={!newGift.name || !newGift.estimatedPrice}>
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

      {gifts.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Los invitados podrán ver esta lista y contribuir de forma colaborativa para los regalos. 
            Cada regalo mostrará el progreso de las contribuciones y los participantes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default GiftSuggestions

