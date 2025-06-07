import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, withErrorHandler, validateRequest } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/responses'
import { createAuditLog } from '@/lib/audit'
import { rateLimit } from '@/lib/rate-limit'
import { 
  createEstablishmentSchema, 
  updateEstablishmentSchema, 
  listEstablishmentsSchema 
} from '@/schemas/establishment/establishment.schema'
import { Prisma } from '@prisma/client'

type EstablishmentStatus = 'active' | 'inactive'

// Query Builders
const buildEstablishmentSelect = (): Prisma.EstablishmentSelect => ({
  id: true,
  name: true,
  description: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  phone: true,
  email: true,
  website: true,
  logoUrl: true,
  coverUrl: true,
  businessHours: true,
  features: true,
  status: true,
  created_at: true,
  updated_at: true,
  _count: {
    services: true,
    appointments: true
  }
})

// Handlers
const getHandler = async (
  req: NextRequest
) => {
  const { searchParams } = new URL(req.url)
  const filters = listEstablishmentsSchema.parse({
    status: searchParams.get('status'),
    city: searchParams.get('city'),
    state: searchParams.get('state'),
    search: searchParams.get('search'),
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10,
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
  })

  const where: Prisma.EstablishmentWhereInput = {
    userId: req.auth.id,
    ...(filters.status && { status: filters.status as 'active' | 'inactive' }),
    ...(filters.city && { city: filters.city }),
    ...(filters.state && { state: filters.state }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } }
      ]
    })
  }

  const [total, establishments] = await Promise.all([
    prisma.establishment.count({ where }),
    prisma.establishment.findMany({
      where,
      orderBy: { [filters.sortBy]: filters.sortOrder },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      select: buildEstablishmentSelect()
    })
  ])

  // Calcular estatísticas
  type ServiceStat = {
    id: string;
    name: string;
    _count: {
      services: number;
      appointments: number;
    };
  }

  type CityStat = {
    city: string;
    _count: number;
  }

  type ServiceStats = Array<ServiceStat>
  type CityStats = Array<CityStat>

  const stats = await prisma.$transaction(async (tx) => {
    const serviceStats = await tx.establishment.findMany({
      where: {
        userId: req.auth.id,
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            services: true,
            appointments: true
          }
        }
      }
    })

    const cityStats = await tx.establishment.groupBy({
      by: ['city'],
      where: {
        userId: req.auth.id,
        status: 'active'
      },
      _count: true
    })

    return [
      serviceStats as unknown as ServiceStats,
      cityStats as unknown as CityStats
    ]
  })


  const [serviceStats, cityStats] = stats
  const statistics = {
    totalEstablishments: total,
    activeEstablishments: establishments.filter(e => e.status === 'active').length,
    servicesByEstablishment: (serviceStats as ServiceStat[]).reduce<Record<string, number>>((acc, est) => {
      acc[est.name] = est._count.services
      return acc
    }, {}),
    appointmentsByEstablishment: (serviceStats as ServiceStat[]).reduce<Record<string, number>>((acc, est) => {
      acc[est.name] = est._count.appointments
      return acc
    }, {}),
    establishmentsByCity: (cityStats as CityStat[]).reduce<Record<string, number>>((acc, city) => {
      acc[city.city] = city._count
      return acc
    }, {})
  }

  return successResponse({
    data: establishments,
    meta: {
      total,
      page: filters.page,
      limit: filters.limit,
      pageCount: Math.ceil(total / filters.limit)
    },
    statistics
  })
}

const postHandler = async (
  req: NextRequest
) => {
  // Rate limiting
  const identifier = req.ip || 'anonymous'
  const { success } = await rateLimit.limit(identifier)
  
  if (!success) {
    return errorResponse('TOO_MANY_REQUESTS', 'Muitas requisições, tente novamente mais tarde')
  }

  const json = await req.json()
  const data = createEstablishmentSchema.parse({
    ...json,
    userId: req.auth.id
  })

  const establishment = await prisma.establishment.create({
    data,
    select: buildEstablishmentSelect()
  })

  // Registrar auditoria
  await createAuditLog({
    action: 'create',
    resource: 'establishment',
    resourceId: establishment.id,
    userId: req.auth.id,
    details: data
  }).catch(console.error)

  return successResponse({
    message: 'Estabelecimento criado com sucesso',
    data: establishment
  })
}

const patchHandler = async (
  req: NextRequest
) => {
  const json = await req.json()
  const { establishmentId, ...updateData } = json

  if (!establishmentId) {
    return errorResponse('BAD_REQUEST', 'ID do estabelecimento é obrigatório')
  }

  const data = updateEstablishmentSchema.parse(updateData)

  const establishment = await prisma.establishment.update({
    where: {
      id: establishmentId,
      userId: req.auth.id
    },
    data,
    select: buildEstablishmentSelect()
  })

  // Registrar auditoria
  await createAuditLog({
    action: 'update',
    resource: 'establishment',
    resourceId: establishment.id,
    userId: req.auth.id,
    details: data
  }).catch(console.error)

  return successResponse({
    message: 'Estabelecimento atualizado com sucesso',
    data: establishment
  })
}

const deleteHandler = async (
  req: NextRequest
) => {
  const { searchParams } = new URL(req.url)
  const establishmentId = searchParams.get('establishmentId')

  if (!establishmentId) {
    return errorResponse('BAD_REQUEST', 'ID do estabelecimento é obrigatório')
  }

  // Verificar se tem serviços ou agendamentos
  const [establishment, counts] = await prisma.$transaction([
    prisma.establishment.findUnique({
      where: {
        id: establishmentId,
        userId: req.auth.id
      },
      select: buildEstablishmentSelect()
    }),
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM establishments e
      WHERE e.id = ${establishmentId}
      AND e.user_id = ${req.auth.id}
      AND (EXISTS (SELECT 1 FROM services s WHERE s.establishment_id = e.id)
           OR EXISTS (SELECT 1 FROM appointments a WHERE a.establishment_id = e.id))
    `
  ])

  if (!establishment) {
    return errorResponse('NOT_FOUND', 'Estabelecimento não encontrado')
  }

  const hasRelatedData = counts[0]?.count > 0

  if (hasRelatedData) {
    // Se tiver serviços ou agendamentos, apenas inativar
    await prisma.establishment.update({
      where: {
        id: establishmentId,
        userId: req.auth.id
      },
      data: {
        status: 'inactive' as EstablishmentStatus
      }
    })

    return successResponse({
      message: 'Estabelecimento inativado com sucesso'
    })
  }

  // Se não tiver serviços nem agendamentos, excluir
  await prisma.establishment.delete({
    where: {
      id: establishmentId,
      userId: req.auth.id
    }
  })

  return successResponse({
    message: 'Estabelecimento excluído com sucesso'
  })
}

// Routes
export const GET = withErrorHandler(
  withAuth(getHandler)
)

export const POST = withErrorHandler(
  withAuth(
    validateRequest(createEstablishmentSchema, postHandler)
  )
)

export const PATCH = withErrorHandler(
  withAuth(
    validateRequest(updateEstablishmentSchema, patchHandler)
  )
)

export const DELETE = withErrorHandler(
  withAuth(deleteHandler)
)
