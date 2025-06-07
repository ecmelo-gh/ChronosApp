import { z } from 'zod'

// Common validation patterns
const PHONE_REGEX = /^(?:\+55|)\d{2}9?\d{8}$/
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const POSTAL_CODE_REGEX = /^\d{5}-\d{3}$/

// Common validation messages
export const validationMessages = {
  required: 'Este campo é obrigatório',
  email: 'Email inválido',
  minLength: (min: number) => `Mínimo de ${min} caracteres`,
  maxLength: (max: number) => `Máximo de ${max} caracteres`,
  passwordMatch: 'As senhas não conferem',
  phone: 'Telefone inválido (formato: XX9XXXXXXXX)',
  cpf: 'CPF inválido (formato: XXX.XXX.XXX-XX)',
  postalCode: 'CEP inválido (formato: XXXXX-XXX)',
}

// Base schemas for reuse
export const emailSchema = z
  .string()
  .min(1, { message: validationMessages.required })
  .email({ message: validationMessages.email })

export const passwordSchema = z
  .string()
  .min(8, { message: validationMessages.minLength(8) })
  .max(72, { message: validationMessages.maxLength(72) })

export const phoneSchema = z
  .string()
  .min(1, { message: validationMessages.required })
  .regex(PHONE_REGEX, { message: validationMessages.phone })

export const cpfSchema = z
  .string()
  .min(1, { message: validationMessages.required })
  .regex(CPF_REGEX, { message: validationMessages.cpf })

export const postalCodeSchema = z
  .string()
  .min(1, { message: validationMessages.required })
  .regex(POSTAL_CODE_REGEX, { message: validationMessages.postalCode })

// Form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = z.object({
  name: z.string().min(1, { message: validationMessages.required }),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: validationMessages.passwordMatch,
  path: ['confirmPassword'],
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: validationMessages.passwordMatch,
  path: ['confirmPassword'],
})

export const customerSchema = z.object({
  full_name: z.string().min(1, { message: validationMessages.required }),
  email: emailSchema.optional(),
  phone: phoneSchema,
  cpf: cpfSchema.optional(),
  birthDate: z.string().optional(),
})

export const establishmentSchema = z.object({
  name: z.string().min(1, { message: validationMessages.required }),
  description: z.string().optional(),
  address: z.string().min(1, { message: validationMessages.required }),
  city: z.string().min(1, { message: validationMessages.required }),
  state: z.string().min(1, { message: validationMessages.required }),
  zipCode: postalCodeSchema,
  phone: phoneSchema,
})

export const serviceSchema = z.object({
  name: z.string().min(1, { message: validationMessages.required }),
  description: z.string().optional(),
  duration: z.number().min(1, { message: validationMessages.required }),
  price: z.number().min(0, { message: 'O preço deve ser maior ou igual a zero' }),
})

// Types
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type CustomerFormData = z.infer<typeof customerSchema>
export type EstablishmentFormData = z.infer<typeof establishmentSchema>
export type ServiceFormData = z.infer<typeof serviceSchema>
