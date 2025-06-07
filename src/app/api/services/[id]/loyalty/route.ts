import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const loyaltyFiltersSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']).optional(),
  level: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).optional(),
  customerId: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
})

const loyaltyProgramSchema = z.object({
  customerId: z.string().uuid(),
  targetValue: z.number().int().min(1),
  currentValue: z.number().int().min(0).optional(),
  points: z.number().int().min(0).optional(),
  level: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']).optional(),
  description: z.string().max(1000).optional(),
  rules: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida').optional()
})

// 2. Tipagem de Input
type LoyaltyFiltersInput = z.infer<typeof loyaltyFiltersSchema>
type LoyaltyProgramInput = z.infer<typeof loyaltyProgramSchema>
type RouteParams = { params: { id: string } }

interface LoyaltyMetrics {
  totalPrograms: number
  activePrograms: number
  averagePoints: number
  levelDistribution: {
    level: string
    count: number
    percentage: number
  }[]
  completionRate: number
  averageCompletion?: number // em dias
}

// 3. Query Builders Tipados
const buildLoyaltyWhere = (
  userId: string,
  serviceId: string,
  filters: Partial<LoyaltyFiltersInput>
): Prisma.CustomerLoyaltyWhereInput => ({
  userId,
  customer: {
    appointments: {
      some: {
        serviceId
      }
    }
  },
  ...(filters.status && { status: filters.status }),
  ...(filters.level && { level: filters.level }),
  ...(filters.customerId && { customerId: filters.customerId })
})

// 4. Error Handling
class ServiceLoyaltyError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new ServiceLoyaltyError('Unauthorized', 401)
  }
  return session.user.id
}

// 6. Helpers
const calculateMetrics = (programs: any[]): LoyaltyMetrics => {
  const totalPrograms = programs.length
  if (totalPrograms === 0) {
    return {
      totalPrograms: 0,
      activePrograms: 0,
      averagePoints: 0,
      levelDistribution: [],
      completionRate: 0
    }
  }

  const activePrograms = programs.filter(p => p.status === 'ACTIVE')
  const pointsSum = programs.reduce((sum, p) => sum + p.points, 0)
  
  // Distribuição por nível
  const levelCounts = programs.reduce((acc, p) => {
    acc[p.level] = (acc[p.level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const levelDistribution = Object.entries(levelCounts).map(([level, count]) => ({
    level,
    count,
    percentage: (count / totalPrograms) * 100
  }))

  // Taxa de conclusão e tempo médio
  const completedPrograms = programs.filter(p => p.currentValue >= p.targetValue)
  const completionTimes = completedPrograms
    .map(p => {
      if (p.endDate && p.startDate) {
        return (new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24)
      }
      return null
    })
    .filter(time => time !== null)

  const averageCompletion = completionTimes.length > 0
    ? completionTimes.reduce((sum, time) => sum + time!, 0) / completionTimes.length
    : undefined

  return {
    totalPrograms,
    activePrograms: activePrograms.length,
    averagePoints: totalPrograms > 0 ? pointsSum / totalPrograms : 0,
    levelDistribution,
    completionRate: (completedPrograms.length / totalPrograms) * 100,
    ...(averageCompletion && { averageCompletion })
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
      throw new ServiceLoyaltyError('Serviço não encontrado', 404)
    }

    const { searchParams } = new URL(request.url)
    const filters = loyaltyFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      level: searchParams.get('level') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20
    })

    // Buscar total para paginação
    const total = await prisma.customerLoyalty.count({
      where: buildLoyaltyWhere(userId, params.id, filters)
    })

    // Buscar programas paginados
    const programs = await prisma.customerLoyalty.findMany({
      where: buildLoyaltyWhere(userId, params.id, filters),
      select: {
        id: true,
        points: true,
        level: true,
        status: true,
        targetValue: true,
        currentValue: true,
        startDate: true,
        endDate: true,
        description: true,
        rules: true,
        metadata: true,
        created_at: true,
        customer: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        },
        rewards: {
          select: {
            id: true,
            points: true,
            status: true,
            redeemedAt: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    })

    // Buscar todos os programas para métricas (sem paginação)
    const allPrograms = await prisma.customerLoyalty.findMany({
      where: buildLoyaltyWhere(userId, params.id, {
        status: filters.status,
        level: filters.level,
        customerId: filters.customerId
      }),
      select: {
        points: true,
        level: true,
        status: true,
        targetValue: true,
        currentValue: true,
        startDate: true,
        endDate: true
      }
    })

    const metrics = calculateMetrics(allPrograms)

    return NextResponse.json({
      data: {
        service: {
          id: service.id,
          name: service.name
        },
        programs,
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
    if (error instanceof ServiceLoyaltyError) {
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
    console.error('Error fetching service loyalty programs:', error)
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
      throw new ServiceLoyaltyError('Serviço não encontrado', 404)
    }

    const json = await request.json()
    const data = loyaltyProgramSchema.parse(json)

    // Verificar se o cliente existe e já utilizou o serviço
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customerId,
        userId,
        appointments: {
          some: {
            serviceId: params.id
          }
        }
      }
    })

    if (!customer) {
      throw new ServiceLoyaltyError(
        'Cliente não encontrado ou não utilizou este serviço',
        404
      )
    }

    // Verificar se já existe programa ativo para este cliente
    const existingProgram = await prisma.customerLoyalty.findFirst({
      where: {
        userId,
        customerId: data.customerId,
        status: 'ACTIVE'
      }
    })

    // Se existe, atualizar. Se não, criar novo
    const program = existingProgram
      ? await prisma.customerLoyalty.update({
          where: {
            id: existingProgram.id
          },
          data: {
            targetValue: data.targetValue,
            currentValue: data.currentValue,
            points: data.points,
            level: data.level,
            status: data.status,
            description: data.description,
            rules: data.rules,
            metadata: data.metadata as Prisma.JsonValue,
            endDate: data.endDate ? new Date(`${data.endDate}T23:59:59`) : undefined,
            updated_at: new Date()
          },
          select: {
            id: true,
            points: true,
            level: true,
            status: true,
            targetValue: true,
            currentValue: true,
            startDate: true,
            endDate: true,
            description: true,
            rules: true,
            metadata: true,
            created_at: true,
            customer: {
              select: {
                id: true,
                full_name: true,
                email: true
              }
            }
          }
        })
      : await prisma.customerLoyalty.create({
          data: {
            userId,
            customerId: data.customerId,
            targetValue: data.targetValue,
            currentValue: data.currentValue || 0,
            points: data.points || 0,
            level: data.level || 'BRONZE',
            status: data.status || 'ACTIVE',
            description: data.description,
            rules: data.rules || [],
            metadata: data.metadata as Prisma.JsonValue,
            endDate: data.endDate ? new Date(`${data.endDate}T23:59:59`) : undefined
          },
          select: {
            id: true,
            points: true,
            level: true,
            status: true,
            targetValue: true,
            currentValue: true,
            startDate: true,
            endDate: true,
            description: true,
            rules: true,
            metadata: true,
            created_at: true,
            customer: {
              select: {
                id: true,
                full_name: true,
                email: true
              }
            }
          }
        })

    return NextResponse.json({
      data: program,
      message: existingProgram
        ? 'Programa de fidelidade atualizado com sucesso'
        : 'Programa de fidelidade criado com sucesso'
    })
  } catch (error) {
    if (error instanceof ServiceLoyaltyError) {
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
    console.error('Error managing service loyalty program:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
