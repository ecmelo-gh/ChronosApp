import { z } from 'zod'

// Enums
export const AppointmentStatus = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
} as const

// Schemas
export const appointmentCreateSchema = z.object({
  customerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z.string().datetime(),
  notes: z.string().optional().nullable(),
  status: z.enum([
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW
  ]).default(AppointmentStatus.SCHEDULED)
})

export const appointmentUpdateSchema = appointmentCreateSchema
  .omit({ customerId: true })
  .partial()

export const appointmentFilterSchema = z.object({
  customerId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  status: z.enum([
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW
  ]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
  sortBy: z.enum(['date', 'status', 'created_at']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Types
export type AppointmentCreate = z.infer<typeof appointmentCreateSchema>
export type AppointmentUpdate = z.infer<typeof appointmentUpdateSchema>
export type AppointmentFilter = z.infer<typeof appointmentFilterSchema>
