import { z } from 'zod'

// Enums
export const FeedbackSource = {
  APP: 'app',
  EMAIL: 'email',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  MANUAL: 'manual'
} as const

// Schemas
export const feedbackCreateSchema = z.object({
  message: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  source: z.enum([
    FeedbackSource.APP,
    FeedbackSource.EMAIL,
    FeedbackSource.SMS,
    FeedbackSource.WHATSAPP,
    FeedbackSource.MANUAL
  ]).default(FeedbackSource.APP),
  tags: z.array(z.string()).optional().default([]),
  appointmentId: z.string().uuid().optional()
})

export const feedbackUpdateSchema = feedbackCreateSchema.partial()

export const feedbackFilterSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  source: z.enum([
    FeedbackSource.APP,
    FeedbackSource.EMAIL,
    FeedbackSource.SMS,
    FeedbackSource.WHATSAPP,
    FeedbackSource.MANUAL
  ]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
  sortBy: z.enum(['rating', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Types
export type FeedbackCreate = z.infer<typeof feedbackCreateSchema>
export type FeedbackUpdate = z.infer<typeof feedbackUpdateSchema>
export type FeedbackFilter = z.infer<typeof feedbackFilterSchema>
