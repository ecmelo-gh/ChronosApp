import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

import { successResponse, errorResponse } from '@/lib/api/responses'
import { validateRequest, withErrorHandler, withAuth } from '@/lib/api/middleware'
import { 
  listAppointmentsSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  AppointmentStatus
} from '@/schemas/appointment.schema'
import z from 'zod'

// Query Builders Tipados
const buildAppointmentWhere = (
  customerId: string,
  userId: string,
  filters: z.infer<typeof listAppointmentsSchema>
): Prisma.AppointmentWhereInput => ({
  customerId,
  userId,
  ...(filters.status && { status: filters.status }),
  ...(filters.startDate && filters.endDate
    ? {
        date: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate)
        }
      }
    : filters.startDate
    ? { date: { gte: new Date(filters.startDate) } }
    : filters.endDate
    ? { date: { lte: new Date(filters.endDate) } }
    : {})
})

const buildAppointmentSelect = (): Prisma.AppointmentSelect => ({
  id: true,
  date: true,
  status: true,
  notes: true,
  created_at: true,
  updated_at: true,
  service: {
    select: {
      id: true,
      name: true,
      price: true,
      duration: true,
      description: true
    }
  }
})

const buildAppointmentBasicSelect = (): Prisma.AppointmentSelect => ({
  id: true,
  date: true,
  status: true
})

// Handlers
const getHandler = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { searchParams } = new URL(req.url)
  const filters = listAppointmentsSchema.parse({
    status: searchParams.get('status'),
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10,
    sortBy: searchParams.get('sortBy') || 'date',
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
  })

  const where = buildAppointmentWhere(params.id, req.auth.id, filters)

  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      orderBy: { [filters.sortBy]: filters.sortOrder },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      select: buildAppointmentSelect()
    })
  ])

  return successResponse({
    data: appointments,
    meta: {
      total,
      page: filters.page,
      limit: filters.limit,
      pageCount: Math.ceil(total / filters.limit)
    }
  })
}

const postHandler = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const json = await req.json()
  const data = createAppointmentSchema.parse(json)

  const appointment = await prisma.appointment.create({
    data: {
      ...data,
      userId: req.auth.id,
      customerId: params.id,
      date: new Date(data.date)
    },
    select: buildAppointmentSelect()
  })

  return successResponse({
    message: 'Agendamento criado com sucesso',
    data: appointment
  })
}

const patchHandler = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const json = await req.json()
  const { appointmentId, ...updateData } = json

  if (!appointmentId) {
    return errorResponse('BAD_REQUEST', 'ID do agendamento é obrigatório')
  }

  const data = updateAppointmentSchema.parse(updateData)

  const appointment = await prisma.appointment.update({
    where: {
      id: appointmentId,
      customerId: params.id,
      userId: req.auth.id
    },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined
    },
    select: buildAppointmentSelect()
  })

  return successResponse({
    message: 'Agendamento atualizado com sucesso',
    data: appointment
  })
}

const deleteHandler = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { searchParams } = new URL(req.url)
  const appointmentId = searchParams.get('appointmentId')

  if (!appointmentId) {
    return errorResponse('BAD_REQUEST', 'ID do agendamento é obrigatório')
  }

  const appointment = await prisma.appointment.delete({
    where: {
      id: appointmentId,
      customerId: params.id,
      userId: req.auth.id
    },
    select: buildAppointmentBasicSelect()
  })

  return successResponse({
    message: 'Agendamento excluído com sucesso',
    data: appointment
  })
}

// Routes
export const GET = withErrorHandler(
  withAuth(getHandler)
)

export const POST = withErrorHandler(
  withAuth(
    validateRequest(createAppointmentSchema, postHandler)
  )
)

export const PATCH = withErrorHandler(
  withAuth(
    validateRequest(updateAppointmentSchema, patchHandler)
  )
)

export const DELETE = withErrorHandler(
  withAuth(deleteHandler)
)
