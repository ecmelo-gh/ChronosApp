import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const updateLoyaltySchema = z.object({
  targetValue: z.number().int().min(1).optional(),
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
type UpdateLoyaltyInput = z.infer<typeof updateLoyaltySchema>
type RouteParams = { params: { id: string; loyaltyId: string } }

// 3. Query Builders Tipados
const buildLoyaltySelect = (): Prisma.CustomerLoyaltySelect => ({
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
  updated_at: true,
  customer: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true
    }
  },
  rewards: {
    select: {
      id: true,
      points: true,
      status: true,
      redeemedAt: true,
      created_at: true
    },
    orderBy: {
      created_at: 'desc'
    }
  }
})

// 4. Error Handling
class LoyaltyDetailError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new LoyaltyDetailError('Unauthorized', 401)
  }
  return session.user.id
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

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
      select: buildLoyaltySelect()
    })

    if (!program) {
      throw new LoyaltyDetailError('Programa de fidelidade não encontrado', 404)
    }

    return NextResponse.json({ data: program })
  } catch (error) {
    if (error instanceof LoyaltyDetailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    console.error('Error fetching loyalty program:', error)
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

    // Verificar se o programa existe e pertence ao serviço
    const existingProgram = await prisma.customerLoyalty.findFirst({
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
      }
    })

    if (!existingProgram) {
      throw new LoyaltyDetailError('Programa de fidelidade não encontrado', 404)
    }

    const json = await request.json()
    const data = updateLoyaltySchema.parse(json)

    // Se o status mudar para EXPIRED, definir endDate como agora
    const endDate = data.status === 'EXPIRED'
      ? new Date()
      : data.endDate
        ? new Date(`${data.endDate}T23:59:59`)
        : undefined

    // Atualizar programa
    const program = await prisma.customerLoyalty.update({
      where: {
        id: params.loyaltyId,
        userId
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
        endDate,
        updated_at: new Date()
      },
      select: buildLoyaltySelect()
    })

    return NextResponse.json({
      data: program,
      message: 'Programa de fidelidade atualizado com sucesso'
    })
  } catch (error) {
    if (error instanceof LoyaltyDetailError) {
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
          { error: 'Programa de fidelidade não encontrado' },
          { status: 404 }
        )
      }
    }
    console.error('Error updating loyalty program:', error)
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

    // Verificar se o programa existe e pertence ao serviço
    const existingProgram = await prisma.customerLoyalty.findFirst({
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
      include: {
        rewards: true
      }
    })

    if (!existingProgram) {
      throw new LoyaltyDetailError('Programa de fidelidade não encontrado', 404)
    }

    // Não permitir remoção de programas com recompensas resgatadas
    if (existingProgram.rewards.some(r => r.status === 'REDEEMED')) {
      throw new LoyaltyDetailError(
        'Não é possível remover um programa com recompensas resgatadas',
        400
      )
    }

    // Remover programa e suas recompensas pendentes
    await prisma.$transaction([
      prisma.customerLoyaltyReward.deleteMany({
        where: {
          loyaltyProgramId: params.loyaltyId,
          status: 'PENDING'
        }
      }),
      prisma.customerLoyalty.delete({
        where: {
          id: params.loyaltyId,
          userId
        }
      })
    ])

    return NextResponse.json({
      message: 'Programa de fidelidade removido com sucesso'
    })
  } catch (error) {
    if (error instanceof LoyaltyDetailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Programa de fidelidade não encontrado' },
          { status: 404 }
        )
      }
    }
    console.error('Error deleting loyalty program:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
