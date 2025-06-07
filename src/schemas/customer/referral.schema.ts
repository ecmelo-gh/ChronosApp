import { z } from 'zod'
import { baseFiltersSchema, paginationSchema } from '../shared/base.schema'
import { validatePhone } from '../utils/validations'

// Schema base da indicação
const referralBaseSchema = z.object({
  customerId: z.string().uuid(),
  userId: z.string().uuid(),
  referredName: z.string().min(2),
  referredPhone: z.string().refine(phone => validatePhone(phone), {
    message: 'Telefone inválido. Use o formato (99) 9999-9999 ou (99) 99999-9999'
  }),
  referredEmail: z.string().email().optional(),
  notes: z.string().optional(),
  source: z.enum(['APP', 'WEB', 'STORE']).default('APP'),
  status: z.enum(['PENDING', 'CONTACTED', 'CONVERTED', 'REJECTED']).default('PENDING'),
  convertedAt: z.string().datetime().optional(),
})

// Schema para criação
export const createReferralSchema = referralBaseSchema

// Schema para atualização
export const updateReferralSchema = referralBaseSchema.partial()

// Schema para filtros de busca
export const referralFiltersSchema = baseFiltersSchema.extend({
  customerId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'CONTACTED', 'CONVERTED', 'REJECTED']).optional(),
  source: z.enum(['APP', 'WEB', 'STORE']).optional(),
})

// Schema para listagem paginada
export const listReferralsSchema = paginationSchema.merge(referralFiltersSchema)

// Tipos exportados
export type CreateReferralInput = z.infer<typeof createReferralSchema>
export type UpdateReferralInput = z.infer<typeof updateReferralSchema>
export type ReferralFilters = z.infer<typeof referralFiltersSchema>
export type ListReferralsInput = z.infer<typeof listReferralsSchema>
