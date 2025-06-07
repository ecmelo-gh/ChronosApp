import { z } from 'zod'

// Enums
export const LoyaltyStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED'
} as const

export const LoyaltyLevel = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM'
} as const

// Schemas
export const loyaltyCreateSchema = z.object({
  points: z.number().int().nonnegative(),
  level: z.enum([
    LoyaltyLevel.BRONZE,
    LoyaltyLevel.SILVER,
    LoyaltyLevel.GOLD,
    LoyaltyLevel.PLATINUM
  ]).default(LoyaltyLevel.BRONZE),
  currentValue: z.number().nonnegative(),
  targetValue: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum([
    LoyaltyStatus.ACTIVE,
    LoyaltyStatus.INACTIVE,
    LoyaltyStatus.EXPIRED
  ]).default(LoyaltyStatus.ACTIVE)
})

export const loyaltyUpdateSchema = loyaltyCreateSchema.partial()

export const loyaltyFilterSchema = z.object({
  status: z.enum([
    LoyaltyStatus.ACTIVE,
    LoyaltyStatus.INACTIVE,
    LoyaltyStatus.EXPIRED
  ]).optional(),
  level: z.enum([
    LoyaltyLevel.BRONZE,
    LoyaltyLevel.SILVER,
    LoyaltyLevel.GOLD,
    LoyaltyLevel.PLATINUM
  ]).optional(),
  minPoints: z.number().int().nonnegative().optional(),
  maxPoints: z.number().int().nonnegative().optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
  sortBy: z.enum(['points', 'level', 'currentValue', 'endDate', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Types
export type LoyaltyCreate = z.infer<typeof loyaltyCreateSchema>
export type LoyaltyUpdate = z.infer<typeof loyaltyUpdateSchema>
export type LoyaltyFilter = z.infer<typeof loyaltyFilterSchema>
