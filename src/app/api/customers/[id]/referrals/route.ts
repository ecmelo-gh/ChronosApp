import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { referralCreateSchema, referralFilterSchema, referralUpdateSchema } from '@/lib/validations/referral'
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
    const filters = referralFilterSchema.parse({
      status: searchParams.get('status'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      search: searchParams.get('search'),
      page: Number(searchParams.get('page')) || 1,
      perPage: Number(searchParams.get('perPage')) || 10,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    })

    const where: Prisma.ReferralWhereInput = {
      customerId: params.id,
      userId: session.user.id,
      ...(filters.status && { status: filters.status }),
      ...(filters.startDate && { created_at: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && { created_at: { lte: new Date(filters.endDate) } }),
      ...(filters.search && {
        OR: [
          { referredName: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
          { referredPhone: { contains: filters.search } },
          { referredEmail: { contains: filters.search, mode: Prisma.QueryMode.insensitive } }
        ]
      })
    }

    const [total, referrals] = await Promise.all([
      prisma.referral.count({ where }),
      prisma.referral.findMany({
        where,
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
        select: {
          id: true,
          referredName: true,
          referredPhone: true,
          referredEmail: true,
          notes: true,
          status: true,
          convertedAt: true,
          created_at: true,
          updated_at: true,
          convertedCustomer: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true
            }
          }
        }
      })
    ])

    // Calcular estatísticas
    const stats = await prisma.referral.groupBy({
      by: ['status'],
      where: {
        customerId: params.id,
        userId: session.user.id
      },
      _count: true
    })

    const statistics = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      data: referrals,
      meta: {
        total,
        statistics,
        page: filters.page,
        perPage: filters.perPage,
        pageCount: Math.ceil(total / filters.perPage)
      }
    })
  } catch (error) {
    console.error('Error fetching referrals:', error)
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
    const data = referralCreateSchema.parse(json)

    // Verificar se o telefone já foi indicado
    const existingReferral = await prisma.referral.findFirst({
      where: {
        userId: session.user.id,
        referredPhone: data.referredPhone,
        status: {
          in: ['pending', 'converted']
        }
      }
    })

    if (existingReferral) {
      return NextResponse.json(
        { error: 'Este contato já foi indicado recentemente' },
        { status: 400 }
      )
    }

    const referral = await prisma.referral.create({
      data: {
        ...data,
        customerId: params.id,
        userId: session.user.id,
        convertedAt: data.convertedAt ? new Date(data.convertedAt) : null
      },
      select: {
        id: true,
        referredName: true,
        referredPhone: true,
        referredEmail: true,
        notes: true,
        status: true,
        convertedAt: true,
        created_at: true,
        updated_at: true
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({ data: referral })
  } catch (error) {
    console.error('Error creating referral:', error)
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
    const { referralId, ...updateData } = json
    
    if (!referralId) {
      return NextResponse.json(
        { error: 'ID da indicação é obrigatório' },
        { status: 400 }
      )
    }

    const data = referralUpdateSchema.parse(updateData)

    // Se estiver convertendo, verificar e atualizar dados
    if (data.status === 'converted') {
      if (!data.convertedCustomerId) {
        return NextResponse.json(
          { error: 'ID do cliente convertido é obrigatório' },
          { status: 400 }
        )
      }

      // Verificar se o cliente existe
      const customer = await prisma.customer.findUnique({
        where: { id: data.convertedCustomerId }
      })

      if (!customer) {
        return NextResponse.json(
          { error: 'Cliente convertido não encontrado' },
          { status: 400 }
        )
      }

      // Atualizar data de conversão se não fornecida
      if (!data.convertedAt) {
        data.convertedAt = new Date().toISOString()
      }
    }

    const referral = await prisma.referral.update({
      where: {
        id: referralId,
        customerId: params.id,
        userId: session.user.id
      },
      data: {
        ...data,
        convertedAt: data.convertedAt ? new Date(data.convertedAt) : undefined
      },
      select: {
        id: true,
        referredName: true,
        referredPhone: true,
        referredEmail: true,
        notes: true,
        status: true,
        convertedAt: true,
        created_at: true,
        updated_at: true,
        convertedCustomer: data.convertedCustomerId ? {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true
          }
        } : false
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({ data: referral })
  } catch (error) {
    console.error('Error updating referral:', error)
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
    const referralId = searchParams.get('referralId')

    if (!referralId) {
      return NextResponse.json(
        { error: 'ID da indicação é obrigatório' },
        { status: 400 }
      )
    }

    // Não permitir excluir indicações convertidas
    const referral = await prisma.referral.findUnique({
      where: { id: referralId }
    })

    if (referral?.status === 'converted') {
      return NextResponse.json(
        { error: 'Não é possível excluir uma indicação convertida' },
        { status: 400 }
      )
    }

    const deleted = await prisma.referral.delete({
      where: {
        id: referralId,
        customerId: params.id,
        userId: session.user.id
      },
      select: {
        id: true,
        referredName: true,
        status: true,
        created_at: true
      }
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return NextResponse.json({
      data: deleted,
      message: 'Indicação excluída com sucesso'
    })
  } catch (error) {
    console.error('Error deleting referral:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
