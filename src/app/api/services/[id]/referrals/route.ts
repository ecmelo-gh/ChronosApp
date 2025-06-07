import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const referralFiltersSchema = z.object({
  status: z.enum(['PENDING', 'CONVERTED', 'CANCELLED']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial inválida').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida').optional(),
  search: z.string().min(3).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
})

const createReferralSchema = z.object({
  customerId: z.string().uuid(),
  referredName: z.string().min(3).max(100),
  referredPhone: z.string().min(10).max(20),
  referredEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional()
})

// 2. Tipagem de Input
type ReferralFiltersInput = z.infer<typeof referralFiltersSchema>
type CreateReferralInput = z.infer<typeof createReferralSchema>
type RouteParams = { params: { id: string } }

interface ReferralMetrics {
  totalCount: number
  convertedCount: number
  conversionRate: number
  pendingCount: number
  cancelledCount: number
  averageConversionTime?: number // em dias
}

// 3. Query Builders Tipados
const buildReferralsWhere = (
  userId: string,
  serviceId: string,
  filters: Partial<ReferralFiltersInput>
): Prisma.CustomerReferralWhereInput => ({
  userId,
  customer: {
    appointments: {
      some: {
        serviceId
      }
    }
  },
  ...(filters.status && { status: filters.status }),
  ...(filters.search && {
    OR: [
      { referredName: { contains: filters.search, mode: 'insensitive' } },
      { referredPhone: { contains: filters.search } },
      { referredEmail: { contains: filters.search, mode: 'insensitive' } }
    ]
  }),
  ...(filters.startDate || filters.endDate ? {
    created_at: {
      ...(filters.startDate && { gte: new Date(`${filters.startDate}T00:00:00`) }),
      ...(filters.endDate && { lte: new Date(`${filters.endDate}T23:59:59`) })
    }
  } : {})
})

// 4. Error Handling
class ServiceReferralError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new ServiceReferralError('Unauthorized', 401)
  }
  return session.user.id
}

// 6. Helpers
const calculateMetrics = (referrals: any[]): ReferralMetrics => {
  const totalCount = referrals.length
  if (totalCount === 0) {
    return {
      totalCount: 0,
      convertedCount: 0,
      conversionRate: 0,
      pendingCount: 0,
      cancelledCount: 0
    }
  }

  const convertedReferrals = referrals.filter(r => r.status === 'CONVERTED')
  const pendingReferrals = referrals.filter(r => r.status === 'PENDING')
  const cancelledReferrals = referrals.filter(r => r.status === 'CANCELLED')

  // Calcular tempo médio de conversão
  const conversionTimes = convertedReferrals
    .map(r => {
      if (r.convertedAt && r.created_at) {
        return (new Date(r.convertedAt).getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24)
      }
      return null
    })
    .filter(time => time !== null)

  const averageConversionTime = conversionTimes.length > 0
    ? conversionTimes.reduce((sum, time) => sum + time!, 0) / conversionTimes.length
    : undefined

  return {
    totalCount,
    convertedCount: convertedReferrals.length,
    conversionRate: (convertedReferrals.length / totalCount) * 100,
    pendingCount: pendingReferrals.length,
    cancelledCount: cancelledReferrals.length,
    ...(averageConversionTime && { averageConversionTime })
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
      throw new ServiceReferralError('Serviço não encontrado', 404)
    }

    const { searchParams } = new URL(request.url)
    const filters = referralFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20
    })

    // Buscar total para paginação
    const total = await prisma.customerReferral.count({
      where: buildReferralsWhere(userId, params.id, filters)
    })

    // Buscar referrals paginados
    const referrals = await prisma.customerReferral.findMany({
      where: buildReferralsWhere(userId, params.id, filters),
      select: {
        id: true,
        referredName: true,
        referredPhone: true,
        referredEmail: true,
        notes: true,
        status: true,
        source: true,
        convertedAt: true,
        created_at: true,
        customer: {
          select: {
            id: true,
            full_name: true,
            phone: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    })

    // Buscar todos os referrals para métricas (sem paginação)
    const allReferrals = await prisma.customerReferral.findMany({
      where: buildReferralsWhere(userId, params.id, {
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search
      }),
      select: {
        status: true,
        convertedAt: true,
        created_at: true
      }
    })

    const metrics = calculateMetrics(allReferrals)

    return NextResponse.json({
      data: {
        service: {
          id: service.id,
          name: service.name
        },
        referrals,
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
    if (error instanceof ServiceReferralError) {
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
    console.error('Error fetching service referrals:', error)
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
      throw new ServiceReferralError('Serviço não encontrado', 404)
    }

    const json = await request.json()
    const data = createReferralSchema.parse(json)

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
      throw new ServiceReferralError(
        'Cliente não encontrado ou não utilizou este serviço',
        404
      )
    }

    // Verificar se já existe referral para este telefone
    const existingReferral = await prisma.customerReferral.findFirst({
      where: {
        userId,
        referredPhone: data.referredPhone,
        status: {
          in: ['PENDING', 'CONVERTED']
        }
      }
    })

    if (existingReferral) {
      throw new ServiceReferralError(
        'Já existe uma indicação ativa para este telefone',
        409
      )
    }

    // Criar referral
    const referral = await prisma.customerReferral.create({
      data: {
        userId,
        customerId: data.customerId,
        referredName: data.referredName,
        referredPhone: data.referredPhone,
        referredEmail: data.referredEmail,
        notes: data.notes,
        source: 'APP',
        status: 'PENDING'
      },
      select: {
        id: true,
        referredName: true,
        referredPhone: true,
        referredEmail: true,
        notes: true,
        status: true,
        source: true,
        created_at: true,
        customer: {
          select: {
            id: true,
            full_name: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json({
      data: referral,
      message: 'Indicação criada com sucesso'
    })
  } catch (error) {
    if (error instanceof ServiceReferralError) {
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
    console.error('Error creating service referral:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
