import { z } from 'zod'
import { baseFiltersSchema, paginationSchema } from './shared/base.schema'

// Schema base do feedback
const feedbackBaseSchema = z.object({
  customerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(3).max(500),
  source: z.string(),
  status: z.enum(['active', 'inactive', 'reported']).default('active'),
  appointmentId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional()
})

// Schema para criação
export const createFeedbackSchema = feedbackBaseSchema

// Schema para atualização
export const updateFeedbackSchema = feedbackBaseSchema.partial()

// Schema para resposta do proprietário
export const ownerReplySchema = z.object({
  reply: z.string().min(3).max(500)
})

// Schema para reportar feedback
export const reportFeedbackSchema = z.object({
  reason: z.string().min(3).max(200)
})

// Schema para filtros
export const feedbackFilterSchema = baseFiltersSchema.extend({
  rating: z.number().int().min(1).max(5).optional(),
  status: z.enum(['active', 'inactive', 'reported']).optional(),
  serviceId: z.string().uuid().optional(),
  hasReply: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

// Schema para listagem paginada
export const listFeedbackSchema = paginationSchema.merge(feedbackFilterSchema)

// Types
export type FeedbackBase = z.infer<typeof feedbackBaseSchema>
export type CreateFeedback = z.infer<typeof createFeedbackSchema>
export type UpdateFeedback = z.infer<typeof updateFeedbackSchema>
export type OwnerReply = z.infer<typeof ownerReplySchema>
export type ReportFeedback = z.infer<typeof reportFeedbackSchema>
export type FeedbackFilter = z.infer<typeof feedbackFilterSchema>
export type ListFeedback = z.infer<typeof listFeedbackSchema>
