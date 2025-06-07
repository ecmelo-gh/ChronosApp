import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { successResponse, errorResponse } from '@/lib/api/responses'
import { validateRequest, withErrorHandler } from '@/lib/api/middleware'
import { confirmResetSchema } from '@/schemas/auth/password.schema'

const handler = async (req: NextRequest) => {
  const data = await req.json()

  // Buscar e validar token
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token: data.token,
      expires: { gt: new Date() }
    }
  })

  if (!verificationToken) {
    return errorResponse('BAD_REQUEST', 'Token inválido ou expirado')
  }

  try {
    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(data.newPassword, 10)

    // Atualizar senha e remover token em uma transação
    await prisma.$transaction(async (prisma) => {
      // Atualizar senha do usuário
      await prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { password: hashedPassword }
      })

      // Remover token usado
      await prisma.verificationToken.delete({
        where: { token: data.token }
      })
    })

    return successResponse({
      message: 'Senha redefinida com sucesso'
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return errorResponse('NOT_FOUND', 'Token não encontrado')
      }
    }
    throw error // será capturado pelo withErrorHandler
  }
}

// Exportar handler com middlewares
export const POST = withErrorHandler(
  validateRequest(confirmResetSchema, handler)
)
