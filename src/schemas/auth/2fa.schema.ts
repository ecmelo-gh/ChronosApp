import { z } from 'zod'

export const setup2FASchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const verify2FASchema = z.object({
  code: z.string().length(6, 'Código deve ter 6 dígitos').regex(/^\d+$/, 'Código deve conter apenas números'),
})

export const verify2FAWithBackupSchema = z.object({
  code: z.string().length(8, 'Código de backup deve ter 8 caracteres').regex(/^[A-Z0-9]+$/, 'Código de backup deve conter apenas letras maiúsculas e números'),
})

export const disable2FASchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória'),
  code: z.string().length(6, 'Código deve ter 6 dígitos').regex(/^\d+$/, 'Código deve conter apenas números'),
})

export type Setup2FAInput = z.infer<typeof setup2FASchema>
export type Verify2FAInput = z.infer<typeof verify2FASchema>
export type Verify2FAWithBackupInput = z.infer<typeof verify2FAWithBackupSchema>
export type Disable2FAInput = z.infer<typeof disable2FASchema>
