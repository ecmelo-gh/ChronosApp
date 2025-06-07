import { z } from 'zod'
import { baseFiltersSchema, paginationSchema } from '../shared/base.schema'

// Schema base do serviço
const serviceBaseSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  duration: z.number().int().min(1), // duração em minutos
  price: z.number().positive(), // Float no Prisma
  userId: z.string().uuid(),
  status: z.enum(['active', 'inactive']).default('active'),
})

// Schema para criação
export const createServiceSchema = serviceBaseSchema

// Schema para atualização
export const updateServiceSchema = serviceBaseSchema.partial()

// Schema para filtros de busca
export const serviceFiltersSchema = baseFiltersSchema.extend({
  userId: z.string().uuid().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().optional(),
  minDuration: z.number().int().min(1).optional(),
  maxDuration: z.number().int().optional(),
})

// Schema para listagem paginada
export const listServicesSchema = paginationSchema.merge(serviceFiltersSchema)

// Schema para estatísticas
export const serviceStatsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  groupBy: z.enum(['day', 'week', 'month', 'year']),
})

// Tipos exportados
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
export type ServiceFilters = z.infer<typeof serviceFiltersSchema>
export type ListServicesInput = z.infer<typeof listServicesSchema>
export type ServiceStatsInput = z.infer<typeof serviceStatsSchema>
