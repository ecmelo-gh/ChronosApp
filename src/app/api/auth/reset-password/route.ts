import { NextRequest } from 'next/server'
import { dbActions } from '@/lib/db/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'

import { successResponse, errorResponse } from '@/lib/api/responses'
import { validateRequest, withErrorHandler } from '@/lib/api/middleware'

// Schema para solicitação de reset
const requestResetSchema = z.object({
  email: z.string().email('Email inválido'),
})

// Schema para reset de senha
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(8).max(100).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial'
  ),
})

// Handler para solicitação de reset
const handleRequestReset = async (req: NextRequest) => {
  const data = await req.json()

  // Verificar se usuário existe
  const user = await dbActions.users.findByEmail(data.email)

  if (!user) {
    // Por segurança, não informamos se o email existe ou não
    return successResponse({
      message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
    })
  }

  // Criar token de reset
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

  await dbActions.passwordResetTokens.create({
    email: data.email,
    token,
    expires,
  })

  // TODO: Enviar email com link de reset
  // O link deve ser algo como: /reset-password?token={token}

  return successResponse({
    message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
  })
}

// Handler para reset de senha
const handleReset = async (req: NextRequest) => {
  const data = await req.json()

  // Verificar token
  const resetToken = await dbActions.passwordResetTokens.findValid(data.token)

  if (!resetToken) {
    return errorResponse(
      'BAD_REQUEST',
      'Token inválido ou expirado',
      undefined,
      400
    )
  }

  // Hash da nova senha
  const hashedPassword = await bcrypt.hash(data.password, 10)

  try {
    // Atualizar senha e invalidar token em uma transação
    // Atualizar senha e marcar token como usado
    await Promise.all([
      dbActions.users.updatePassword(resetToken.email, hashedPassword),
      dbActions.passwordResetTokens.markAsUsed(resetToken.id)
    ])

    return successResponse({
      message: 'Senha alterada com sucesso.',
    })
  } catch (error) {
    throw error // será capturado pelo withErrorHandler
  }
}

// Exportar handlers com middlewares
export const POST = withErrorHandler(
  validateRequest(requestResetSchema, handleRequestReset)
)

export const PATCH = withErrorHandler(
  validateRequest(resetPasswordSchema, handleReset)
)
