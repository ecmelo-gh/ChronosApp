import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { rewardCreateSchema, rewardFilterSchema, rewardUpdateSchema } from '@/lib/validations/reward'
import { transactionCreateSchema } from '@/lib/validations/transaction'
import { revalidatePath } from 'next/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; loyaltyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = rewardFilterSchema.parse({
      status: searchParams.get('status'),
      type: searchParams.get('type'),
      minPoints: searchParams.get('minPoints') ? Number(searchParams.get('minPoints')) : undefined,
      maxPoints: searchParams.get('maxPoints') ? Number(searchParams.get('maxPoints')) : undefined,
      search: searchParams.get('search'),
      page: Number(searchParams.get('page')) || 1,
      perPage: Number(searchParams.get('perPage')) || 10,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    })

    // Verificar se o programa pertence ao cliente
    const loyalty = await prisma.customerLoyalty.findUnique({
      where: {
        id: params.loyaltyId,
        customerId: params.id,
        userId: session.user.id
      }
    })

    if (!loyalty) {
      return NextResponse.json(
        { error: 'Programa de fidelidade não encontrado' },
        { status: 404 }
      )
    }

    const where: Prisma.RewardWhereInput = {
      loyaltyId: params.loyaltyId,
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.minPoints && { points: { gte: filters.minPoints } }),
      ...(filters.maxPoints && { points: { lte: filters.maxPoints } }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: filters.search, mode: Prisma.QueryMode.insensitive } }
        ]
      })
    }

    const [total, rewards] = await Promise.all([
      prisma.reward.count({ where }),
      prisma.reward.findMany({
        where,
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          points: true,
          value: true,
          expiresAt: true,
          status: true,
          redeemedAt: true,
          maxRedemptions: true,
          termsAndConditions: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              redemptions: true
            }
          }
        }
      })
    ])

    // Calcular estatísticas
    const stats = await prisma.reward.groupBy({
      by: ['status'],
      where: {
        loyaltyId: params.loyaltyId
      },
      _count: true
    })

    const statistics = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      data: rewards,
      meta: {
        total,
        statistics,
        page: filters.page,
        perPage: filters.perPage,
        pageCount: Math.ceil(total / filters.perPage)
      }
    })
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; loyaltyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const data = rewardCreateSchema.parse(json)

    // Verificar se o programa pertence ao cliente
    const loyalty = await prisma.customerLoyalty.findUnique({
      where: {
        id: params.loyaltyId,
        customerId: params.id,
        userId: session.user.id
      }
    })

    if (!loyalty) {
      return NextResponse.json(
        { error: 'Programa de fidelidade não encontrado' },
        { status: 404 }
      )
    }

    const reward = await prisma.reward.create({
      data: {
        ...data,
        loyaltyId: params.loyaltyId,
        expiresAt: new Date(data.expiresAt),
        redeemedAt: data.redeemedAt ? new Date(data.redeemedAt) : null
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        points: true,
        value: true,
        expiresAt: true,
        status: true,
        redeemedAt: true,
        maxRedemptions: true,
        termsAndConditions: true,
        created_at: true,
        updated_at: true
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({ data: reward })
  } catch (error) {
    console.error('Error creating reward:', error)
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
  { params }: { params: { id: string; loyaltyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const { rewardId, ...updateData } = json

    if (!rewardId) {
      return NextResponse.json(
        { error: 'ID da recompensa é obrigatório' },
        { status: 400 }
      )
    }

    const data = rewardUpdateSchema.parse(updateData)

    // Verificar se a recompensa pertence ao programa
    const reward = await prisma.reward.findUnique({
      where: {
        id: rewardId,
        loyaltyId: params.loyaltyId
      },
      include: {
        loyalty: {
          select: {
            customerId: true,
            userId: true,
            points: true
          }
        },
        _count: {
          select: {
            redemptions: true
          }
        }
      }
    })

    if (!reward) {
      return NextResponse.json(
        { error: 'Recompensa não encontrada' },
        { status: 404 }
      )
    }

    if (reward.loyalty.customerId !== params.id || reward.loyalty.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Recompensa não pertence a este programa' },
        { status: 403 }
      )
    }

    // Se estiver redimindo, fazer validações adicionais
    if (data.status === 'redeemed' && reward.status !== 'redeemed') {
      // Verificar se já atingiu limite de resgates
      if (reward.maxRedemptions && reward._count.redemptions >= reward.maxRedemptions) {
        return NextResponse.json(
          { error: 'Limite de resgates atingido para esta recompensa' },
          { status: 400 }
        )
      }

      // Verificar se tem pontos suficientes
      if (reward.loyalty.points < reward.points) {
        return NextResponse.json(
          { error: 'Saldo insuficiente para resgatar esta recompensa' },
          { status: 400 }
        )
      }

      // Criar transação de débito
      await prisma.transaction.create({
        data: transactionCreateSchema.parse({
          points: reward.points,
          type: 'debit',
          source: 'reward',
          description: `Resgate de recompensa: ${reward.title}`,
          referenceId: reward.id,
          loyaltyId: params.loyaltyId
        })
      })

      // Atualizar pontos do programa
      await prisma.customerLoyalty.update({
        where: { id: params.loyaltyId },
        data: {
          points: {
            decrement: reward.points
          }
        }
      })

      // Definir data de resgate se não fornecida
      if (!data.redeemedAt) {
        data.redeemedAt = new Date().toISOString()
      }
    }

    const updated = await prisma.reward.update({
      where: {
        id: rewardId,
        loyaltyId: params.loyaltyId
      },
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        redeemedAt: data.redeemedAt ? new Date(data.redeemedAt) : undefined
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        points: true,
        value: true,
        expiresAt: true,
        status: true,
        redeemedAt: true,
        maxRedemptions: true,
        termsAndConditions: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            redemptions: true
          }
        }
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Error updating reward:', error)
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
  { params }: { params: { id: string; loyaltyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rewardId = searchParams.get('rewardId')

    if (!rewardId) {
      return NextResponse.json(
        { error: 'ID da recompensa é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a recompensa já foi resgatada
    const reward = await prisma.reward.findUnique({
      where: {
        id: rewardId,
        loyaltyId: params.loyaltyId
      },
      select: {
        status: true,
        _count: {
          select: {
            redemptions: true
          }
        }
      }
    })

    if (!reward) {
      return NextResponse.json(
        { error: 'Recompensa não encontrada' },
        { status: 404 }
      )
    }

    if (reward.status === 'redeemed' || reward._count.redemptions > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir uma recompensa já resgatada' },
        { status: 400 }
      )
    }

    const deleted = await prisma.reward.delete({
      where: {
        id: rewardId,
        loyaltyId: params.loyaltyId
      },
      select: {
        id: true,
        title: true,
        points: true,
        status: true
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({
      data: deleted,
      message: 'Recompensa excluída com sucesso'
    })
  } catch (error) {
    console.error('Error deleting reward:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
