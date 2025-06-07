import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

import { successResponse, errorResponse } from '@/lib/api/responses'
import { validateRequest, withErrorHandler } from '@/lib/api/middleware'
import { changePasswordSchema } from '@/schemas/auth/password.schema'

const handler = async (req: NextRequest) => {
  // Verificar autenticação
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Não autorizado')
  }

  const data = await req.json()

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true }
  })

  if (!user) {
    return errorResponse('NOT_FOUND', 'Usuário não encontrado')
  }

  // Verificar senha atual
  const validPassword = await bcrypt.compare(
    data.currentPassword,
    user.password
  )

  if (!validPassword) {
    return errorResponse('BAD_REQUEST', 'Senha atual incorreta')
  }

  // Hash da nova senha
  const hashedPassword = await bcrypt.hash(data.newPassword, 10)

  // Atualizar senha
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  })

  return successResponse({
    message: 'Senha alterada com sucesso'
  })
}

// Exportar handler com middlewares
export const POST = withErrorHandler(
  validateRequest(changePasswordSchema, handler)
)
