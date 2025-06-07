import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const serviceDetailSchema = z.discriminatedUnion('includeAppointments', [
  z.object({
    includeAppointments: z.literal(true),
    appointmentsStatus: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
    appointmentsLimit: z.number().int().positive().default(5)
  }),
  z.object({
    includeAppointments: z.literal(false)
  })
])

// 2. Tipagem de Input
type ServiceDetailInput = z.infer<typeof serviceDetailSchema>
type RouteParams = { params: { id: string } }

// 3. Query Builders Tipados
const buildServiceSelect = (
  options: ServiceDetailInput
): Prisma.ServiceSelect => ({
  id: true,
  name: true,
  description: true,
  duration: true,
  price: true,
  status: true,
  created_at: true,
  updated_at: true,
  _count: {
    select: {
      appointments: true
    }
  },
  ...(options.includeAppointments && {
    appointments: {
      where: options.appointmentsStatus ? { status: options.appointmentsStatus } : undefined,
      orderBy: { date: 'desc' as const },
      take: options.appointmentsLimit,
      select: {
        id: true,
        date: true,
        status: true,
        customer: {
          select: {
            id: true,
            full_name: true
          }
        }
      }
    }
  })
})

// 4. Error Handling
class ServiceDetailError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new ServiceDetailError('Unauthorized', 401)
  }
  return session.user.id
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    const { searchParams } = new URL(request.url)
    const includeAppointments = searchParams.get('includeAppointments') === 'true'
    
    const options = serviceDetailSchema.parse(
      includeAppointments
        ? {
            includeAppointments: true,
            appointmentsStatus: searchParams.get('appointmentsStatus') || undefined,
            appointmentsLimit: Number(searchParams.get('appointmentsLimit')) || 5
          }
        : {
            includeAppointments: false
          }
    )

    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId
      },
      select: buildServiceSelect(options)
    })

    if (!service) {
      throw new ServiceDetailError('Serviço não encontrado', 404)
    }

    return NextResponse.json({ data: service })
  } catch (error) {
    if (error instanceof ServiceDetailError) {
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
    console.error('Error fetching service:', error)
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

    const json = await request.json()
    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      duration: z.number().int().positive().optional(),
      price: z.number().positive().optional(),
      status: z.enum(['active', 'inactive']).optional()
    })

    const data = updateSchema.parse(json)

    const service = await prisma.service.update({
      where: {
        id: params.id,
        userId
      },
      data,
      select: buildServiceSelect({ includeAppointments: false })
    })

    return NextResponse.json({ data: service })
  } catch (error) {
    if (error instanceof ServiceDetailError) {
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
          { error: 'Serviço não encontrado' },
          { status: 404 }
        )
      }
    }
    console.error('Error updating service:', error)
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

    // Verificar se existem agendamentos
    const appointmentsCount = await prisma.appointment.count({
      where: {
        serviceId: params.id,
        userId
      }
    })

    if (appointmentsCount > 0) {
      throw new ServiceDetailError(
        'Não é possível excluir um serviço que possui agendamentos',
        409
      )
    }

    const service = await prisma.service.delete({
      where: {
        id: params.id,
        userId
      },
      select: {
        id: true,
        name: true
      }
    })

    return NextResponse.json({
      data: service,
      message: 'Serviço excluído com sucesso'
    })
  } catch (error) {
    if (error instanceof ServiceDetailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Serviço não encontrado' },
          { status: 404 }
        )
      }
    }
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
