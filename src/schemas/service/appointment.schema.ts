import { z } from 'zod'
import { baseFiltersSchema, paginationSchema } from '../shared/base.schema'

// Schema base do agendamento
const appointmentBaseSchema = z.object({
  serviceId: z.string().uuid(),
  customerId: z.string().uuid(),
  date: z.string().datetime(), // DateTime no Prisma
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).default('scheduled'),
  notes: z.string().optional(),
  userId: z.string().uuid(),
})

// Schema para criação
export const createAppointmentSchema = appointmentBaseSchema

// Schema para atualização
export const updateAppointmentSchema = appointmentBaseSchema.partial()

// Schema para filtros de busca
export const appointmentFiltersSchema = baseFiltersSchema.extend({
  serviceId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
})

// Schema para verificação de disponibilidade
export const availabilitySchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().datetime(),
})

// Schema para listagem paginada
export const listAppointmentsSchema = paginationSchema.merge(appointmentFiltersSchema)

// Tipos exportados
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type AppointmentFilters = z.infer<typeof appointmentFiltersSchema>
export type ListAppointmentsInput = z.infer<typeof listAppointmentsSchema>
export type AvailabilityInput = z.infer<typeof availabilitySchema>
