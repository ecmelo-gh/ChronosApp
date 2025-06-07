import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const serviceFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
  sortBy: z.enum(['name', 'price', 'duration', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

const serviceCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  duration: z.number().int().positive('Duração deve ser positiva'),
  price: z.number().positive('Preço deve ser positivo'),
  status: z.enum(['active', 'inactive']).default('active')
})

const serviceUpdateSchema = serviceCreateSchema.partial()

// 2. Tipagem de Input
type ServiceQueryInput = z.infer<typeof serviceFilterSchema>
type ServiceCreateInput = z.infer<typeof serviceCreateSchema>
type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>

// 3. Query Builders Tipados
const buildServiceWhere = (
  userId: string,
  filters: ServiceQueryInput
): Prisma.ServiceWhereInput => ({
  userId,
  status: filters.status || 'active',
  ...(filters.search
    ? {
        OR: [
          { name: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: filters.search, mode: Prisma.QueryMode.insensitive } }
        ]
      }
    : {})
})

const buildServiceSelect = (): Prisma.ServiceSelect => ({
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
  }
})

// 4. Error Handling
class ServiceError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new ServiceError('Unauthorized', 401)
  }
  return session.user.id
}

export async function GET(request: NextRequest) {
  try {
    const userId = await validateSession()

    const { searchParams } = new URL(request.url)
    const filters = serviceFilterSchema.parse({
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as 'active' | 'inactive' | undefined,
      page: Number(searchParams.get('page')) || 1,
      perPage: Number(searchParams.get('perPage')) || 10,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    })

    const where = buildServiceWhere(userId, filters)

    const [total, services] = await Promise.all([
      prisma.service.count({ where }),
      prisma.service.findMany({
        where,
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
        select: buildServiceSelect()
      })
    ])

    return NextResponse.json({
      data: services,
      meta: {
        total,
        page: filters.page,
        perPage: filters.perPage,
        pageCount: Math.ceil(total / filters.perPage)
      }
    })
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Filtros inválidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await validateSession()

    const json = await request.json()
    const data = serviceCreateSchema.parse(json)

    const service = await prisma.service.create({
      data: {
        ...data,
        userId
      },
      select: buildServiceSelect()
    })

    return NextResponse.json({ data: service })
  } catch (error) {
    if (error instanceof ServiceError) {
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
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await validateSession()

    const json = await request.json()
    const { id, ...updateData } = json

    if (!id) {
      throw new ServiceError('ID do serviço é obrigatório')
    }

    const data = serviceUpdateSchema.parse(updateData)

    const service = await prisma.service.update({
      where: {
        id,
        userId
      },
      data,
      select: buildServiceSelect()
    })

    return NextResponse.json({ data: service })
  } catch (error) {
    if (error instanceof ServiceError) {
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

export async function DELETE(request: NextRequest) {
  try {
    const userId = await validateSession()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      throw new ServiceError('ID do serviço é obrigatório')
    }

    // Verificar se existem agendamentos
    const appointmentsCount = await prisma.appointment.count({
      where: {
        serviceId: id,
        userId
      }
    })

    if (appointmentsCount > 0) {
      throw new ServiceError(
        'Não é possível excluir um serviço que possui agendamentos',
        409
      )
    }

    const service = await prisma.service.delete({
      where: {
        id,
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
    if (error instanceof ServiceError) {
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
