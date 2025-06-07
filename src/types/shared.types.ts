import { z } from 'zod'
import { paginationSchema, baseFiltersSchema } from '@/schemas/shared/base.schema'

// Tipos inferidos dos schemas base
export type Pagination = z.infer<typeof paginationSchema>
export type BaseFilters = z.infer<typeof baseFiltersSchema>

// Tipo genérico para respostas paginadas
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Tipo para erros da API
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
