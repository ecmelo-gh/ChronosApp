import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const rewardFiltersSchema = z.object({
  status: z.enum(['PENDING', 'REDEEMED', 'CANCELLED']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial inválida').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida').optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
})

const createRewardSchema = z.object({
  points: z.number().int().min(1),
  description: z.string().max(1000).optional(),
  metadata: z.record(z.any()).optional()
})

// 2. Tipagem de Input
type RewardFiltersInput = z.infer<typeof rewardFiltersSchema>
type CreateRewardInput = z.infer<typeof createRewardSchema>
type RouteParams = { params: { id: string; loyaltyId: string } }

// 3. Query Builders Tipados
const buildRewardsWhere = (
  userId: string,
  serviceId: string,
  loyaltyId: string,
  filters: Partial<RewardFiltersInput>
): Prisma.CustomerLoyaltyRewardWhereInput => ({
  loyaltyProgram: {
    id: loyaltyId,
    userId,
    customer: {
      appointments: {
        some: {
          serviceId
        }
      }
    }
  },
  ...(filters.status && { status: filters.status }),
  ...(filters.startDate || filters.endDate ? {
    created_at: {
      ...(filters.startDate && { gte: new Date(`${filters.startDate}T00:00:00`) }),
      ...(filters.endDate && { lte: new Date(`${filters.endDate}T23:59:59`) })
    }
  } : {})
})

// 4. Error Handling
class LoyaltyRewardError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new LoyaltyRewardError('Unauthorized', 401)
  }
  return session.user.id
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    // Verificar se o programa existe e pertence ao serviço
    const program = await prisma.customerLoyalty.findFirst({
      where: {
        id: params.loyaltyId,
        userId,
        customer: {
          appointments: {
            some: {
              serviceId: params.id
            }
          }
        }
      },
      select: {
        id: true,
        points: true,
        level: true,
        status: true
      }
    })

    if (!program) {
      throw new LoyaltyRewardError('Programa de fidelidade não encontrado', 404)
    }

    const { searchParams } = new URL(request.url)
    const filters = rewardFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20
    })

    // Buscar total para paginação
    const total = await prisma.customerLoyaltyReward.count({
      where: buildRewardsWhere(userId, params.id, params.loyaltyId, filters)
    })

    // Buscar recompensas paginadas
    const rewards = await prisma.customerLoyaltyReward.findMany({
      where: buildRewardsWhere(userId, params.id, params.loyaltyId, filters),
      select: {
        id: true,
        points: true,
        status: true,
        redeemedAt: true,
        created_at: true,
        updated_at: true
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    })

    return NextResponse.json({
      data: {
        program: {
          id: program.id,
          points: program.points,
          level: program.level,
          status: program.status
        },
        rewards,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit)
        }
      }
    })
  } catch (error) {
    if (error instanceof LoyaltyRewardError) {
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
    console.error('Error fetching loyalty rewards:', error)
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

    // Verificar se o programa existe e está ativo
    const program = await prisma.customerLoyalty.findFirst({
      where: {
        id: params.loyaltyId,
        userId,
        status: 'ACTIVE',
        customer: {
          appointments: {
            some: {
              serviceId: params.id
            }
          }
        }
      }
    })

    if (!program) {
      throw new LoyaltyRewardError(
        'Programa de fidelidade não encontrado ou inativo',
        404
      )
    }

    const json = await request.json()
    const data = createRewardSchema.parse(json)

    // Verificar se há pontos suficientes
    if (program.points < data.points) {
      throw new LoyaltyRewardError(
        'Pontos insuficientes para criar esta recompensa',
        400
      )
    }

    // Criar recompensa e atualizar pontos do programa
    const [reward] = await prisma.$transaction([
      prisma.customerLoyaltyReward.create({
        data: {
          loyaltyProgramId: params.loyaltyId,
          points: data.points,
          status: 'PENDING'
        },
        select: {
          id: true,
          points: true,
          status: true,
          created_at: true
        }
      }),
      prisma.customerLoyalty.update({
        where: {
          id: params.loyaltyId
        },
        data: {
          points: {
            decrement: data.points
          },
          updated_at: new Date()
        }
      })
    ])

    return NextResponse.json({
      data: reward,
      message: 'Recompensa criada com sucesso'
    })
  } catch (error) {
    if (error instanceof LoyaltyRewardError) {
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
    console.error('Error creating loyalty reward:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
