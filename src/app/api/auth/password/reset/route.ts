import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

import { successResponse } from '@/lib/api/responses'
import { validateRequest, withErrorHandler } from '@/lib/api/middleware'
import { resetPasswordSchema } from '@/schemas/auth/password.schema'

const handler = async (req: NextRequest) => {
  const data = await req.json()

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true, email: true }
  })

  // Por segurança, retornamos a mesma mensagem independente do email existir ou não
  const message = 'Se o email existir, você receberá instruções para redefinir sua senha'

  // Se o usuário não existe, retornamos sucesso mesmo assim
  if (!user) {
    return successResponse({ message })
  }

  // Gerar token de reset
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hora

  // Criar token de verificação
  await prisma.verificationToken.create({
    data: {
      identifier: user.email!,
      token,
      expires
    }
  })

  // TODO: Enviar email com link para reset de senha contendo o token

  return successResponse({ message })
}

// Exportar handler com middlewares
export const POST = withErrorHandler(
  validateRequest(resetPasswordSchema, handler)
)
