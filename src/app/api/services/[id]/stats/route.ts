import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const statsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial inválida').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida').optional(),
  groupBy: z.enum(['day', 'week', 'month', 'year']).optional().default('month')
})

// 2. Tipagem de Input
type StatsQueryInput = z.infer<typeof statsQuerySchema>
type RouteParams = { params: { id: string } }

interface ServiceStats {
  total: {
    appointments: number
    revenue: number
    uniqueCustomers: number
    completionRate: number
    cancellationRate: number
  }
  trends: {
    period: string
    appointments: number
    revenue: number
    uniqueCustomers: number
    completionRate: number
    cancellationRate: number
  }[]
  topCustomers: {
    id: string
    name: string
    appointments: number
    revenue: number
    lastAppointment: string
  }[]
}

// 3. Query Builders Tipados
const buildStatsWhere = (
  userId: string,
  serviceId: string,
  startDate?: Date,
  endDate?: Date
): Prisma.AppointmentWhereInput => ({
  userId,
  serviceId,
  ...(startDate || endDate ? {
    date: {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate })
    }
  } : {})
})

// 4. Error Handling
class ServiceStatsError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new ServiceStatsError('Unauthorized', 401)
  }
  return session.user.id
}

// 6. Helpers
const calculateRates = (
  total: number,
  completed: number,
  cancelled: number
) => ({
  completionRate: total > 0 ? (completed / total) * 100 : 0,
  cancellationRate: total > 0 ? (cancelled / total) * 100 : 0
})

const getPeriodStart = (date: Date, groupBy: StatsQueryInput['groupBy']) => {
  const d = new Date(date)
  switch (groupBy) {
    case 'day':
      return d.toISOString().split('T')[0]
    case 'week':
      d.setDate(d.getDate() - d.getDay())
      return d.toISOString().split('T')[0]
    case 'month':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    case 'year':
      return d.getFullYear().toString()
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
        name: true,
        price: true
      }
    })

    if (!service) {
      throw new ServiceStatsError('Serviço não encontrado', 404)
    }

    const { searchParams } = new URL(request.url)
    const query = statsQuerySchema.parse({
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      groupBy: (searchParams.get('groupBy') as StatsQueryInput['groupBy']) || undefined
    })

    // Definir período
    const endDate = query.endDate ? new Date(`${query.endDate}T23:59:59`) : new Date()
    const startDate = query.startDate
      ? new Date(`${query.startDate}T00:00:00`)
      : new Date(endDate)

    if (query.startDate) {
      startDate.setMonth(startDate.getMonth() - 12) // 12 meses atrás por padrão
    }

    // Buscar todos os agendamentos do período
    const appointments = await prisma.appointment.findMany({
      where: buildStatsWhere(userId, params.id, startDate, endDate),
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
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Calcular estatísticas totais
    const total = appointments.length
    const completed = appointments.filter(a => a.status === 'completed').length
    const cancelled = appointments.filter(a => a.status === 'cancelled').length
    const uniqueCustomers = new Set(appointments.map(a => a.customer.id)).size
    const revenue = completed * service.price

    const rates = calculateRates(total, completed, cancelled)

    // Calcular tendências
    const trends = new Map<string, {
      appointments: number
      completed: number
      cancelled: number
      revenue: number
      customers: Set<string>
    }>()

    appointments.forEach(appointment => {
      const period = getPeriodStart(appointment.date, query.groupBy)
      
      if (!trends.has(period)) {
        trends.set(period, {
          appointments: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0,
          customers: new Set()
        })
      }

      const stats = trends.get(period)!
      stats.appointments++
      stats.customers.add(appointment.customer.id)
      
      if (appointment.status === 'completed') {
        stats.completed++
        stats.revenue += service.price
      } else if (appointment.status === 'cancelled') {
        stats.cancelled++
      }
    })

    // Calcular top clientes
    const customerStats = new Map<string, {
      name: string
      appointments: number
      revenue: number
      lastAppointment: Date
    }>()

    appointments.forEach(appointment => {
      if (!customerStats.has(appointment.customer.id)) {
        customerStats.set(appointment.customer.id, {
          name: appointment.customer.full_name,
          appointments: 0,
          revenue: 0,
          lastAppointment: appointment.date
        })
      }

      const stats = customerStats.get(appointment.customer.id)!
      stats.appointments++
      if (appointment.status === 'completed') {
        stats.revenue += service.price
      }
      if (appointment.date > stats.lastAppointment) {
        stats.lastAppointment = appointment.date
      }
    })

    const stats: ServiceStats = {
      total: {
        appointments: total,
        revenue,
        uniqueCustomers,
        ...rates
      },
      trends: Array.from(trends.entries()).map(([period, stats]) => ({
        period,
        appointments: stats.appointments,
        revenue: stats.revenue,
        uniqueCustomers: stats.customers.size,
        ...calculateRates(
          stats.appointments,
          stats.completed,
          stats.cancelled
        )
      })),
      topCustomers: Array.from(customerStats.entries())
        .map(([id, stats]) => ({
          id,
          name: stats.name,
          appointments: stats.appointments,
          revenue: stats.revenue,
          lastAppointment: stats.lastAppointment.toISOString()
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
    }

    return NextResponse.json({
      data: {
        service: {
          id: service.id,
          name: service.name,
          price: service.price
        },
        query: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy: query.groupBy
        },
        stats
      }
    })
  } catch (error) {
    if (error instanceof ServiceStatsError) {
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
