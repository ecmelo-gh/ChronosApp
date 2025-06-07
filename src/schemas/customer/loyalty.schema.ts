import { z } from 'zod'
import { baseFiltersSchema, paginationSchema } from '../shared/base.schema'

// Schema base do programa de fidelidade
const loyaltyBaseSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  points: z.number().int().min(0),
  type: z.enum(['points', 'visits']),
  serviceId: z.string().uuid(),
  customerId: z.string().uuid(),
})

// Schema para criação de recompensa
export const createLoyaltyRewardSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  pointsRequired: z.number().int().min(1),
  type: z.enum(['discount', 'free_service', 'product']),
  value: z.number().min(0), // Valor do desconto ou produto
})

// Schema para atualização de recompensa
export const updateLoyaltyRewardSchema = createLoyaltyRewardSchema.partial()

// Schema para filtros de busca
export const loyaltyFiltersSchema = baseFiltersSchema.extend({
  serviceId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  minPoints: z.number().int().min(0).optional(),
  maxPoints: z.number().int().optional(),
  type: z.enum(['points', 'visits']).optional(),
})

// Schema para listagem paginada
export const listLoyaltySchema = paginationSchema.merge(loyaltyFiltersSchema)

// Tipos exportados
export type CreateLoyaltyRewardInput = z.infer<typeof createLoyaltyRewardSchema>
export type UpdateLoyaltyRewardInput = z.infer<typeof updateLoyaltyRewardSchema>
export type LoyaltyFilters = z.infer<typeof loyaltyFiltersSchema>
export type ListLoyaltyInput = z.infer<typeof listLoyaltySchema>
