'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function verifyToken(code: string) {
  const token = await prisma.token.findUnique({
    where: { code }
  })
  
  if (!token) {
    return { success: false, error: 'Código inválido' }
  }
  
  if (token.isUsed) {
    return { success: false, error: 'Este código ya ha sido utilizado' }
  }
  
  return { success: true }
}

export async function castVote(code: string, ranking: any) {
  // 1. Verificar token otra vez por seguridad
  const token = await prisma.token.findUnique({
    where: { code }
  })
  
  if (!token || token.isUsed) {
    return { success: false, error: 'Código inválido o ya utilizado' }
  }
  
  // 2. Transacción para marcar token como usado y guardar voto simultáneamente
  try {
    await prisma.$transaction(async (tx) => {
      // Marcar token como usado
      await tx.token.update({
        where: { id: token.id },
        data: { isUsed: true }
      })
      
      // Guardar el voto (sin relación alguna con el token)
      await tx.vote.create({
        data: {
          ranking: JSON.stringify(ranking)
        }
      })
    })
    
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error casting vote:', error)
    return { success: false, error: 'Hubo un error al guardar tu voto.' }
  }
}
