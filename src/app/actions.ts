'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'

// Verify user is logged in
async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) throw new Error("User not found")
  
  return user
}

// Create a new Poll
export async function createPoll(formData: FormData) {
  try {
    const user = await getAuthUser()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    
    // We expect options to be passed as option_0_name, option_0_image, etc.
    const optionsCount = parseInt(formData.get('optionsCount') as string || '0')
    const optionsData = []
    
    for (let i = 0; i < optionsCount; i++) {
      const name = formData.get(`option_${i}_name`) as string
      const imageFile = formData.get(`option_${i}_image`) as File | null
      
      let imageUrl = null
      if (imageFile && imageFile.size > 0) {
        // Upload to Vercel Blob
        const blob = await put(`polls/${Date.now()}-${imageFile.name}`, imageFile, { access: 'public' })
        imageUrl = blob.url
      }
      
      optionsData.push({ name, imageUrl })
    }
    
    if (optionsData.length < 2) {
      throw new Error("Se necesitan al menos 2 opciones")
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        description,
        creatorId: user.id,
        options: {
          create: optionsData
        }
      }
    })
    
    revalidatePath('/dashboard')
    return { success: true, pollId: poll.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Cast a Vote anonymously
export async function castPollVote(pollId: string, ranking: Record<string, string[]>) {
  try {
    const user = await getAuthUser()
    
    // Check if poll exists and is open
    const poll = await prisma.poll.findUnique({ where: { id: pollId } })
    if (!poll) throw new Error("Encuesta no encontrada")
    if (!poll.isOpen) throw new Error("La encuesta está cerrada")
    
    // Check if user already voted (Prevention of double vote)
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        userId_pollId: {
          userId: user.id,
          pollId: poll.id
        }
      }
    })
    
    if (existingParticipation) {
      throw new Error("Ya has votado en esta encuesta")
    }
    
    // Transaction: Record participation AND save anonymous vote
    await prisma.$transaction(async (tx) => {
      await tx.participation.create({
        data: {
          userId: user.id,
          pollId: poll.id
        }
      })
      
      await tx.vote.create({
        data: {
          pollId: poll.id,
          ranking: JSON.stringify(ranking)
        }
      })
    })
    
    revalidatePath(`/poll/${pollId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function togglePollStatus(pollId: string) {
  try {
    const user = await getAuthUser()
    const poll = await prisma.poll.findUnique({ where: { id: pollId } })
    
    if (!poll) throw new Error("No encontrada")
    if (poll.creatorId !== user.id) throw new Error("No tienes permiso")
      
    await prisma.poll.update({
      where: { id: pollId },
      data: { isOpen: !poll.isOpen }
    })
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
