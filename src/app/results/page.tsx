import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const TIER_WEIGHTS: Record<string, number> = {
  'S': 5,
  'A': 4,
  'B': 3,
  'C': 2,
  'D': 1
}

// We define the same items as in the client (ideally this should be in a shared DB or config file)
const ITEMS_MAP: Record<string, string> = {
  '1': 'Opción 1',
  '2': 'Opción 2',
  '3': 'Opción 3',
  '4': 'Opción 4',
  '5': 'Opción 5',
}

export default async function ResultsPage() {
  const votes = await prisma.vote.findMany()
  
  // Calculate scores (Borda count)
  const scores: Record<string, number> = {}
  Object.keys(ITEMS_MAP).forEach(id => scores[id] = 0)
  
  votes.forEach(vote => {
    try {
      const ranking = JSON.parse(vote.ranking) as Record<string, string[]>
      
      Object.entries(ranking).forEach(([tier, itemIds]) => {
        const weight = TIER_WEIGHTS[tier] || 0
        itemIds.forEach(id => {
          if (scores[id] !== undefined) {
            scores[id] += weight
          }
        })
      })
    } catch (e) {
      console.error('Error parsing vote:', e)
    }
  })
  
  // Sort items by score descending
  const sortedResults = Object.entries(scores)
    .map(([id, score]) => ({ id, name: ITEMS_MAP[id], score }))
    .sort((a, b) => b.score - a.score)
    
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Resultados de la Votación</h1>
        <p className="text-center text-gray-500 mb-8">Votos totales registrados: {votes.length}</p>
        
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-4 font-bold border-b border-gray-200">Posición</th>
                <th className="p-4 font-bold border-b border-gray-200">Opción</th>
                <th className="p-4 font-bold text-right border-b border-gray-200">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result, index) => (
                <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-500">#{index + 1}</td>
                  <td className="p-4 font-bold text-gray-800">{result.name}</td>
                  <td className="p-4 text-right font-mono text-lg text-blue-600 font-bold">{result.score} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Los puntos se calculan otorgando 5 pts por cada voto en Tier S, 4 pts en Tier A, 3 pts en Tier B, 2 pts en Tier C y 1 pt en Tier D.
          </p>
        </div>
      </div>
    </main>
  )
}
