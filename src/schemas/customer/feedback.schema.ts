import { z } from 'zod'
import { baseFiltersSchema, paginationSchema } from '../shared/base.schema'

// Schema base do feedback
const feedbackBaseSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  serviceId: z.string().uuid(),
  customerId: z.string().uuid(),
})

// Schema para criação
export const createFeedbackSchema = feedbackBaseSchema

// Schema para atualização
export const updateFeedbackSchema = feedbackBaseSchema.partial()

// Schema para filtros de busca
export const feedbackFiltersSchema = baseFiltersSchema.extend({
  serviceId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  minRating: z.number().int().min(1).max(5).optional(),
  maxRating: z.number().int().min(1).max(5).optional(),
  startDate: z.string().optional(), // YYYY-MM-DD
  endDate: z.string().optional(), // YYYY-MM-DD
})

// Schema para listagem paginada
export const listFeedbackSchema = paginationSchema.merge(feedbackFiltersSchema)

// Tipos exportados
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>
export type FeedbackFilters = z.infer<typeof feedbackFiltersSchema>
export type ListFeedbackInput = z.infer<typeof listFeedbackSchema>
