import { z } from 'zod'

// Enums
export const RedemptionStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
} as const

// Schemas
export const redemptionCreateSchema = z.object({
  rewardId: z.string(),
  notes: z.string().optional(),
  desiredRedemptionDate: z.string().datetime().optional()
})

export const redemptionUpdateSchema = z.object({
  status: z.enum([
    RedemptionStatus.PENDING,
    RedemptionStatus.CONFIRMED,
    RedemptionStatus.CANCELLED,
    RedemptionStatus.EXPIRED
  ]),
  notes: z.string().optional(),
  redeemedAt: z.string().datetime().optional()
}).partial()

export const redemptionFilterSchema = z.object({
  status: z.enum([
    RedemptionStatus.PENDING,
    RedemptionStatus.CONFIRMED,
    RedemptionStatus.CANCELLED,
    RedemptionStatus.EXPIRED
  ]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  rewardType: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
  sortBy: z.enum(['created_at', 'redeemedAt', 'points']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Types
export type RedemptionCreate = z.infer<typeof redemptionCreateSchema>
export type RedemptionUpdate = z.infer<typeof redemptionUpdateSchema>
export type RedemptionFilter = z.infer<typeof redemptionFilterSchema>
