import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const poll = await prisma.poll.findUnique({
    where: { id: params.id },
    include: {
      options: true,
      votes: true
    }
  })

  if (!poll) {
    return <div className="p-8 text-center">Encuesta no encontrada</div>
  }

  // Borda Count Implementation
  // S = 5, A = 4, B = 3, C = 2, D = 1, unranked = 0
  const scores: Record<string, number> = {}
  poll.options.forEach(opt => scores[opt.id] = 0)
  
  const points = { S: 5, A: 4, B: 3, C: 2, D: 1 }

  poll.votes.forEach(vote => {
    try {
      const ranking = JSON.parse(vote.ranking) as Record<string, string[]>
      Object.keys(points).forEach(tier => {
        const itemIds = ranking[tier] || []
        itemIds.forEach(id => {
          if (scores[id] !== undefined) {
            scores[id] += points[tier as keyof typeof points]
          }
        })
      })
    } catch (e) {
      // Ignorar votos malformados
    }
  })

  // Sort options by score
  const sortedOptions = [...poll.options].sort((a, b) => scores[b.id] - scores[a.id])

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Resultados: {poll.title}</h1>
            <p className="text-gray-500">Basado en {poll.votes.length} votos anónimos (Borda Count)</p>
          </div>
          <Link href={`/poll/${poll.id}`} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2 px-6 rounded-lg">
            Volver a la encuesta
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {sortedOptions.map((opt, idx) => (
            <div key={opt.id} className="flex items-center p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
              <div className="text-3xl font-black text-gray-300 w-12">{idx + 1}</div>
              
              {opt.imageUrl && (
                <div className="w-16 h-16 mr-6 rounded-lg overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                  <img src={opt.imageUrl} alt={opt.name} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{opt.name}</h3>
              </div>
              
              <div className="text-right">
                <span className="text-3xl font-black text-indigo-600">{scores[opt.id]}</span>
                <span className="text-gray-500 text-sm block">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
