import { NextRequest } from 'next/server'
import { z } from 'zod'
import type { appointments, customers, services, establishments, professionals, users } from '@prisma/client'
import { dbActions } from '@/lib/db/client'
import { validateRequest, withErrorHandler } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/responses'
import { sendAppointmentRescheduled, sendAppointmentConfirmation, scheduleAppointmentReminder } from '@/lib/services/appointment'

// Type for appointments with included relations
type AppointmentWithRelations = appointments & {
  customer: customers
  service: services
  establishment: establishments
  professional: professionals
  user: users
}

// Schema para criação de agendamento
const createAppointmentSchema = z.object({
  customerId: z.string().min(1, 'Cliente é obrigatório'),
  serviceId: z.string().min(1, 'Serviço é obrigatório'),
  establishmentId: z.string().min(1, 'Estabelecimento é obrigatório'),
  professionalId: z.string().min(1, 'Profissional é obrigatório'),
  date: z.string().transform((date) => new Date(date)),
  notes: z.string().optional(),
})

// Schema para listagem de agendamentos
const listAppointmentsSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  startDate: z.string().optional().transform((date) => date ? new Date(date) : undefined),
  endDate: z.string().optional().transform((date) => date ? new Date(date) : undefined),
  customerId: z.string().optional(),
  serviceId: z.string().optional(),
})

// Handler para criar agendamento
const handleCreate = async (req: NextRequest) => {
  const data = await req.json()
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return errorResponse('UNAUTHORIZED', 'Usuário não autenticado', undefined, 401)
  }

  // Verificar disponibilidade do horário
  const [existingAppointment] = await dbActions.appointments.findByEstablishment(
    data.establishmentId,
    {
      status: 'scheduled',
      startDate: data.date,
      endDate: data.date,
      take: 1
    }
  )

  if (existingAppointment) {
    return errorResponse(
      'BAD_REQUEST',
      'Horário já está ocupado',
      undefined,
      400
    )
  }

  // Verificar se o serviço existe e pertence ao estabelecimento
  const service = await dbActions.services.findById(data.serviceId)

  if (!service) {
    return errorResponse(
      'BAD_REQUEST',
      'Serviço não encontrado ou não disponível neste estabelecimento',
      undefined,
      400
    )
  }

  // Criar agendamento usando dbActions
  const appointment = await dbActions.appointments.create({
    userId,
    customerId: data.customerId,
    serviceId: data.serviceId,
    establishmentId: data.establishmentId,
    professionalId: data.professionalId,
    date: data.date,
    notes: data.notes,
  })

  // Enviar confirmação e agendar lembrete via WhatsApp
  try {
    const appointmentWithRelations = appointment as unknown as AppointmentWithRelations;
    const appointmentData = {
      customerId: appointmentWithRelations.customerId,
      serviceId: appointmentWithRelations.serviceId,
      appointmentDate: appointmentWithRelations.date,
      professionalId: appointmentWithRelations.professionalId,
      establishmentId: appointmentWithRelations.establishmentId,
      userId
    };

    await Promise.all([
      sendAppointmentConfirmation(appointmentData),
      scheduleAppointmentReminder(appointmentData)
    ]);
  } catch (error) {
    console.error('Error sending WhatsApp notifications:', error);
    // Não interromper o fluxo se as notificações falharem
  }

  return successResponse({
    message: 'Agendamento criado com sucesso',
    data: appointment,
  })
}

// Handler para listar agendamentos
const handleList = async (req: NextRequest) => {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return errorResponse('UNAUTHORIZED', 'Usuário não autenticado', undefined, 401)
  }

  const { searchParams } = new URL(req.url)
  const params = {
    userId,
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10,
    startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate') as string) : undefined,
    endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate') as string) : undefined,
    status: searchParams.get('status') || undefined,
    customerId: searchParams.get('customerId') || undefined,
    serviceId: searchParams.get('serviceId') || undefined,
    establishmentId: searchParams.get('establishmentId') || undefined
  }

  if (!params.establishmentId) {
    return errorResponse(
      'BAD_REQUEST',
      'Estabelecimento é obrigatório',
      undefined,
      400
    )
  }

  // Buscar agendamentos do usuário
  const appointments = await dbActions.appointments.findByEstablishment(
    params.establishmentId,
    {
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
      customerId: params.customerId,
      serviceId: params.serviceId,
      skip: (params.page - 1) * params.limit,
      take: params.limit
    }
  )

  const total = await dbActions.appointments.count(
    params.establishmentId,
    {
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
      customerId: params.customerId,
      serviceId: params.serviceId
    }
  )

  return successResponse({
    data: appointments,
    meta: {
      total,
      page: params.page,
      limit: params.limit,
      pages: Math.ceil(total / params.limit),
    },
  })
}

// Exportar handlers com middlewares
export const POST = withErrorHandler(
  validateRequest(createAppointmentSchema, handleCreate)
)

export const GET = withErrorHandler(
  validateRequest(listAppointmentsSchema, handleList)
)

// Schema para reagendamento
const rescheduleAppointmentSchema = z.object({
  appointmentId: z.string().min(1, 'ID do agendamento é obrigatório'),
  newDate: z.string().transform((date) => new Date(date)),
  professionalId: z.string().min(1, 'Profissional é obrigatório'),
})

// Handler para reagendar agendamento
const handleReschedule = async (req: NextRequest) => {
  const data = await req.json()
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return errorResponse('UNAUTHORIZED', 'Usuário não autenticado', undefined, 401)
  }

  // Buscar agendamento existente
  const existingAppointment = await dbActions.appointments.findById(data.appointmentId)

  if (!existingAppointment) {
    return errorResponse(
      'NOT_FOUND',
      'Agendamento não encontrado',
      undefined,
      404
    )
  }

  // Verificar disponibilidade do novo horário
  const [conflictingAppointment] = await dbActions.appointments.findByEstablishment(
    existingAppointment.establishmentId,
    {
      status: 'scheduled',
      startDate: data.newDate,
      endDate: data.newDate,
      take: 1
    }
  )

  if (conflictingAppointment) {
    return errorResponse(
      'BAD_REQUEST',
      'Horário já está ocupado',
      undefined,
      400
    )
  }

  // Atualizar agendamento
  const updatedAppointment = await dbActions.appointments.update(
    data.appointmentId,
    {
      date: data.newDate,
      professionalId: data.professionalId
    }
  )

  // Enviar notificação de reagendamento
  try {
    const appointmentWithRelations = updatedAppointment as unknown as AppointmentWithRelations;
    await sendAppointmentRescheduled({
      customerId: appointmentWithRelations.customerId,
      serviceId: appointmentWithRelations.serviceId,
      oldDate: existingAppointment.date,
      newDate: appointmentWithRelations.date,
      professionalId: appointmentWithRelations.professionalId,
      establishmentId: appointmentWithRelations.establishmentId,
      appointmentDate: appointmentWithRelations.date,
      userId
    })
  } catch (error) {
    console.error('Error sending rescheduling notification:', error)
    // Não interromper o fluxo se a notificação falhar
  }

  return successResponse({
    message: 'Agendamento reagendado com sucesso',
    data: updatedAppointment,
  })
}

export const PATCH = withErrorHandler(
  validateRequest(rescheduleAppointmentSchema, handleReschedule)
)
