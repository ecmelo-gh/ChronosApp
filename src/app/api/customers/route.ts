import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth'

import { successResponse, errorResponse } from '@/lib/api/responses'
import { validateRequest, withErrorHandler, withAuth } from '@/lib/api/middleware'
import { customerCreateSchema, customerFilterSchema, CustomerStatus } from '@/schemas/customer/base.schema'
import type { CustomerFilter } from '@/schemas/customer/base.schema'

// Query Builders
const buildCustomerWhere = (
  userId: string,
  filters: CustomerFilter
): Prisma.CustomerWhereInput => ({
  userId,
  status: filters.status || CustomerStatus.ACTIVE,
  ...(filters.search ? {
    OR: [
      { full_name: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
      { email: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
      { phone: { contains: filters.search } }
    ]
  } : {})
})

const buildCustomerSelect = (): Prisma.CustomerSelect => ({
  id: true,
  full_name: true,
  email: true,
  phone: true,
  cpf: true,
  birthDate: true,
  imageUrl: true,
  photoUrl: true,
  status: true,
  created_at: true,
  updated_at: true,
  _count: {
    select: {
      appointments: true,
      customerFeedbacks: true,
      customerReferrals: true
    }
  }
})

const getHandler = async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(req.url)

  const filters = customerFilterSchema.parse({
    search: searchParams.get('search'),
    status: searchParams.get('status') as CustomerStatus | null,
    page: Number(searchParams.get('page')) || 1,
    perPage: Number(searchParams.get('perPage')) || 10,
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
  })

  const where = buildCustomerWhere(session!.user!.id, filters)
  const select = buildCustomerSelect()

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { [filters.sortBy]: filters.sortOrder },
      skip: (filters.page - 1) * filters.perPage,
      take: filters.perPage,
      select
    })
  ])

  return successResponse({
    data: customers,
    meta: {
      total,
      page: filters.page,
      perPage: filters.perPage,
      pageCount: Math.ceil(total / filters.perPage)
    }
  })
}

export const GET = withErrorHandler(
  withAuth(getHandler)
)

const postHandler = async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  const data = await req.json()

  const customer = await prisma.customer.create({
    data: {
      userId: session!.user!.id,
      full_name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      imageUrl: data.imageUrl,
      photoUrl: data.photoUrl,
      status: data.status
    },
    select: buildCustomerSelect()
  })

  return successResponse({
    message: 'Cliente criado com sucesso',
    data: customer
  })
}

export const POST = withErrorHandler(
  withAuth(
    validateRequest(customerCreateSchema, postHandler)
  )
)
