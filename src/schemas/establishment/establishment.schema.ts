import { z } from 'zod'
import { baseFiltersSchema, paginationSchema } from '../shared/base.schema'
import { validatePhone } from '../utils/validations'

// Schema base do estabelecimento
const establishmentBaseSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  phone: z.string().refine(phone => validatePhone(phone), {
    message: 'Telefone inválido. Use o formato (99) 9999-9999 ou (99) 99999-9999'
  }),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  coverUrl: z.string().url().optional(),
  businessHours: z.record(z.string(), z.array(z.object({
    start: z.string(),
    end: z.string(),
  }))).optional(),
  features: z.array(z.string()),
  status: z.enum(['active', 'inactive']).default('active'),
  userId: z.string().uuid(),
})

// Schema para criação
export const createEstablishmentSchema = establishmentBaseSchema

// Schema para atualização
export const updateEstablishmentSchema = establishmentBaseSchema.partial()

// Schema para filtros de busca
export const establishmentFiltersSchema = baseFiltersSchema.extend({
  userId: z.string().uuid().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
})

// Schema para listagem paginada
export const listEstablishmentsSchema = paginationSchema.merge(establishmentFiltersSchema)

// Tipos exportados
export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>
export type EstablishmentFilters = z.infer<typeof establishmentFiltersSchema>
export type ListEstablishmentsInput = z.infer<typeof listEstablishmentsSchema>
