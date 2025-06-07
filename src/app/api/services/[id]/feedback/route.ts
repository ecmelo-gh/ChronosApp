import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const createFeedbackSchema = z.object({
  customerId: z.string(),
  message: z.string().min(1).max(1000),
  rating: z.number().int().min(1).max(5),
  source: z.enum(['APP', 'WEB', 'EMAIL']).default('APP'),
  visitId: z.string().optional(),
  tags: z.array(z.string()).optional()
})

const feedbackFiltersSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  minRating: z.number().int().min(1).max(5).optional(),
  maxRating: z.number().int().min(1).max(5).optional(),
  source: z.enum(['APP', 'WEB', 'EMAIL']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10)
})

// 2. Tipagem de Input
type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>
type FeedbackFilters = z.infer<typeof feedbackFiltersSchema>
type RouteParams = { params: { id: string } }

// 3. Query Builders Tipados
const buildFeedbackSelect = (): Prisma.CustomerFeedbackSelect => ({
  id: true,
  message: true,
  rating: true,
  source: true,
  visitId: true,
  tags: true,
  status: true,
  created_at: true,
  updated_at: true,
  customer: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      status: true
    }
  }
})

const buildFeedbackWhereInput = (
  serviceId: string,
  userId: string,
  filters?: FeedbackFilters
): Prisma.CustomerFeedbackWhereInput => ({
  userId,
  customer: {
    appointments: {
      some: {
        serviceId
      }
    }
  },
  status: 'active',
  ...(filters?.rating && { rating: filters.rating }),
  ...(filters?.minRating && { rating: { gte: filters.minRating } }),
  ...(filters?.maxRating && { rating: { lte: filters.maxRating } }),
  ...(filters?.source && { source: filters.source }),
  ...(filters?.startDate && {
    created_at: {
      gte: new Date(filters.startDate)
    }
  }),
  ...(filters?.endDate && {
    created_at: {
      lte: new Date(filters.endDate)
    }
  }),
  ...(filters?.tags && {
    tags: {
      hasEvery: filters.tags
    }
  })
})

// 4. Error Handling
class FeedbackError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new FeedbackError('Unauthorized', 401)
  }
  return session.user.id
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    // Parse query params
    const searchParams = new URL(request.url).searchParams
    const filters = feedbackFiltersSchema.parse({
      rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      maxRating: searchParams.get('maxRating') ? Number(searchParams.get('maxRating')) : undefined,
      source: searchParams.get('source') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10
    })

    // Calcular paginação
    const skip = (filters.page - 1) * filters.limit

    // Buscar feedbacks com contagem total
    const [feedbacks, total, metrics] = await prisma.$transaction([
      prisma.customerFeedback.findMany({
        where: buildFeedbackWhereInput(params.id, userId, filters),
        select: buildFeedbackSelect(),
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: filters.limit
      }),
      prisma.customerFeedback.count({
        where: buildFeedbackWhereInput(params.id, userId, filters)
      }),
      prisma.customerFeedback.aggregate({
        where: buildFeedbackWhereInput(params.id, userId),
        _avg: {
          rating: true
        },
        _count: {
          _all: true
        },
        _min: {
          rating: true
        },
        _max: {
          rating: true
        }
      })
    ])

    // Calcular métricas adicionais
    const ratingDistribution = await prisma.customerFeedback.groupBy({
      by: ['rating'],
      where: buildFeedbackWhereInput(params.id, userId),
      _count: {
        rating: true
      }
    })

    return NextResponse.json({
      data: feedbacks,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      },
      metrics: {
        total: metrics._count._all,
        averageRating: metrics._avg.rating || 0,
        minRating: metrics._min.rating || 0,
        maxRating: metrics._max.rating || 0,
        ratingDistribution: ratingDistribution.reduce((acc, curr) => ({
          ...acc,
          [curr.rating]: curr._count.rating
        }), {})
      }
    })
  } catch (error) {
    if (error instanceof FeedbackError) {
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
    console.error('Error fetching feedbacks:', error)
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

    const json = await request.json()
    const data = createFeedbackSchema.parse(json)

    // Verificar se o cliente existe e tem agendamento com o serviço
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customerId,
        appointments: {
          some: {
            serviceId: params.id
          }
        }
      }
    })

    if (!customer) {
      throw new FeedbackError(
        'Cliente não encontrado ou não possui agendamentos com este serviço',
        404
      )
    }

    // Criar feedback
    const feedback = await prisma.customerFeedback.create({
      data: {
        ...data,
        userId,
        status: 'active'
      },
      select: buildFeedbackSelect()
    })

    return NextResponse.json({
      data: feedback,
      message: 'Feedback criado com sucesso'
    })
  } catch (error) {
    if (error instanceof FeedbackError) {
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
    console.error('Error creating feedback:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
