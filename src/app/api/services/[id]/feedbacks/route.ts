import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const feedbackFiltersSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial inválida').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida').optional(),
  hasComment: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
})

const createFeedbackSchema = z.object({
  appointmentId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  message: z.string().max(1000).optional()
})

// 2. Tipagem de Input
type FeedbackFiltersInput = z.infer<typeof feedbackFiltersSchema>
type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>
type RouteParams = { params: { id: string } }

interface FeedbackMetrics {
  totalCount: number
  averageRating: number
  ratingDistribution: {
    rating: number
    count: number
    percentage: number
  }[]
  commentedCount: number
  commentRate: number
}

// 3. Query Builders Tipados
const buildFeedbacksWhere = (
  userId: string,
  serviceId: string,
  filters: FeedbackFiltersInput
): Prisma.CustomerFeedbackWhereInput => ({
  userId,
  appointment: {
    serviceId
  },
  ...(filters.rating && { rating: filters.rating }),
  ...(filters.hasComment !== undefined && {
    message: filters.hasComment ? { not: null } : null
  }),
  ...(filters.startDate || filters.endDate ? {
    created_at: {
      ...(filters.startDate && { gte: new Date(`${filters.startDate}T00:00:00`) }),
      ...(filters.endDate && { lte: new Date(`${filters.endDate}T23:59:59`) })
    }
  } : {})
})

// 4. Error Handling
class ServiceFeedbackError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new ServiceFeedbackError('Unauthorized', 401)
  }
  return session.user.id
}

// 6. Helpers
const calculateMetrics = (feedbacks: any[]): FeedbackMetrics => {
  const totalCount = feedbacks.length
  if (totalCount === 0) {
    return {
      totalCount: 0,
      averageRating: 0,
      ratingDistribution: Array.from({ length: 5 }, (_, i) => ({
        rating: i + 1,
        count: 0,
        percentage: 0
      })),
      commentedCount: 0,
      commentRate: 0
    }
  }

  const commentedCount = feedbacks.filter(f => f.message).length
  const ratingSum = feedbacks.reduce((sum, f) => sum + f.rating, 0)
  const ratingCounts = feedbacks.reduce((acc, f) => {
    acc[f.rating] = (acc[f.rating] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  return {
    totalCount,
    averageRating: ratingSum / totalCount,
    ratingDistribution: Array.from({ length: 5 }, (_, i) => ({
      rating: i + 1,
      count: ratingCounts[i + 1] || 0,
      percentage: ((ratingCounts[i + 1] || 0) / totalCount) * 100
    })),
    commentedCount,
    commentRate: (commentedCount / totalCount) * 100
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    // Verificar se o serviço existe
    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!service) {
      throw new ServiceFeedbackError('Serviço não encontrado', 404)
    }

    const { searchParams } = new URL(request.url)
    const filters = feedbackFiltersSchema.parse({
      rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      hasComment: searchParams.get('hasComment') === 'true',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20
    })

    // Buscar total para paginação
    const total = await prisma.customerFeedback.count({
      where: buildFeedbacksWhere(userId, params.id, filters)
    })

    // Buscar feedbacks paginados
    const feedbacks = await prisma.customerFeedback.findMany({
      where: buildFeedbacksWhere(userId, params.id, filters),
      select: {
        id: true,
        rating: true,
        message: true,
        created_at: true,
        customer: {
          select: {
            id: true,
            full_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    })

    // Buscar todos os feedbacks para métricas (sem paginação)
    const allFeedbacks = await prisma.customerFeedback.findMany({
      where: buildFeedbacksWhere(userId, params.id, {
        ...filters,
        page: undefined,
        limit: undefined
      }),
      select: {
        rating: true,
        message: true
      }
    })

    const metrics = calculateMetrics(allFeedbacks)

    return NextResponse.json({
      data: {
        service: {
          id: service.id,
          name: service.name
        },
        feedbacks,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit)
        },
        metrics
      }
    })
  } catch (error) {
    if (error instanceof ServiceFeedbackError) {
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
    console.error('Error fetching service feedbacks:', error)
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

    // Verificar se o serviço existe
    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!service) {
      throw new ServiceFeedbackError('Serviço não encontrado', 404)
    }

    const json = await request.json()
    const data = createFeedbackSchema.parse(json)

    // Verificar se o agendamento existe e pertence ao serviço
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: data.appointmentId,
        userId,
        serviceId: params.id,
        status: 'completed'
      },
      select: {
        id: true,
        customerId: true
      }
    })

    if (!appointment) {
      throw new ServiceFeedbackError(
        'Agendamento não encontrado ou não está concluído',
        404
      )
    }

    // Verificar se já existe feedback para este agendamento
    const existingFeedback = await prisma.customerFeedback.findFirst({
      where: {
        userId,
        visitId: appointment.id
      }
    })

    if (existingFeedback) {
      throw new ServiceFeedbackError(
        'Já existe um feedback para este agendamento',
        409
      )
    }

    // Criar feedback
    const feedback = await prisma.customerFeedback.create({
      data: {
        userId,
        customerId: appointment.customerId,
        visitId: appointment.id,
        rating: data.rating,
        message: data.message || '',
        source: 'APP',
        tags: []
      },
      select: {
        id: true,
        rating: true,
        message: true,
        created_at: true,
        customer: {
          select: {
            id: true,
            full_name: true
          }
        }
      }
    })

    return NextResponse.json({
      data: feedback,
      message: 'Feedback criado com sucesso'
    })
  } catch (error) {
    if (error instanceof ServiceFeedbackError) {
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
    console.error('Error creating service feedback:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
