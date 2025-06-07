import { z } from 'zod'

// Enums
export const CustomerStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const

// Regex para validação de telefone: (99) 99999-9999 ou (99) 9999-9999
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/

// Regex para validação de CPF: 999.999.999-99
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/

// Schemas
export const customerSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1),
  email: z.string().email('Email inválido').optional().nullable(),
  phone: z.string().regex(phoneRegex, 'Telefone inválido').optional().nullable(),
  cpf: z.string().regex(cpfRegex, 'CPF inválido').optional().nullable(),
  birthDate: z.string().optional().nullable().refine((date) => {
    if (!date) return true
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }, 'Data de nascimento inválida'),
  imageUrl: z.string().url('URL da imagem inválida').optional().nullable(),
  photoUrl: z.string().url('URL da foto inválida').optional().nullable(),
  status: z.enum([CustomerStatus.ACTIVE, CustomerStatus.INACTIVE]).default(CustomerStatus.ACTIVE),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const customerCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(), // ISO date string
  imageUrl: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  status: z.enum([CustomerStatus.ACTIVE, CustomerStatus.INACTIVE]).default(CustomerStatus.ACTIVE)
})

export const customerUpdateSchema = customerCreateSchema.partial()

export const customerFilterSchema = z.object({
  search: z.string().optional().nullable(),
  status: z.enum([CustomerStatus.ACTIVE, CustomerStatus.INACTIVE]).optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
  sortBy: z.enum(['full_name', 'email', 'created_at', 'updated_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Types
export type Customer = z.infer<typeof customerSchema>
export type CustomerCreate = z.infer<typeof customerCreateSchema>
export type CustomerUpdate = z.infer<typeof customerUpdateSchema>
export type CustomerFilter = z.infer<typeof customerFilterSchema>
