import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Minus, Coffee, Wine, Cake, Users, Calculator } from 'lucide-react'

const PerGuestSelection = ({ guestCount = 0, onSelectionChange = null }) => {
  const [selectedItems, setSelectedItems] = useState({})
  const [customItems, setCustomItems] = useState([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customItem, setCustomItem] = useState({
    name: '',
    category: 'bebidas',
    price: '',
    description: ''
  })

  // Productos predefinidos organizados por categoría
  const predefinedItems = {
    bebidas: [
      {
        id: 'agua',
        name: 'Agua Natural',
        price: 2.5,
        description: 'Botella de agua natural 500ml',
        icon: '💧'
      },
      {
        id: 'refresco',
        name: 'Refrescos Variados',
        price: 4.0,
        description: 'Coca-Cola, Pepsi, Sprite, etc.',
        icon: '🥤'
      },
      {
        id: 'jugo',
        name: 'Jugos Naturales',
        price: 6.0,
        description: 'Jugos de frutas naturales',
        icon: '🧃'
      },
      {
        id: 'cerveza',
        name: 'Cerveza Nacional',
        price: 8.0,
        description: 'Cerveza nacional variada',
        icon: '🍺'
      },
      {
        id: 'vino',
        name: 'Copa de Vino',
        price: 12.0,
        description: 'Vino tinto o blanco',
        icon: '🍷'
      },
      {
        id: 'cocktail',
        name: 'Cóctel de la Casa',
        price: 15.0,
        description: 'Cóctel especial preparado',
        icon: '🍹'
      },
      {
        id: 'cafe',
        name: 'Café Premium',
        price: 5.0,
        description: 'Café americano o espresso',
        icon: '☕'
      }
    ],
    postres: [
      {
        id: 'pastel_individual',
        name: 'Porción de Pastel',
        price: 8.0,
        description: 'Porción individual de pastel',
        icon: '🍰'
      },
      {
        id: 'cupcake',
        name: 'Cupcake Gourmet',
        price: 6.0,
        description: 'Cupcake decorado artesanalmente',
        icon: '🧁'
      },
      {
        id: 'helado',
        name: 'Copa de Helado',
        price: 7.0,
        description: 'Helado artesanal con toppings',
        icon: '🍨'
      },
      {
        id: 'flan',
        name: 'Flan Casero',
        price: 5.5,
        description: 'Flan tradicional con caramelo',
        icon: '🍮'
      },
      {
        id: 'brownie',
        name: 'Brownie con Helado',
        price: 9.0,
        description: 'Brownie tibio con helado de vainilla',
        icon: '🍫'
      },
      {
        id: 'fruta',
        name: 'Copa de Frutas',
        price: 6.5,
        description: 'Frutas frescas de temporada',
        icon: '🍓'
      },
      {
        id: 'cheesecake',
        name: 'Cheesecake',
        price: 10.0,
        description: 'Cheesecake de frutos rojos',
        icon: '🍰'
      }
    ]
  }

  // Actualizar cantidad de un item
  const updateItemQuantity = (itemId, quantity) => {
    const newSelectedItems = {
      ...selectedItems,
      [itemId]: Math.max(0, quantity)
    }
    
    // Eliminar items con cantidad 0
    if (newSelectedItems[itemId] === 0) {
      delete newSelectedItems[itemId]
    }
    
    setSelectedItems(newSelectedItems)
    
    if (onSelectionChange) {
      onSelectionChange(newSelectedItems)
    }
  }

  // Agregar item personalizado
  const addCustomItem = () => {
    if (!customItem.name || !customItem.price) return

    const newCustomItem = {
      id: `custom_${Date.now()}`,
      ...customItem,
      price: parseFloat(customItem.price),
      isCustom: true
    }

    setCustomItems(prev => [...prev, newCustomItem])
    setCustomItem({
      name: '',
      category: 'bebidas',
      price: '',
      description: ''
    })
    setShowCustomForm(false)
  }

  // Obtener todos los items (predefinidos + personalizados)
  const getAllItems = () => {
    const allItems = { ...predefinedItems }
    
    customItems.forEach(item => {
      if (!allItems[item.category]) {
        allItems[item.category] = []
      }
      allItems[item.category].push(item)
    })
    
    return allItems
  }

  // Calcular totales
  const calculateTotals = () => {
    const allItems = getAllItems()
    let totalCost = 0
    let totalItems = 0

    Object.entries(selectedItems).forEach(([itemId, quantity]) => {
      // Buscar el item en todas las categorías
      let item = null
      Object.values(allItems).forEach(categoryItems => {
        const foundItem = categoryItems.find(i => i.id === itemId)
        if (foundItem) item = foundItem
      })

      if (item) {
        totalCost += item.price * quantity
        totalItems += quantity
      }
    })

    return {
      totalCost,
      totalItems,
      costPerGuest: guestCount > 0 ? totalCost / guestCount : 0,
      itemsPerGuest: guestCount > 0 ? totalItems / guestCount : 0
    }
  }

  const totals = calculateTotals()
  const allItems = getAllItems()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Selección por Invitado
          </CardTitle>
          <CardDescription>
            Selecciona bebidas y postres especificando la cantidad total para {guestCount} invitados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guestCount === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Especifica primero la cantidad de invitados en el paso anterior</p>
            </div>
          )}

          {guestCount > 0 && (
            <div className="space-y-8">
              {/* Bebidas */}
              <div>
                <div className="flex items-center mb-4">
                  <Coffee className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-semibold">Bebidas</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allItems.bebidas?.map(item => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{item.icon}</span>
                            <div>
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                          </div>
                          {item.isCustom && (
                            <Badge variant="secondary" className="text-xs">
                              Personalizado
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-600">
                            ${item.price.toFixed(2)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemQuantity(item.id, (selectedItems[item.id] || 0) - 1)}
                              disabled={!selectedItems[item.id]}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {selectedItems[item.id] || 0}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemQuantity(item.id, (selectedItems[item.id] || 0) + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Postres */}
              <div>
                <div className="flex items-center mb-4">
                  <Cake className="h-5 w-5 mr-2 text-pink-600" />
                  <h3 className="text-lg font-semibold">Postres</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allItems.postres?.map(item => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{item.icon}</span>
                            <div>
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                          </div>
                          {item.isCustom && (
                            <Badge variant="secondary" className="text-xs">
                              Personalizado
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-600">
                            ${item.price.toFixed(2)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemQuantity(item.id, (selectedItems[item.id] || 0) - 1)}
                              disabled={!selectedItems[item.id]}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {selectedItems[item.id] || 0}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemQuantity(item.id, (selectedItems[item.id] || 0) + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Agregar item personalizado */}
              <div>
                {!showCustomForm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomForm(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Producto Personalizado
                  </Button>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Agregar Producto Personalizado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customName">Nombre del Producto</Label>
                          <Input
                            id="customName"
                            value={customItem.name}
                            onChange={(e) => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ej: Mojito Especial"
                          />
                        </div>
                        <div>
                          <Label htmlFor="customPrice">Precio</Label>
                          <Input
                            id="customPrice"
                            type="number"
                            step="0.01"
                            value={customItem.price}
                            onChange={(e) => setCustomItem(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="customCategory">Categoría</Label>
                        <select
                          id="customCategory"
                          value={customItem.category}
                          onChange={(e) => setCustomItem(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="bebidas">Bebidas</option>
                          <option value="postres">Postres</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="customDescription">Descripción</Label>
                        <Input
                          id="customDescription"
                          value={customItem.description}
                          onChange={(e) => setCustomItem(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descripción del producto..."
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={addCustomItem} disabled={!customItem.name || !customItem.price}>
                          Agregar Producto
                        </Button>
                        <Button variant="outline" onClick={() => setShowCustomForm(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de costos */}
      {guestCount > 0 && totals.totalItems > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Calculator className="h-5 w-5 mr-2" />
              Resumen de Costos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-green-600">Total de Items</p>
                <p className="text-2xl font-bold text-green-800">{totals.totalItems}</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Costo Total</p>
                <p className="text-2xl font-bold text-green-800">${totals.totalCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Por Invitado</p>
                <p className="text-2xl font-bold text-green-800">${totals.costPerGuest.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Items por Invitado</p>
                <p className="text-2xl font-bold text-green-800">{totals.itemsPerGuest.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PerGuestSelection

