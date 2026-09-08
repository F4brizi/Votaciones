'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyToken } from './actions'

export default function Home() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const result = await verifyToken(code)
      if (result.success) {
        // Save the code in session storage for the vote page to use
        sessionStorage.setItem('voter_token', code)
        router.push('/vote')
      } else {
        setError(result.error || 'Error desconocido')
      }
    } catch (err) {
      setError('Error al verificar el código')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-md w-full items-center justify-between font-mono text-sm">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Sistema de Votación Anónima</h1>
          <p className="text-gray-500 mb-8">Ingresa el código que se te ha proporcionado para votar.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Ej: ABC123" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest uppercase font-bold text-gray-800"
              maxLength={10}
              required
            />
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            
            <button 
              type="submit" 
              disabled={isLoading || !code}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Verificando...' : 'Entrar a Votar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
