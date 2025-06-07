import { z } from 'zod'

// Enums
export const ServiceStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const

// Schemas
export const serviceCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  duration: z.number().int().positive(),
  price: z.number().positive(),
  status: z.enum([ServiceStatus.ACTIVE, ServiceStatus.INACTIVE]).default(ServiceStatus.ACTIVE)
})

export const serviceUpdateSchema = serviceCreateSchema.partial()

export const serviceFilterSchema = z.object({
  search: z.string().optional().nullable(),
  status: z.enum([ServiceStatus.ACTIVE, ServiceStatus.INACTIVE]).optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
  sortBy: z.enum(['name', 'price', 'duration', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Types
export type ServiceCreate = z.infer<typeof serviceCreateSchema>
export type ServiceUpdate = z.infer<typeof serviceUpdateSchema>
export type ServiceFilter = z.infer<typeof serviceFilterSchema>
