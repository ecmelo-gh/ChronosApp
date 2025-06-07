import { z } from 'zod'

// Enums
export const ReferralStatus = {
  PENDING: 'pending',
  CONVERTED: 'converted',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
} as const

// Schemas
export const referralCreateSchema = z.object({
  referredName: z.string().min(1),
  referredPhone: z.string().min(10),
  referredEmail: z.string().email().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum([
    ReferralStatus.PENDING,
    ReferralStatus.CONVERTED,
    ReferralStatus.EXPIRED,
    ReferralStatus.CANCELLED
  ]).default(ReferralStatus.PENDING),
  convertedAt: z.string().datetime().optional().nullable()
})

export const referralUpdateSchema = referralCreateSchema
  .extend({
    convertedCustomerId: z.string().uuid().optional().nullable()
  })
  .partial()

export const referralFilterSchema = z.object({
  status: z.enum([
    ReferralStatus.PENDING,
    ReferralStatus.CONVERTED,
    ReferralStatus.EXPIRED,
    ReferralStatus.CANCELLED
  ]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
  sortBy: z.enum(['referredName', 'status', 'created_at', 'convertedAt']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Types
export type ReferralCreate = z.infer<typeof referralCreateSchema>
export type ReferralUpdate = z.infer<typeof referralUpdateSchema>
export type ReferralFilter = z.infer<typeof referralFilterSchema>
