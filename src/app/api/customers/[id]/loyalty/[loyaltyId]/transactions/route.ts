import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { transactionCreateSchema, transactionFilterSchema, transactionUpdateSchema } from '@/lib/validations/transaction'
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
    const filters = transactionFilterSchema.parse({
      type: searchParams.get('type'),
      source: searchParams.get('source'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      minPoints: searchParams.get('minPoints') ? Number(searchParams.get('minPoints')) : undefined,
      maxPoints: searchParams.get('maxPoints') ? Number(searchParams.get('maxPoints')) : undefined,
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

    const where: Prisma.LoyaltyTransactionWhereInput = {
      loyaltyId: params.loyaltyId,
      ...(filters.type && { type: filters.type }),
      ...(filters.source && { source: filters.source }),
      ...(filters.startDate && { created_at: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && { created_at: { lte: new Date(filters.endDate) } }),
      ...(filters.minPoints && { points: { gte: filters.minPoints } }),
      ...(filters.maxPoints && { points: { lte: filters.maxPoints } })
    }

    const [total, transactions] = await Promise.all([
      prisma.loyaltyTransaction.count({ where }),
      prisma.loyaltyTransaction.findMany({
        where,
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
        select: {
          id: true,
          points: true,
          type: true,
          source: true,
          description: true,
          referenceId: true,
          created_at: true,
          updated_at: true
        }
      })
    ])

    // Calcular totais por tipo
    const totals = await prisma.loyaltyTransaction.groupBy({
      by: ['type'],
      where: {
        loyaltyId: params.loyaltyId
      },
      _sum: {
        points: true
      }
    })

    const balance = totals.reduce((acc, total) => {
      if (total.type === 'credit') {
        return acc + (total._sum.points || 0)
      }
      return acc - (total._sum.points || 0)
    }, 0)

    return NextResponse.json({
      data: transactions,
      meta: {
        total,
        balance,
        totals: totals.reduce((acc, total) => {
          acc[total.type] = total._sum.points || 0
          return acc
        }, {} as Record<string, number>),
        page: filters.page,
        perPage: filters.perPage,
        pageCount: Math.ceil(total / filters.perPage)
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
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
    const data = transactionCreateSchema.parse(json)

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

    // Verificar se tem pontos suficientes para débito
    if (data.type === 'debit') {
      const balance = await calculateBalance(params.loyaltyId)
      if (balance < data.points) {
        return NextResponse.json(
          { error: 'Saldo insuficiente para esta operação' },
          { status: 400 }
        )
      }
    }

    const transaction = await prisma.loyaltyTransaction.create({
      data: {
        ...data,
        loyaltyId: params.loyaltyId
      },
      select: {
        id: true,
        points: true,
        type: true,
        source: true,
        description: true,
        referenceId: true,
        created_at: true,
        updated_at: true
      }
    })

    // Atualizar pontos do programa
    await prisma.customerLoyalty.update({
      where: { id: params.loyaltyId },
      data: {
        points: {
          [data.type === 'credit' ? 'increment' : 'decrement']: data.points
        }
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({ data: transaction })
  } catch (error) {
    console.error('Error creating transaction:', error)
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

// Função auxiliar para calcular saldo
async function calculateBalance(loyaltyId: string): Promise<number> {
  const totals = await prisma.loyaltyTransaction.groupBy({
    by: ['type'],
    where: { loyaltyId },
    _sum: {
      points: true
    }
  })

  return totals.reduce((acc, total) => {
    if (total.type === 'credit') {
      return acc + (total._sum.points || 0)
    }
    return acc - (total._sum.points || 0)
  }, 0)
}
