import { z } from 'zod'

const passwordValidation = z.string().min(8).max(100).regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  'A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial'
)

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: passwordValidation
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const confirmResetSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: passwordValidation
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ConfirmResetInput = z.infer<typeof confirmResetSchema>
