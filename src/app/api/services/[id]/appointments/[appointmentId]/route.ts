import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const appointmentUpdateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Data inválida').optional(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional()
})

// 2. Tipagem de Input
type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>
type RouteParams = { params: { id: string; appointmentId: string } }

// 3. Query Builders Tipados
const buildAppointmentSelect = (): Prisma.AppointmentSelect => ({
  id: true,
  date: true,
  status: true,
  notes: true,
  created_at: true,
  updated_at: true,
  customer: {
    select: {
      id: true,
      full_name: true,
      phone: true,
      email: true
    }
  },
  service: {
    select: {
      id: true,
      name: true,
      duration: true,
      price: true
    }
  }
})

// 4. Error Handling
class AppointmentDetailError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new AppointmentDetailError('Unauthorized', 401)
  }
  return session.user.id
}

// 6. Validação de Disponibilidade
const validateAppointmentAvailability = async (
  userId: string,
  serviceId: string,
  date: Date,
  duration: number,
  excludeAppointmentId: string
) => {
  const endDate = new Date(date.getTime() + duration * 60000)

  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      userId,
      NOT: { id: excludeAppointmentId },
      date: {
        lt: endDate
      },
      service: {
        duration: {
          gt: 0
        }
      },
      OR: [
        {
          // Verifica se existe agendamento que começa durante este período
          date: {
            gte: date,
            lt: endDate
          }
        },
        {
          // Verifica se existe agendamento que termina durante este período
          AND: {
            date: {
              lt: date
            },
            service: {
              duration: {
                gt: Math.floor((date.getTime() - new Date().getTime()) / 60000)
              }
            }
          }
        }
      ]
    },
    include: {
      service: {
        select: {
          name: true,
          duration: true
        }
      }
    }
  })

  if (conflictingAppointment) {
    throw new AppointmentDetailError(
      `Horário indisponível: conflito com agendamento do serviço ${conflictingAppointment.service.name}`,
      409
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.appointmentId,
        serviceId: params.id,
        userId
      },
      select: buildAppointmentSelect()
    })

    if (!appointment) {
      throw new AppointmentDetailError('Agendamento não encontrado', 404)
    }

    return NextResponse.json({ data: appointment })
  } catch (error) {
    if (error instanceof AppointmentDetailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    console.error('Error fetching appointment:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    // Verificar se o agendamento existe
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: params.appointmentId,
        serviceId: params.id,
        userId
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            status: true
          }
        }
      }
    })

    if (!existingAppointment) {
      throw new AppointmentDetailError('Agendamento não encontrado', 404)
    }

    if (existingAppointment.service.status !== 'active') {
      throw new AppointmentDetailError('Serviço inativo', 400)
    }

    const json = await request.json()
    const data = appointmentUpdateSchema.parse(json)

    // Se estiver atualizando a data, validar disponibilidade
    if (data.date) {
      const appointmentDate = new Date(data.date)
      await validateAppointmentAvailability(
        userId,
        params.id,
        appointmentDate,
        existingAppointment.service.duration,
        params.appointmentId
      )
    }

    const appointment = await prisma.appointment.update({
      where: {
        id: params.appointmentId,
        userId
      },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status && { status: data.status })
      },
      select: buildAppointmentSelect()
    })

    return NextResponse.json({ data: appointment })
  } catch (error) {
    if (error instanceof AppointmentDetailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Agendamento não encontrado' },
          { status: 404 }
        )
      }
    }
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.appointmentId,
        serviceId: params.id,
        userId
      }
    })

    if (!appointment) {
      throw new AppointmentDetailError('Agendamento não encontrado', 404)
    }

    // Não permitir deletar agendamentos concluídos
    if (appointment.status === 'completed') {
      throw new AppointmentDetailError(
        'Não é possível excluir um agendamento concluído',
        400
      )
    }

    await prisma.appointment.delete({
      where: {
        id: params.appointmentId,
        userId
      }
    })

    return NextResponse.json({
      message: 'Agendamento excluído com sucesso'
    })
  } catch (error) {
    if (error instanceof AppointmentDetailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Agendamento não encontrado' },
          { status: 404 }
        )
      }
    }
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
