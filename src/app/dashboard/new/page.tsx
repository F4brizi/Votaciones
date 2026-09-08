'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPoll } from '@/app/actions'

export default function NewPoll() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [options, setOptions] = useState([{ name: '', file: null as File | null }, { name: '', file: null as File | null }])
  const [error, setError] = useState('')

  const handleAddOption = () => {
    setOptions([...options, { name: '', file: null }])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    formData.append('optionsCount', options.length.toString())
    
    // Validate options
    let validOptions = 0
    options.forEach((opt, idx) => {
      const nameInput = formData.get(`option_${idx}_name`)
      const fileInput = formData.get(`option_${idx}_image`) as File
      if (nameInput || (fileInput && fileInput.size > 0)) {
        validOptions++
      }
    })
    
    if (validOptions < 2) {
      setError("Debes configurar al menos 2 opciones (con nombre o imagen).")
      setIsSubmitting(false)
      return
    }

    try {
      const result = await createPoll(formData)
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || "Error al crear la encuesta")
      }
    } catch (err) {
      setError("Error de red")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Crear Nuevo Tier List</h1>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título de la Encuesta</label>
            <input name="title" required placeholder="Ej: Mejor Juego del Año 2026" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (Opcional)</label>
            <textarea name="description" placeholder="Explica las reglas..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" rows={3}></textarea>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Opciones a clasificar</h2>
              <button type="button" onClick={handleAddOption} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100">+ Añadir Opción</button>
            </div>
            
            <div className="space-y-4">
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-400 w-6">{idx + 1}.</span>
                  <div className="flex-1">
                    <input name={`option_${idx}_name`} placeholder="Nombre de la opción" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="flex-1">
                    <input type="file" name={`option_${idx}_image`} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>
                  {options.length > 2 && (
                    <button type="button" onClick={() => handleRemoveOption(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-6">
            <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 text-lg shadow-lg hover:shadow-indigo-200">
              {isSubmitting ? 'Creando...' : 'Crear Encuesta'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
