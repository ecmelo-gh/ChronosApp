import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { feedbackCreateSchema, feedbackFilterSchema, feedbackUpdateSchema } from '@/lib/validations/feedback'
import { revalidatePath } from 'next/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = feedbackFilterSchema.parse({
      rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
      source: searchParams.get('source'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      page: Number(searchParams.get('page')) || 1,
      perPage: Number(searchParams.get('perPage')) || 10,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    })

    const where: Prisma.CustomerFeedbackWhereInput = {
      customerId: params.id,
      userId: session.user.id,
      ...(filters.rating && { rating: filters.rating }),
      ...(filters.source && { source: filters.source }),
      ...(filters.startDate && { created_at: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && { created_at: { lte: new Date(filters.endDate) } }),
      ...(filters.tags?.length && {
        tags: { hasEvery: filters.tags }
      })
    }

    const [total, feedbacks] = await Promise.all([
      prisma.customerFeedback.count({ where }),
      prisma.customerFeedback.findMany({
        where,
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
        select: {
          id: true,
          message: true,
          rating: true,
          source: true,
          tags: true,
          created_at: true,
          updated_at: true,
          appointment: filters.source === 'app' ? {
            select: {
              id: true,
              date: true,
              service: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          } : false
        }
      })
    ])

    // Calcular média das avaliações
    const averageRating = total > 0
      ? await prisma.customerFeedback.aggregate({
          where,
          _avg: {
            rating: true
          }
        }).then(result => result._avg.rating || 0)
      : 0

    return NextResponse.json({
      data: feedbacks,
      meta: {
        total,
        averageRating,
        page: filters.page,
        perPage: filters.perPage,
        pageCount: Math.ceil(total / filters.perPage)
      }
    })
  } catch (error) {
    console.error('Error fetching feedbacks:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const data = feedbackCreateSchema.parse(json)

    const feedback = await prisma.customerFeedback.create({
      data: {
        ...data,
        customerId: params.id,
        userId: session.user.id,
        tags: data.tags || []
      },
      select: {
        id: true,
        message: true,
        rating: true,
        source: true,
        tags: true,
        created_at: true,
        updated_at: true,
        appointment: data.appointmentId ? {
          select: {
            id: true,
            date: true,
            service: {
              select: {
                id: true,
                name: true
              }
            }
          }
        } : false
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({ data: feedback })
  } catch (error) {
    console.error('Error creating feedback:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const { feedbackId, ...updateData } = json
    
    if (!feedbackId) {
      return NextResponse.json(
        { error: 'ID do feedback é obrigatório' },
        { status: 400 }
      )
    }

    const data = feedbackUpdateSchema.parse(updateData)

    const feedback = await prisma.customerFeedback.update({
      where: {
        id: feedbackId,
        customerId: params.id,
        userId: session.user.id
      },
      data: {
        ...data,
        tags: data.tags || undefined
      },
      select: {
        id: true,
        message: true,
        rating: true,
        source: true,
        tags: true,
        created_at: true,
        updated_at: true,
        appointment: {
          select: {
            id: true,
            date: true,
            service: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({ data: feedback })
  } catch (error) {
    console.error('Error updating feedback:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const feedbackId = searchParams.get('feedbackId')

    if (!feedbackId) {
      return NextResponse.json(
        { error: 'ID do feedback é obrigatório' },
        { status: 400 }
      )
    }

    const feedback = await prisma.customerFeedback.delete({
      where: {
        id: feedbackId,
        customerId: params.id,
        userId: session.user.id
      },
      select: {
        id: true,
        rating: true,
        created_at: true
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({
      data: feedback,
      message: 'Feedback excluído com sucesso'
    })
  } catch (error) {
    console.error('Error deleting feedback:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
