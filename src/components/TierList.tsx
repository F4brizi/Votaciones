'use client'

import React, { useState } from 'react'

export type Item = { id: string, name: string }

const TIERS = ['S', 'A', 'B', 'C', 'D']
const INITIAL_ITEMS: Item[] = [
  { id: '1', name: 'Opción 1' },
  { id: '2', name: 'Opción 2' },
  { id: '3', name: 'Opción 3' },
  { id: '4', name: 'Opción 4' },
  { id: '5', name: 'Opción 5' },
]

export default function TierList({ onSubmit }: { onSubmit: (ranking: Record<string, string[]>) => void }) {
  // State holds tier -> items[], and 'unranked' -> items[]
  const [items, setItems] = useState<Record<string, Item[]>>({
    unranked: INITIAL_ITEMS,
    S: [], A: [], B: [], C: [], D: []
  })

  const handleDragStart = (e: React.DragEvent, id: string, sourceTier: string) => {
    e.dataTransfer.setData('itemId', id)
    e.dataTransfer.setData('sourceTier', sourceTier)
  }

  const handleDrop = (e: React.DragEvent, targetTier: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('itemId')
    const sourceTier = e.dataTransfer.getData('sourceTier')
    
    if (sourceTier === targetTier) return
    
    const sourceItems = [...items[sourceTier]]
    const targetItems = [...items[targetTier]]
    
    const itemIndex = sourceItems.findIndex(i => i.id === id)
    const item = sourceItems[itemIndex]
    
    sourceItems.splice(itemIndex, 1)
    targetItems.push(item)
    
    setItems({
      ...items,
      [sourceTier]: sourceItems,
      [targetTier]: targetItems
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleSubmit = () => {
    // Only send the ranked tiers
    const ranking: Record<string, string[]> = {}
    TIERS.forEach(t => {
      ranking[t] = items[t].map(i => i.id)
    })
    onSubmit(ranking)
  }

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'S': return 'bg-red-500'
      case 'A': return 'bg-orange-400'
      case 'B': return 'bg-yellow-400'
      case 'C': return 'bg-green-400'
      case 'D': return 'bg-blue-400'
      default: return 'bg-gray-200'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h2 className="font-bold text-lg mb-2 text-gray-800">Opciones sin clasificar</h2>
        <div 
          className="min-h-[60px] p-2 flex flex-wrap gap-2 bg-gray-50 border border-dashed border-gray-300 rounded"
          onDrop={(e) => handleDrop(e, 'unranked')}
          onDragOver={handleDragOver}
        >
          {items.unranked.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id, 'unranked')}
              className="bg-white px-4 py-2 border border-gray-300 shadow-sm rounded cursor-move hover:bg-gray-50 text-gray-800"
            >
              {item.name}
            </div>
          ))}
          {items.unranked.length === 0 && <span className="text-gray-400 text-sm italic py-2">Todas las opciones clasificadas</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1 border border-black bg-black p-1 rounded-lg">
        {TIERS.map(tier => (
          <div key={tier} className="flex bg-gray-800 min-h-[80px]">
            <div className={`${getTierColor(tier)} w-24 flex items-center justify-center font-black text-2xl text-black border-r border-black`}>
              {tier}
            </div>
            <div 
              className="flex-1 flex flex-wrap gap-2 p-2"
              onDrop={(e) => handleDrop(e, tier)}
              onDragOver={handleDragOver}
            >
              {items[tier].map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id, tier)}
                  className="bg-white px-4 py-2 border border-gray-300 shadow-sm rounded cursor-move text-gray-800"
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow transition-colors"
        >
          Enviar Voto Final
        </button>
      </div>
    </div>
  )
}
