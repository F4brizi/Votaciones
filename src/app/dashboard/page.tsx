import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { togglePollStatus } from '@/app/actions'
import { revalidatePath } from 'next/cache'

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user?.email) redirect('/')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect('/')

  const myPolls = await prisma.poll.findMany({
    where: { creatorId: user.id },
    include: {
      _count: { select: { votes: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Encuestas</h1>
            <p className="text-gray-500">Administra tus tier lists y mira los resultados.</p>
          </div>
          <Link href="/dashboard/new" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow">
            + Crear Nueva Encuesta
          </Link>
        </div>

        {myPolls.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes encuestas todavía</h3>
            <p className="text-gray-500 mb-6">Crea tu primer Tier List para que tus amigos voten.</p>
            <Link href="/dashboard/new" className="text-indigo-600 font-bold hover:underline">Crear ahora &rarr;</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myPolls.map(poll => (
              <div key={poll.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-gray-900 truncate pr-2">{poll.title}</h3>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${poll.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {poll.isOpen ? 'Abierta' : 'Cerrada'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">{poll.description || 'Sin descripción'}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-500 font-medium">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    {poll._count.votes} votos recibidos
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/poll/${poll.id}`} className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-lg text-sm transition-colors">
                      Ver/Votar
                    </Link>
                    <Link href={`/poll/${poll.id}/results`} className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded-lg text-sm transition-colors">
                      Resultados
                    </Link>
                  </div>
                  
                  <form action={async () => {
                    'use server'
                    await togglePollStatus(poll.id)
                  }}>
                    <button type="submit" className="w-full text-center text-sm text-gray-500 hover:text-gray-900 py-2 border border-gray-200 rounded-lg transition-colors font-medium">
                      {poll.isOpen ? 'Cerrar votación' : 'Reabrir votación'}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
