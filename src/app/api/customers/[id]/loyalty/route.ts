import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { loyaltyCreateSchema, loyaltyFilterSchema, loyaltyUpdateSchema } from '@/lib/validations/loyalty'
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
    const filters = loyaltyFilterSchema.parse({
      status: searchParams.get('status'),
      level: searchParams.get('level'),
      minPoints: searchParams.get('minPoints') ? Number(searchParams.get('minPoints')) : undefined,
      maxPoints: searchParams.get('maxPoints') ? Number(searchParams.get('maxPoints')) : undefined,
      page: Number(searchParams.get('page')) || 1,
      perPage: Number(searchParams.get('perPage')) || 10,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    })

    const where: Prisma.CustomerLoyaltyWhereInput = {
      customerId: params.id,
      userId: session.user.id,
      ...(filters.status && { status: filters.status }),
      ...(filters.level && { level: filters.level }),
      ...(filters.minPoints && { points: { gte: filters.minPoints } }),
      ...(filters.maxPoints && { points: { lte: filters.maxPoints } })
    }

    const [total, loyaltyPrograms] = await Promise.all([
      prisma.customerLoyalty.count({ where }),
      prisma.customerLoyalty.findMany({
        where,
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
        select: {
          id: true,
          points: true,
          level: true,
          currentValue: true,
          targetValue: true,
          startDate: true,
          endDate: true,
          status: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              transactions: true
            }
          }
        }
      })
    ])

    // Calcular total de pontos ativos
    const activePoints = await prisma.customerLoyalty.aggregate({
      where: {
        ...where,
        status: 'ACTIVE'
      },
      _sum: {
        points: true
      }
    })

    return NextResponse.json({
      data: loyaltyPrograms,
      meta: {
        total,
        activePoints: activePoints._sum.points || 0,
        page: filters.page,
        perPage: filters.perPage,
        pageCount: Math.ceil(total / filters.perPage)
      }
    })
  } catch (error) {
    console.error('Error fetching loyalty programs:', error)
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
    const data = loyaltyCreateSchema.parse(json)

    // Verificar se já existe um programa ativo
    const existingActive = await prisma.customerLoyalty.findFirst({
      where: {
        customerId: params.id,
        userId: session.user.id,
        status: 'ACTIVE'
      }
    })

    if (existingActive && data.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cliente já possui um programa de fidelidade ativo' },
        { status: 400 }
      )
    }

    const loyalty = await prisma.customerLoyalty.create({
      data: {
        ...data,
        customerId: params.id,
        userId: session.user.id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      },
      select: {
        id: true,
        points: true,
        level: true,
        currentValue: true,
        targetValue: true,
        startDate: true,
        endDate: true,
        status: true,
        created_at: true,
        updated_at: true
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({ data: loyalty })
  } catch (error) {
    console.error('Error creating loyalty program:', error)
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
    const { loyaltyId, ...updateData } = json
    
    if (!loyaltyId) {
      return NextResponse.json(
        { error: 'ID do programa de fidelidade é obrigatório' },
        { status: 400 }
      )
    }

    const data = loyaltyUpdateSchema.parse(updateData)

    // Se estiver ativando, verificar se já existe outro programa ativo
    if (data.status === 'ACTIVE') {
      const existingActive = await prisma.customerLoyalty.findFirst({
        where: {
          customerId: params.id,
          userId: session.user.id,
          status: 'ACTIVE',
          NOT: {
            id: loyaltyId
          }
        }
      })

      if (existingActive) {
        return NextResponse.json(
          { error: 'Cliente já possui um programa de fidelidade ativo' },
          { status: 400 }
        )
      }
    }

    const loyalty = await prisma.customerLoyalty.update({
      where: {
        id: loyaltyId,
        customerId: params.id,
        userId: session.user.id
      },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined
      },
      select: {
        id: true,
        points: true,
        level: true,
        currentValue: true,
        targetValue: true,
        startDate: true,
        endDate: true,
        status: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            transactions: true
          }
        }
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({ data: loyalty })
  } catch (error) {
    console.error('Error updating loyalty program:', error)
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
    const loyaltyId = searchParams.get('loyaltyId')

    if (!loyaltyId) {
      return NextResponse.json(
        { error: 'ID do programa de fidelidade é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se tem transações
    const transactionCount = await prisma.loyaltyTransaction.count({
      where: {
        loyaltyId
      }
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um programa que possui transações' },
        { status: 400 }
      )
    }

    const loyalty = await prisma.customerLoyalty.delete({
      where: {
        id: loyaltyId,
        customerId: params.id,
        userId: session.user.id
      },
      select: {
        id: true,
        points: true,
        level: true,
        status: true
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({
      data: loyalty,
      message: 'Programa de fidelidade excluído com sucesso'
    })
  } catch (error) {
    console.error('Error deleting loyalty program:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
