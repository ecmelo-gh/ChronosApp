import { z } from 'zod'

// Pagination schema comum para todas as rotas que usam paginação
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  sortBy: z.string().optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// Schema base para filtros com search e status
export const baseFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

// Schema para datas de criação/atualização
export const timestampsSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
})
