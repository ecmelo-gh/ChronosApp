import { z } from 'zod'
import { baseFiltersSchema, paginationSchema } from '../shared/base.schema'

// Schema base da recompensa
const loyaltyRewardBaseSchema = z.object({
  loyaltyProgramId: z.string().uuid(),
  points: z.number().int().min(0),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REDEEMED']).default('PENDING'),
  redeemedAt: z.string().datetime().optional(),
})

// Schema para criação
export const createLoyaltyRewardSchema = loyaltyRewardBaseSchema

// Schema para atualização
export const updateLoyaltyRewardSchema = loyaltyRewardBaseSchema.partial()

// Schema para filtros de busca
export const loyaltyRewardFiltersSchema = baseFiltersSchema.extend({
  loyaltyProgramId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REDEEMED']).optional(),
})

// Schema para listagem paginada
export const listLoyaltyRewardsSchema = paginationSchema.merge(loyaltyRewardFiltersSchema)

// Tipos exportados
export type CreateLoyaltyRewardInput = z.infer<typeof createLoyaltyRewardSchema>
export type UpdateLoyaltyRewardInput = z.infer<typeof updateLoyaltyRewardSchema>
export type LoyaltyRewardFilters = z.infer<typeof loyaltyRewardFiltersSchema>
export type ListLoyaltyRewardsInput = z.infer<typeof listLoyaltyRewardsSchema>
