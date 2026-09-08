'use client'

import { useState } from 'react'
import TierList, { Option } from '@/components/TierList'
import { castPollVote } from '@/app/actions'
import { useRouter } from 'next/navigation'

export default function VoteWrapper({ pollId, options }: { pollId: string, options: Option[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (ranking: Record<string, string[]>) => {
    setIsSubmitting(true)
    setError('')
    
    try {
      const result = await castPollVote(pollId, ranking)
      if (result.success) {
        // Just refresh the page, the server component will see the user has voted
        router.refresh()
      } else {
        setError(result.error || "Ocurrió un error al enviar tu voto.")
      }
    } catch (err) {
      setError("Error de red")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitting) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 animate-pulse">Registrando tu voto de forma anónima...</h2>
      </div>
    )
  }

  return (
    <div>
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-center">{error}</div>}
      <TierList options={options} onSubmit={handleSubmit} />
    </div>
  )
}
