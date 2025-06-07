import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const updateRewardSchema = z.object({
  status: z.enum(['PENDING', 'REDEEMED', 'CANCELLED'])
})

// 2. Tipagem de Input
type UpdateRewardInput = z.infer<typeof updateRewardSchema>
type RouteParams = { params: { id: string; loyaltyId: string; rewardId: string } }

// 3. Query Builders Tipados
const buildRewardSelect = (): Prisma.CustomerLoyaltyRewardSelect => ({
  id: true,
  loyaltyProgramId: true,
  points: true,
  status: true,
  redeemedAt: true,
  created_at: true,
  updated_at: true,
  loyaltyProgram: {
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
      customer: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          status: true
        }
      }
    }
  }
})

// 4. Error Handling
class RewardDetailError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new RewardDetailError('Unauthorized', 401)
  }
  return session.user.id
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    const reward = await prisma.customerLoyaltyReward.findFirst({
      where: {
        id: params.rewardId,
        loyaltyProgram: {
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
      },
      select: buildRewardSelect()
    })

    if (!reward) {
      throw new RewardDetailError('Recompensa não encontrada', 404)
    }

    return NextResponse.json({ data: reward })
  } catch (error) {
    if (error instanceof RewardDetailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    console.error('Error fetching reward:', error)
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

    // Verificar se a recompensa existe e pertence ao programa
    const existingReward = await prisma.customerLoyaltyReward.findFirst({
      where: {
        id: params.rewardId,
        loyaltyProgram: {
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
      },
      include: {
        loyaltyProgram: true
      }
    })

    if (!existingReward) {
      throw new RewardDetailError('Recompensa não encontrada', 404)
    }

    const json = await request.json()
    const data = updateRewardSchema.parse(json)

    // Validar transições de status
    if (existingReward.status === 'REDEEMED') {
      throw new RewardDetailError(
        'Não é possível alterar uma recompensa já resgatada',
        400
      )
    }

    if (existingReward.status === 'CANCELLED' && data.status !== 'CANCELLED') {
      throw new RewardDetailError(
        'Não é possível reativar uma recompensa cancelada',
        400
      )
    }

    // Se estiver cancelando, devolver os pontos ao programa
    const shouldReturnPoints = existingReward.status === 'PENDING' && data.status === 'CANCELLED'

    // Se estiver resgatando, verificar se o programa está ativo
    if (data.status === 'REDEEMED' && existingReward.loyaltyProgram.status !== 'ACTIVE') {
      throw new RewardDetailError(
        'Não é possível resgatar recompensas de um programa inativo',
        400
      )
    }

    // Atualizar recompensa e programa se necessário
    const [reward] = await prisma.$transaction([
      prisma.customerLoyaltyReward.update({
        where: {
          id: params.rewardId
        },
        data: {
          status: data.status,
          ...(data.status === 'REDEEMED' && { redeemedAt: new Date() }),
          updated_at: new Date()
        },
        select: buildRewardSelect()
      }),
      ...(shouldReturnPoints ? [
        prisma.customerLoyalty.update({
          where: {
            id: params.loyaltyId
          },
          data: {
            points: {
              increment: existingReward.points
            },
            updated_at: new Date()
          }
        })
      ] : [])
    ])

    return NextResponse.json({
      data: reward,
      message: `Recompensa ${
        data.status === 'REDEEMED'
          ? 'resgatada'
          : data.status === 'CANCELLED'
            ? 'cancelada'
            : 'atualizada'
      } com sucesso`
    })
  } catch (error) {
    if (error instanceof RewardDetailError) {
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
          { error: 'Recompensa não encontrada' },
          { status: 404 }
        )
      }
    }
    console.error('Error updating reward:', error)
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

    // Verificar se a recompensa existe e pertence ao programa
    const existingReward = await prisma.customerLoyaltyReward.findFirst({
      where: {
        id: params.rewardId,
        loyaltyProgram: {
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
      }
    })

    if (!existingReward) {
      throw new RewardDetailError('Recompensa não encontrada', 404)
    }

    // Não permitir remoção de recompensas resgatadas
    if (existingReward.status === 'REDEEMED') {
      throw new RewardDetailError(
        'Não é possível remover uma recompensa resgatada',
        400
      )
    }

    // Se a recompensa estiver pendente, devolver os pontos ao programa
    const shouldReturnPoints = existingReward.status === 'PENDING'

    // Remover recompensa e atualizar pontos se necessário
    await prisma.$transaction([
      prisma.customerLoyaltyReward.delete({
        where: {
          id: params.rewardId
        }
      }),
      ...(shouldReturnPoints ? [
        prisma.customerLoyalty.update({
          where: {
            id: params.loyaltyId
          },
          data: {
            points: {
              increment: existingReward.points
            },
            updated_at: new Date()
          }
        })
      ] : [])
    ])

    return NextResponse.json({
      message: 'Recompensa removida com sucesso'
    })
  } catch (error) {
    if (error instanceof RewardDetailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Recompensa não encontrada' },
          { status: 404 }
        )
      }
    }
    console.error('Error deleting reward:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
