import { z } from 'zod'

// Enums
export const CustomerStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED'
} as const

// Base schemas
export const customerBaseSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos').optional(),
  birthDate: z.string().datetime().optional(),
  imageUrl: z.string().url('URL inválida').optional(),
  photoUrl: z.string().url('URL inválida').optional(),
  status: z.enum([CustomerStatus.ACTIVE, CustomerStatus.INACTIVE, CustomerStatus.BLOCKED])
    .default(CustomerStatus.ACTIVE)
})

// Create schema
export const customerCreateSchema = customerBaseSchema

// Update schema
export const customerUpdateSchema = customerBaseSchema.partial()

// Filter schema
export const customerFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum([CustomerStatus.ACTIVE, CustomerStatus.INACTIVE, CustomerStatus.BLOCKED]).optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
  sortBy: z.enum(['created_at', 'full_name', 'email']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Types
export type CustomerBase = z.infer<typeof customerBaseSchema>
export type CustomerCreate = z.infer<typeof customerCreateSchema>
export type CustomerUpdate = z.infer<typeof customerUpdateSchema>
export type CustomerFilter = z.infer<typeof customerFilterSchema>
