import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { validateRequest, withErrorHandler } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/responses'

// Schema para atualização de agendamento
const updateAppointmentSchema = z.object({
  date: z.string().transform((date) => new Date(date)).optional(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
})

// Handler para buscar agendamento
const handleGet = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return errorResponse('UNAUTHORIZED', 'Usuário não autenticado', undefined, 401)
  }

  const appointment = await prisma.appointments.findFirst({
    where: {
      id: params.id,
      userId,
    },
    include: {
      customers: true,
      services: true,
      establishments: true,
    },
  })

  if (!appointment) {
    return errorResponse('NOT_FOUND', 'Agendamento não encontrado', undefined, 404)
  }

  return successResponse({ data: appointment })
}

// Handler para atualizar agendamento
const handleUpdate = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return errorResponse('UNAUTHORIZED', 'Usuário não autenticado', undefined, 401)
  }

  const data = await req.json()

  // Verificar se agendamento existe e pertence ao usuário
  const existingAppointment = await prisma.appointments.findFirst({
    where: {
      id: params.id,
      userId,
    },
  })

  if (!existingAppointment) {
    return errorResponse('NOT_FOUND', 'Agendamento não encontrado', undefined, 404)
  }

  // Se estiver alterando a data, verificar disponibilidade
  if (data.date) {
    const conflictingAppointment = await prisma.appointments.findFirst({
      where: {
        establishmentId: existingAppointment.establishmentId,
        date: new Date(data.date),
        status: 'scheduled',
        id: { not: params.id }, // Excluir o próprio agendamento
      },
    })

    if (conflictingAppointment) {
      return errorResponse(
        'BAD_REQUEST',
        'Horário já está ocupado',
        undefined,
        400
      )
    }
  }

  // Atualizar agendamento
  const appointment = await prisma.appointments.update({
    where: { id: params.id },
    data: {
      ...(data.date && { date: new Date(data.date) }),
      ...(data.notes && { notes: data.notes }),
      ...(data.status && { status: data.status }),
      updated_at: new Date(),
    },
    include: {
      customers: true,
      services: true,
      establishments: true,
    },
  })

  // TODO: Se status alterado para cancelled, notificar via WhatsApp

  return successResponse({
    message: 'Agendamento atualizado com sucesso',
    data: appointment,
  })
}

// Handler para deletar agendamento
const handleDelete = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return errorResponse('UNAUTHORIZED', 'Usuário não autenticado', undefined, 401)
  }

  // Verificar se agendamento existe e pertence ao usuário
  const appointment = await prisma.appointments.findFirst({
    where: {
      id: params.id,
      userId,
    },
  })

  if (!appointment) {
    return errorResponse('NOT_FOUND', 'Agendamento não encontrado', undefined, 404)
  }

  // Em vez de deletar, marcar como cancelado
  await prisma.appointments.update({
    where: { id: params.id },
    data: {
      status: 'cancelled',
      updated_at: new Date(),
    },
  })

  // TODO: Notificar cancelamento via WhatsApp

  return successResponse({
    message: 'Agendamento cancelado com sucesso',
  })
}

// Exportar handlers com middlewares
export const GET = withErrorHandler(handleGet)

export const PATCH = withErrorHandler(
  validateRequest(updateAppointmentSchema, handleUpdate)
)

export const DELETE = withErrorHandler(handleDelete)
