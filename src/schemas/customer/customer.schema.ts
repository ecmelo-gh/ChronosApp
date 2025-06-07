import { z } from 'zod'
import { baseFiltersSchema, paginationSchema } from '../shared/base.schema'
import { validateCPF, validatePhone } from '../utils/validations'

// Schema base do cliente
const customerBaseSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string()
    .refine(phone => !phone || validatePhone(phone), {
      message: 'Telefone inválido. Use o formato (99) 9999-9999 ou (99) 99999-9999'
    })
    .optional(),
  cpf: z.string()
    .refine(cpf => !cpf || validateCPF(cpf), {
      message: 'CPF inválido'
    })
    .optional(),
  birthDate: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
  photoUrl: z.string().url().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  userId: z.string().uuid(),
})

// Schema para criação
export const createCustomerSchema = customerBaseSchema

// Schema para atualização
export const updateCustomerSchema = customerBaseSchema.partial()

// Schema para filtros de busca
export const customerFiltersSchema = baseFiltersSchema.extend({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  cpf: z.string().optional(),
})

// Schema para listagem paginada
export const listCustomersSchema = paginationSchema.merge(customerFiltersSchema)

// Tipos exportados
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CustomerFilters = z.infer<typeof customerFiltersSchema>
export type ListCustomersInput = z.infer<typeof listCustomersSchema>
