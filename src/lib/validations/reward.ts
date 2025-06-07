import { z } from 'zod'

// Enums
export const RewardStatus = {
  AVAILABLE: 'available',
  REDEEMED: 'redeemed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
} as const

export const RewardType = {
  DISCOUNT: 'discount',
  SERVICE: 'service',
  PRODUCT: 'product',
  CUSTOM: 'custom'
} as const

// Schemas
export const rewardCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum([
    RewardType.DISCOUNT,
    RewardType.SERVICE,
    RewardType.PRODUCT,
    RewardType.CUSTOM
  ]),
  points: z.number().int().positive(),
  value: z.number().positive(),
  expiresAt: z.string().datetime(),
  status: z.enum([
    RewardStatus.AVAILABLE,
    RewardStatus.REDEEMED,
    RewardStatus.EXPIRED,
    RewardStatus.CANCELLED
  ]).default(RewardStatus.AVAILABLE),
  redeemedAt: z.string().datetime().optional().nullable(),
  maxRedemptions: z.number().int().positive().optional(),
  termsAndConditions: z.string().optional()
})

export const rewardUpdateSchema = rewardCreateSchema.partial()

export const rewardFilterSchema = z.object({
  status: z.enum([
    RewardStatus.AVAILABLE,
    RewardStatus.REDEEMED,
    RewardStatus.EXPIRED,
    RewardStatus.CANCELLED
  ]).optional(),
  type: z.enum([
    RewardType.DISCOUNT,
    RewardType.SERVICE,
    RewardType.PRODUCT,
    RewardType.CUSTOM
  ]).optional(),
  minPoints: z.number().int().optional(),
  maxPoints: z.number().int().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
  sortBy: z.enum(['title', 'points', 'value', 'expiresAt', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Types
export type RewardCreate = z.infer<typeof rewardCreateSchema>
export type RewardUpdate = z.infer<typeof rewardUpdateSchema>
export type RewardFilter = z.infer<typeof rewardFilterSchema>
