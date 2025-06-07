import { z } from 'zod'
import { baseFiltersSchema, paginationSchema } from './shared/base.schema'

// Enums
export const AppointmentStatus = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
} as const

// Schema base
export const appointmentBaseSchema = z.object({
  customerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z.string().datetime(),
  duration: z.number().int().positive(),
  notes: z.string().max(500).optional(),
  status: z.enum([
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW
  ]).default(AppointmentStatus.SCHEDULED)
})

// Schema para criação
export const createAppointmentSchema = appointmentBaseSchema

// Schema para atualização
export const updateAppointmentSchema = appointmentBaseSchema.partial()

// Schema para filtros
export const appointmentFilterSchema = baseFiltersSchema.extend({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum([
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW
  ]).optional(),
  serviceId: z.string().uuid().optional()
})

// Schema para ordenação
export const appointmentSortingSchema = z.object({
  sortBy: z.enum(['date', 'status', 'created_at']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Schema para listagem paginada
export const listAppointmentsSchema = paginationSchema
  .merge(appointmentFilterSchema)
  .merge(appointmentSortingSchema)

// Types
export type AppointmentBase = z.infer<typeof appointmentBaseSchema>
export type CreateAppointment = z.infer<typeof createAppointmentSchema>
export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>
export type AppointmentFilter = z.infer<typeof appointmentFilterSchema>
export type ListAppointments = z.infer<typeof listAppointmentsSchema>
