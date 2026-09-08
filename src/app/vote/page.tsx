'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TierList from '@/components/TierList'
import { castVote } from '../actions'

export default function VotePage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if token exists in session storage
    const storedToken = sessionStorage.getItem('voter_token')
    if (!storedToken) {
      router.replace('/')
    } else {
      setToken(storedToken)
    }
  }, [router])

  const handleSubmitVote = async (ranking: Record<string, string[]>) => {
    if (!token) return
    setIsSubmitting(true)
    setError('')
    
    try {
      const result = await castVote(token, ranking)
      if (result.success) {
        // Clear token so they can't vote again
        sessionStorage.removeItem('voter_token')
        router.push('/results')
      } else {
        setError(result.error || 'Error al guardar el voto')
      }
    } catch (err) {
      setError('Hubo un error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) return <div className="p-10 text-center">Cargando...</div>

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 text-center">Arma tu Tier List</h1>
        <p className="text-center text-gray-600 mb-8">Arrastra las opciones a las diferentes categorías. Cuando termines, dale a Enviar.</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        {isSubmitting ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-700">Guardando voto de forma anónima...</h2>
          </div>
        ) : (
          <TierList onSubmit={handleSubmitVote} />
        )}
      </div>
    </main>
  )
}
