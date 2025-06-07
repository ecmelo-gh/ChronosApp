import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação
const statsQuerySchema = z.object({
  startDate: z.string().optional().transform(date => date ? new Date(date) : undefined),
  endDate: z.string().optional().transform(date => date ? new Date(date) : undefined),
  status: z.enum(['active', 'inactive']).optional(),
})

// Error handling
class StatsError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// Auth helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new StatsError('Unauthorized', 401)
  }
  return session.user.id
}

export async function GET(request: NextRequest) {
  try {
    const userId = await validateSession()

    const { searchParams } = new URL(request.url)
    const filters = statsQuerySchema.parse({
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      status: searchParams.get('status') || undefined,
    })

    const where = {
      userId,
      ...(filters.status && { status: filters.status }),
    }

    const appointmentsWhere = {
      userId,
      ...(filters.startDate && {
        date: { gte: filters.startDate }
      }),
      ...(filters.endDate && {
        date: {
          ...(filters.startDate ? { gte: filters.startDate } : {}),
          lte: filters.endDate
        }
      })
    }

    // Estatísticas gerais
    const [
      totalServices,
      activeServices,
      totalAppointments,
      averagePrice,
      // Top 5 serviços mais agendados
      topServices,
      // Receita por serviço
      revenueByService,
      // Duração média dos serviços
      averageDuration
    ] = await Promise.all([
      // Total de serviços
      prisma.service.count({ where }),
      // Serviços ativos
      prisma.service.count({ 
        where: { ...where, status: 'active' } 
      }),
      // Total de agendamentos
      prisma.appointment.count({ 
        where: appointmentsWhere
      }),
      // Preço médio
      prisma.service.aggregate({
        where,
        _avg: { price: true }
      }),
      // Top 5 serviços
      prisma.service.findMany({
        where,
        select: {
          id: true,
          name: true,
          price: true,
          _count: {
            select: { appointments: true }
          }
        },
        orderBy: {
          appointments: { _count: 'desc' }
        },
        take: 5
      }),
      // Receita por serviço
      prisma.appointment.groupBy({
        by: ['serviceId'],
        where: appointmentsWhere,
        _count: true,
        _sum: {
          price: true
        }
      }),
      // Duração média
      prisma.service.aggregate({
        where,
        _avg: { duration: true }
      })
    ])

    return NextResponse.json({
      data: {
        overview: {
          totalServices,
          activeServices,
          totalAppointments,
          averagePrice: averagePrice._avg.price || 0,
          averageDuration: averageDuration._avg.duration || 0
        },
        topServices: topServices.map(service => ({
          id: service.id,
          name: service.name,
          price: service.price,
          appointmentsCount: service._count.appointments
        })),
        revenueByService: revenueByService.map(rev => ({
          serviceId: rev.serviceId,
          appointmentsCount: rev._count,
          totalRevenue: rev._sum.price || 0
        }))
      }
    })
  } catch (error) {
    if (error instanceof StatsError) {
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
    console.error('Error fetching service stats:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
