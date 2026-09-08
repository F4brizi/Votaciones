'use client'

import React, { useState } from 'react'
import Image from 'next/image'

export type Option = { id: string, name: string, imageUrl: string | null }

const TIERS = ['S', 'A', 'B', 'C', 'D']

export default function TierList({ options, onSubmit }: { options: Option[], onSubmit: (ranking: Record<string, string[]>) => void }) {
  const [items, setItems] = useState<Record<string, Option[]>>({
    unranked: options,
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
    
    if (sourceTier === targetTier || !sourceTier || !id) return
    
    const sourceItems = [...items[sourceTier]]
    const targetItems = [...items[targetTier]]
    
    const itemIndex = sourceItems.findIndex(i => i.id === id)
    if (itemIndex === -1) return
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
  
  const ItemCard = ({ item, tier }: { item: Option, tier: string }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, item.id, tier)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-move flex flex-col items-center justify-center min-w-[80px] max-w-[120px] aspect-square transition-transform hover:scale-105"
    >
      {item.imageUrl ? (
        <div className="w-full h-full relative">
          {/* Using standard img to avoid Next.js Image strict hostname config during prototype */}
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-1 truncate px-1">
            {item.name}
          </div>
        </div>
      ) : (
        <div className="p-2 text-center text-sm font-bold text-gray-700">{item.name}</div>
      )}
    </div>
  )

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-lg mb-4 text-gray-900">Opciones para clasificar</h2>
        <div 
          className="min-h-[120px] p-4 flex flex-wrap gap-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl"
          onDrop={(e) => handleDrop(e, 'unranked')}
          onDragOver={handleDragOver}
        >
          {items.unranked.map(item => (
            <ItemCard key={item.id} item={item} tier="unranked" />
          ))}
          {items.unranked.length === 0 && <span className="text-gray-400 text-sm italic py-2 m-auto">Todas las opciones han sido clasificadas</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1 border-2 border-gray-900 bg-gray-900 p-2 rounded-2xl shadow-xl overflow-hidden">
        {TIERS.map(tier => (
          <div key={tier} className="flex bg-gray-800 min-h-[120px] rounded-lg overflow-hidden">
            <div className={`${getTierColor(tier)} w-24 flex items-center justify-center font-black text-4xl text-black border-r-2 border-gray-900`}>
              {tier}
            </div>
            <div 
              className="flex-1 flex flex-wrap gap-3 p-3 items-center"
              onDrop={(e) => handleDrop(e, tier)}
              onDragOver={handleDragOver}
            >
              {items[tier].map(item => (
                <ItemCard key={item.id} item={item} tier={tier} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-xl shadow-lg transition-transform hover:scale-105"
        >
          Confirmar Voto
        </button>
      </div>
    </div>
  )
}
