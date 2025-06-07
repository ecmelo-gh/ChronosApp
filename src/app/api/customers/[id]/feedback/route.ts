import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { rateLimit } from '@/lib/rate-limit'
import { createAuditLog } from '@/lib/audit'

import { successResponse, errorResponse } from '@/lib/api/responses'
import { validateRequest, withErrorHandler, withAuth } from '@/lib/api/middleware'
import {
  createFeedbackSchema,
  listFeedbackSchema,
  reportFeedbackSchema,
  ownerReplySchema
} from '@/schemas/feedback.schema'
import z from 'zod'

// Query Builders
const buildFeedbackWhere = (
  customerId: string,
  userId: string,
  filters: z.infer<typeof listFeedbackSchema>
): Prisma.CustomerFeedbackWhereInput => ({
  customerId,
  userId,
  ...(filters.status && { status: filters.status }),
  ...(filters.rating && { rating: filters.rating }),
  ...(filters.serviceId && { serviceId: filters.serviceId }),
  ...(filters.hasReply !== undefined && {
    ownerReply: filters.hasReply ? { not: null } : null
  }),
  ...(filters.startDate && filters.endDate
    ? {
        created_at: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate)
        }
      }
    : filters.startDate
    ? { created_at: { gte: new Date(filters.startDate) } }
    : filters.endDate
    ? { created_at: { lte: new Date(filters.endDate) } }
    : {})
})

const buildFeedbackSelect = (): Prisma.CustomerFeedbackSelect => ({
  id: true,
  rating: true,
  message: true,
  status: true,
  source: true,
  visitId: true,
  tags: true,
  created_at: true,
  updated_at: true
})

// Handlers
const getHandler = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { searchParams } = new URL(req.url)
  const filters = listFeedbackSchema.parse({
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    status: searchParams.get('status'),
    serviceId: searchParams.get('serviceId'),
    hasReply: searchParams.get('hasReply') === 'true',
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10,
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
  })

  if (!req.auth?.id) {
    return errorResponse('UNAUTHORIZED', 'Usuário não autenticado')
  }

  const where = buildFeedbackWhere(params.id, req.auth.id, filters)

  const [total, feedbacks] = await Promise.all([
    prisma.customerFeedback.count({ where }),
    prisma.customerFeedback.findMany({
      where,
      orderBy: { [filters.sortBy]: filters.sortOrder },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      select: buildFeedbackSelect()
    })
  ])

  // Calcular estatísticas
  const stats = {
    totalRatings: total,
    averageRating: feedbacks.reduce((acc, f) => acc + f.rating, 0) / total || 0,
    ratingDistribution: feedbacks.reduce((acc, f) => {
      acc[f.rating] = (acc[f.rating] || 0) + 1
      return acc
    }, {} as Record<number, number>),
    sentimentAnalysis: feedbacks.reduce((acc, f) => {
      const sentiment = f.rating >= 4 ? 'positive' : f.rating <= 2 ? 'negative' : 'neutral'
      acc[sentiment] = (acc[sentiment] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return successResponse({
    data: feedbacks,
    meta: {
      total,
      page: filters.page,
      limit: filters.limit,
      pageCount: Math.ceil(total / filters.limit)
    },
    stats
  })
}

const postHandler = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Rate limiting
  const identifier = req.ip || 'anonymous'
  const { success } = await rateLimit.limit(identifier)
  
  if (!success) {
    return errorResponse('TOO_MANY_REQUESTS', 'Muitas requisições, tente novamente mais tarde')
  }

  const json = await req.json()
  const data = createFeedbackSchema.parse(json)

  const feedback = await prisma.customerFeedback.create({
    data: {
      ...data,
      customerId: params.id,
      userId: req.auth?.id || '', // Should never happen due to withAuth
      message: data.message,
      source: data.source
    },
    select: buildFeedbackSelect()
  })

  // Registrar auditoria
  await createAuditLog({
    action: 'create',
    resource: 'customer_feedback',
    resourceId: feedback.id,
    userId: req.auth.id,
    details: data
  }).catch(console.error)

  return successResponse({
    message: 'Feedback registrado com sucesso',
    data: feedback
  })
}

const deleteHandler = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { searchParams } = new URL(req.url)
  const feedbackId = searchParams.get('feedbackId')

  if (!feedbackId) {
    return errorResponse('BAD_REQUEST', 'ID do feedback é obrigatório')
  }

  const feedback = await prisma.customerFeedback.delete({
    where: {
      id: feedbackId,
      customerId: params.id,
      userId: req.auth?.id || '' // Should never happen due to withAuth
    },
    select: buildFeedbackSelect()
  })

  return successResponse({
    message: 'Feedback excluído com sucesso',
    data: feedback
  })
}

// Routes
export const GET = withErrorHandler(
  withAuth(getHandler)
)

export const POST = withErrorHandler(
  withAuth(
    validateRequest(createFeedbackSchema, postHandler)
  )
)

export const DELETE = withErrorHandler(
  withAuth(deleteHandler)
)
