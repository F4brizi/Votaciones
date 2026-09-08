import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import VoteWrapper from './VoteWrapper'

export default async function PollPage({ params }: { params: { id: string } }) {
  const session = await auth()
  
  const poll = await prisma.poll.findUnique({
    where: { id: params.id },
    include: {
      options: true,
      creator: { select: { name: true } }
    }
  })

  if (!poll) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Encuesta no encontrada</h1>
          <Link href="/" className="text-indigo-600 hover:underline font-medium">Volver al inicio</Link>
        </div>
      </main>
    )
  }

  // Check if user is logged in
  if (!session?.user?.email) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow border border-gray-100 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{poll.title}</h1>
          <p className="text-gray-500 mb-8">Debes iniciar sesión con Google para votar. Tu voto será anónimo.</p>
          <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-colors block">
            Iniciar Sesión
          </Link>
        </div>
      </main>
    )
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect('/')

  // Check if user already voted
  const participation = await prisma.participation.findUnique({
    where: {
      userId_pollId: {
        userId: user.id,
        pollId: poll.id
      }
    }
  })

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-3">{poll.title}</h1>
          <p className="text-lg text-gray-600">Creado por {poll.creator.name}</p>
          {poll.description && <p className="mt-4 text-gray-500 max-w-2xl mx-auto">{poll.description}</p>}
        </div>

        {!poll.isOpen ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">Esta encuesta está cerrada</h2>
            <p>El creador ha cerrado las votaciones.</p>
            <div className="mt-6">
              <Link href={`/poll/${poll.id}/results`} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                Ver Resultados Finales
              </Link>
            </div>
          </div>
        ) : participation ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">¡Gracias por votar!</h2>
            <p>Tu participación ha sido registrada exitosamente de forma anónima.</p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/dashboard" className="bg-white text-green-800 border border-green-300 hover:bg-green-100 font-bold py-3 px-8 rounded-xl transition-colors">
                Ir a mi Dashboard
              </Link>
              <Link href={`/poll/${poll.id}/results`} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                Ver Resultados
              </Link>
            </div>
          </div>
        ) : (
          <VoteWrapper pollId={poll.id} options={poll.options} />
        )}
      </div>
    </main>
  )
}
