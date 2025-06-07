import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { redemptionCreateSchema, redemptionFilterSchema, redemptionUpdateSchema } from '@/lib/validations/redemption'
import { transactionCreateSchema } from '@/lib/validations/transaction'
import { revalidatePath } from 'next/cache'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

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
    const filters = redemptionFilterSchema.parse({
      status: searchParams.get('status'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      rewardType: searchParams.get('rewardType'),
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
      },
      include: {
        customer: {
          select: {
            name: true,
            whatsapp: true
          }
        }
      }
    })

    if (!loyalty) {
      return NextResponse.json(
        { error: 'Programa de fidelidade não encontrado' },
        { status: 404 }
      )
    }

    const where: Prisma.RewardRedemptionWhereInput = {
      reward: {
        loyaltyId: params.loyaltyId
      },
      ...(filters.status && { status: filters.status }),
      ...(filters.startDate && { created_at: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && { created_at: { lte: new Date(filters.endDate) } }),
      ...(filters.rewardType && { reward: { type: filters.rewardType } }),
      ...(filters.search && {
        OR: [
          { reward: { title: { contains: filters.search, mode: Prisma.QueryMode.insensitive } } },
          { notes: { contains: filters.search, mode: Prisma.QueryMode.insensitive } }
        ]
      })
    }

    const [total, redemptions] = await Promise.all([
      prisma.rewardRedemption.count({ where }),
      prisma.rewardRedemption.findMany({
        where,
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
        include: {
          reward: {
            select: {
              id: true,
              title: true,
              description: true,
              type: true,
              points: true,
              value: true,
              expiresAt: true
            }
          }
        }
      })
    ])

    // Calcular estatísticas
    const stats = await prisma.rewardRedemption.groupBy({
      by: ['status'],
      where: {
        reward: {
          loyaltyId: params.loyaltyId
        }
      },
      _count: true
    })

    const statistics = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      data: redemptions,
      meta: {
        total,
        statistics,
        page: filters.page,
        perPage: filters.perPage,
        pageCount: Math.ceil(total / filters.perPage)
      }
    })
  } catch (error) {
    console.error('Error fetching redemptions:', error)
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
    const data = redemptionCreateSchema.parse(json)

    // Verificar se o programa e a recompensa existem
    const loyalty = await prisma.customerLoyalty.findUnique({
      where: {
        id: params.loyaltyId,
        customerId: params.id,
        userId: session.user.id
      },
      include: {
        customer: {
          select: {
            name: true,
            whatsapp: true
          }
        }
      }
    })

    if (!loyalty) {
      return NextResponse.json(
        { error: 'Programa de fidelidade não encontrado' },
        { status: 404 }
      )
    }

    const reward = await prisma.reward.findUnique({
      where: {
        id: data.rewardId,
        loyaltyId: params.loyaltyId,
        status: 'available'
      },
      include: {
        _count: {
          select: {
            redemptions: true
          }
        }
      }
    })

    if (!reward) {
      return NextResponse.json(
        { error: 'Recompensa não encontrada ou indisponível' },
        { status: 404 }
      )
    }

    // Verificar se já atingiu limite de resgates
    if (reward.maxRedemptions && reward._count.redemptions >= reward.maxRedemptions) {
      return NextResponse.json(
        { error: 'Limite de resgates atingido para esta recompensa' },
        { status: 400 }
      )
    }

    // Verificar se tem pontos suficientes
    if (loyalty.points < reward.points) {
      return NextResponse.json(
        { error: 'Saldo insuficiente para resgatar esta recompensa' },
        { status: 400 }
      )
    }

    // Verificar se a recompensa não expirou
    if (reward.expiresAt && new Date(reward.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Esta recompensa já expirou' },
        { status: 400 }
      )
    }

    // Criar resgate e transação em uma transação
    const redemption = await prisma.$transaction(async (tx) => {
      // Criar resgate
      const redemption = await tx.rewardRedemption.create({
        data: {
          ...data,
          status: 'pending',
          desiredRedemptionDate: data.desiredRedemptionDate ? new Date(data.desiredRedemptionDate) : null
        },
        include: {
          reward: {
            select: {
              title: true,
              points: true,
              type: true,
              value: true
            }
          }
        }
      })

      // Criar transação de débito
      await tx.loyaltyTransaction.create({
        data: transactionCreateSchema.parse({
          points: reward.points,
          type: 'debit',
          source: 'reward',
          description: `Resgate de recompensa: ${reward.title}`,
          referenceId: redemption.id,
          loyaltyId: params.loyaltyId
        })
      })

      // Atualizar pontos do programa
      await tx.customerLoyalty.update({
        where: { id: params.loyaltyId },
        data: {
          points: {
            decrement: reward.points
          }
        }
      })

      // Atualizar status da recompensa se atingiu limite
      if (reward.maxRedemptions && reward._count.redemptions + 1 >= reward.maxRedemptions) {
        await tx.reward.update({
          where: { id: reward.id },
          data: { status: 'redeemed' }
        })
      }

      return redemption
    })

    // Enviar notificação por WhatsApp
    if (loyalty.customer.whatsapp) {
      await sendWhatsAppMessage({
        to: loyalty.customer.whatsapp,
        template: 'reward_redemption',
        params: {
          customerName: loyalty.customer.name,
          rewardTitle: redemption.reward.title,
          rewardPoints: redemption.reward.points,
          rewardValue: redemption.reward.value,
          redemptionId: redemption.id
        }
      })
    }

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({ data: redemption })
  } catch (error) {
    console.error('Error creating redemption:', error)
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
    const { redemptionId, ...updateData } = json

    if (!redemptionId) {
      return NextResponse.json(
        { error: 'ID do resgate é obrigatório' },
        { status: 400 }
      )
    }

    const data = redemptionUpdateSchema.parse(updateData)

    // Verificar se o resgate existe e pertence ao programa
    const redemption = await prisma.rewardRedemption.findUnique({
      where: {
        id: redemptionId
      },
      include: {
        reward: {
          select: {
            loyaltyId: true,
            title: true
          }
        }
      }
    })

    if (!redemption) {
      return NextResponse.json(
        { error: 'Resgate não encontrado' },
        { status: 404 }
      )
    }

    if (redemption.reward.loyaltyId !== params.loyaltyId) {
      return NextResponse.json(
        { error: 'Resgate não pertence a este programa' },
        { status: 403 }
      )
    }

    // Se estiver confirmando ou cancelando, buscar dados do cliente para notificação
    let customer = null
    if (data.status === 'confirmed' || data.status === 'cancelled') {
      const loyalty = await prisma.customerLoyalty.findUnique({
        where: { id: params.loyaltyId },
        include: {
          customer: {
            select: {
              name: true,
              whatsapp: true
            }
          }
        }
      })
      customer = loyalty?.customer
    }

    const updated = await prisma.rewardRedemption.update({
      where: {
        id: redemptionId
      },
      data: {
        ...data,
        redeemedAt: data.redeemedAt ? new Date(data.redeemedAt) : undefined
      },
      include: {
        reward: {
          select: {
            title: true,
            points: true,
            type: true,
            value: true
          }
        }
      }
    })

    // Enviar notificação por WhatsApp se confirmado ou cancelado
    if (customer?.whatsapp && (data.status === 'confirmed' || data.status === 'cancelled')) {
      await sendWhatsAppMessage({
        to: customer.whatsapp,
        template: data.status === 'confirmed' ? 'redemption_confirmed' : 'redemption_cancelled',
        params: {
          customerName: customer.name,
          rewardTitle: redemption.reward.title,
          redemptionId: redemption.id,
          ...(data.status === 'confirmed' && {
            redemptionDate: data.redeemedAt || new Date().toISOString()
          })
        }
      })
    }

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Error updating redemption:', error)
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
