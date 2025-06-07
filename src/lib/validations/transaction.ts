import { z } from 'zod'

// Enums
export const TransactionType = {
  CREDIT: 'credit',
  DEBIT: 'debit'
} as const

export const TransactionSource = {
  PURCHASE: 'purchase',
  REWARD: 'reward',
  REFERRAL: 'referral',
  MANUAL: 'manual',
  BONUS: 'bonus',
  OTHER: 'other'
} as const

// Schemas
export const transactionCreateSchema = z.object({
  points: z.number().int().positive(),
  type: z.enum([TransactionType.CREDIT, TransactionType.DEBIT]),
  source: z.enum([
    TransactionSource.PURCHASE,
    TransactionSource.REWARD,
    TransactionSource.REFERRAL,
    TransactionSource.MANUAL,
    TransactionSource.BONUS,
    TransactionSource.OTHER
  ]),
  description: z.string().min(1),
  referenceId: z.string().optional()
})

export const transactionFilterSchema = z.object({
  type: z.enum([TransactionType.CREDIT, TransactionType.DEBIT]).optional(),
  source: z.enum([
    TransactionSource.PURCHASE,
    TransactionSource.REWARD,
    TransactionSource.REFERRAL,
    TransactionSource.MANUAL,
    TransactionSource.BONUS,
    TransactionSource.OTHER
  ]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minPoints: z.number().int().optional(),
  maxPoints: z.number().int().optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
  sortBy: z.enum(['points', 'type', 'source', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Types
export type TransactionCreate = z.infer<typeof transactionCreateSchema>
export type TransactionFilter = z.infer<typeof transactionFilterSchema>
