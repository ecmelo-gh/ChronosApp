import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const appointmentsFilterSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  customerId: z.string().optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
  sortBy: z.enum(['date', 'created_at']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

const appointmentCreateSchema = z.object({
  customerId: z.string().min(1, 'Cliente é obrigatório'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Data inválida'),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled')
})

// 2. Tipagem de Input
type AppointmentsQueryInput = z.infer<typeof appointmentsFilterSchema>
type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>
type RouteParams = { params: { id: string } }

// 3. Query Builders Tipados
const buildAppointmentsWhere = (
  userId: string,
  serviceId: string,
  filters: AppointmentsQueryInput
): Prisma.AppointmentWhereInput => ({
  userId,
  serviceId,
  ...(filters.status && { status: filters.status }),
  ...(filters.customerId && { customerId: filters.customerId }),
  ...(filters.startDate || filters.endDate ? {
    date: {
      ...(filters.startDate && { gte: new Date(filters.startDate) }),
      ...(filters.endDate && { lte: new Date(filters.endDate + 'T23:59:59') })
    }
  } : {})
})

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
class ServiceAppointmentsError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new ServiceAppointmentsError('Unauthorized', 401)
  }
  return session.user.id
}

// 6. Validação de Disponibilidade
const validateAppointmentAvailability = async (
  userId: string,
  serviceId: string,
  date: Date,
  duration: number,
  excludeAppointmentId?: string
) => {
  const endDate = new Date(date.getTime() + duration * 60000)

  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      userId,
      NOT: excludeAppointmentId ? { id: excludeAppointmentId } : undefined,
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
    throw new ServiceAppointmentsError(
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

    const { searchParams } = new URL(request.url)
    const filters = appointmentsFilterSchema.parse({
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      status: searchParams.get('status') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      page: Number(searchParams.get('page')) || 1,
      perPage: Number(searchParams.get('perPage')) || 10,
      sortBy: searchParams.get('sortBy') || 'date',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    })

    // Verificar se o serviço existe
    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId
      },
      select: {
        id: true,
        name: true,
        status: true
      }
    })

    if (!service) {
      throw new ServiceAppointmentsError('Serviço não encontrado', 404)
    }

    if (service.status !== 'active') {
      throw new ServiceAppointmentsError('Serviço inativo', 400)
    }

    const where = buildAppointmentsWhere(userId, params.id, filters)

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
        select: buildAppointmentSelect()
      })
    ])

    return NextResponse.json({
      data: appointments,
      meta: {
        total,
        page: filters.page,
        perPage: filters.perPage,
        pageCount: Math.ceil(total / filters.perPage)
      }
    })
  } catch (error) {
    if (error instanceof ServiceAppointmentsError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error fetching service appointments:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    // Verificar se o serviço existe e está ativo
    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId
      },
      select: {
        id: true,
        name: true,
        duration: true,
        status: true
      }
    })

    if (!service) {
      throw new ServiceAppointmentsError('Serviço não encontrado', 404)
    }

    if (service.status !== 'active') {
      throw new ServiceAppointmentsError('Serviço inativo', 400)
    }

    const json = await request.json()
    const data = appointmentCreateSchema.parse(json)

    // Verificar se o cliente existe
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customerId,
        userId,
        status: 'active'
      }
    })

    if (!customer) {
      throw new ServiceAppointmentsError('Cliente não encontrado ou inativo', 404)
    }

    const appointmentDate = new Date(data.date)

    // Validar disponibilidade
    await validateAppointmentAvailability(
      userId,
      service.id,
      appointmentDate,
      service.duration
    )

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        serviceId: service.id,
        customerId: data.customerId,
        date: appointmentDate,
        notes: data.notes,
        status: data.status
      },
      select: buildAppointmentSelect()
    })

    return NextResponse.json({ data: appointment })
  } catch (error) {
    if (error instanceof ServiceAppointmentsError) {
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
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
