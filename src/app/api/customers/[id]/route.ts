import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

import { successResponse, errorResponse } from '@/lib/api/responses'
import { validateRequest, withErrorHandler, withAuth } from '@/lib/api/middleware'
import { customerUpdateSchema } from '@/schemas/customer/base.schema'

type RouteParams = { params: { id: string } }

// Query Builders
const buildCustomerDetailSelect = (): Prisma.CustomerSelect => ({
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
  appointments: {
    orderBy: { date: 'desc' },
    select: {
      id: true,
      date: true,
      status: true,
      notes: true,
      service: {
        select: {
          id: true,
          name: true,
          price: true,
          duration: true
        }
      }
    }
  },
  customerFeedbacks: {
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      message: true,
      rating: true,
      source: true,
      tags: true,
      created_at: true
    }
  },
  customerLoyalty: {
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      points: true,
      level: true,
      currentValue: true,
      targetValue: true,
      startDate: true,
      endDate: true
    }
  },
  customerReferrals: {
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      referredName: true,
      referredPhone: true,
      referredEmail: true,
      status: true,
      convertedAt: true,
      created_at: true
    }
  }
})

const buildCustomerBasicSelect = (): Prisma.CustomerSelect => ({
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
  updated_at: true
})

const buildCustomerDeleteSelect = (): Prisma.CustomerSelect => ({
  id: true,
  full_name: true
})

const getHandler = async (req: NextRequest, { params }: RouteParams) => {
  const session = await getServerSession(authOptions)

  const customer = await prisma.customer.findFirst({
    where: {
      id: params.id,
      userId: session!.user!.id
    },
    select: buildCustomerDetailSelect()
  })

  if (!customer) {
    return errorResponse('NOT_FOUND', 'Cliente não encontrado')
  }

  return successResponse({ data: customer })
}

export const GET = withErrorHandler(
  withAuth(getHandler)
)

const patchHandler = async (req: NextRequest, { params }: RouteParams) => {
  const session = await getServerSession(authOptions)
  const data = await req.json()

  try {
    const customer = await prisma.customer.update({
      where: {
        id: params.id,
        userId: session!.user!.id
      },
      data: {
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        imageUrl: data.imageUrl,
        photoUrl: data.photoUrl,
        status: data.status
      },
      select: buildCustomerBasicSelect()
    })

    revalidatePath(`/dashboard/customers/${params.id}`)
    return successResponse({
      message: 'Cliente atualizado com sucesso',
      data: customer
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return errorResponse('NOT_FOUND', 'Cliente não encontrado')
      }
    }
    throw error
  }
}

export const PATCH = withErrorHandler(
  withAuth(
    validateRequest(customerUpdateSchema, patchHandler)
  )
)

const deleteHandler = async (req: NextRequest, { params }: RouteParams) => {
  const session = await getServerSession(authOptions)

  try {
    const customer = await prisma.customer.delete({
      where: {
        id: params.id,
        userId: session!.user!.id
      },
      select: buildCustomerDeleteSelect()
    })

    revalidatePath('/dashboard/customers')
    return successResponse({
      message: 'Cliente excluído com sucesso',
      data: customer
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return errorResponse('NOT_FOUND', 'Cliente não encontrado')
      }
    }
    throw error
  }
}

export const DELETE = withErrorHandler(
  withAuth(deleteHandler)
)
