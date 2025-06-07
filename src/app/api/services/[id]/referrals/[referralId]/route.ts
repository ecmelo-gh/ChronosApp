import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const updateReferralSchema = z.object({
  status: z.enum(['PENDING', 'CONVERTED', 'CANCELLED']),
  notes: z.string().max(1000).optional()
})

// 2. Tipagem de Input
type UpdateReferralInput = z.infer<typeof updateReferralSchema>
type RouteParams = { params: { id: string; referralId: string } }

// 3. Query Builders Tipados
const buildReferralSelect = (): Prisma.CustomerReferralSelect => ({
  id: true,
  referredName: true,
  referredPhone: true,
  referredEmail: true,
  notes: true,
  status: true,
  source: true,
  convertedAt: true,
  created_at: true,
  updated_at: true,
  customer: {
    select: {
      id: true,
      full_name: true,
      phone: true,
      email: true
    }
  }
})

// 4. Error Handling
class ReferralDetailError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new ReferralDetailError('Unauthorized', 401)
  }
  return session.user.id
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    const referral = await prisma.customerReferral.findFirst({
      where: {
        id: params.referralId,
        userId,
        customer: {
          appointments: {
            some: {
              serviceId: params.id
            }
          }
        }
      },
      select: buildReferralSelect()
    })

    if (!referral) {
      throw new ReferralDetailError('Indicação não encontrada', 404)
    }

    return NextResponse.json({ data: referral })
  } catch (error) {
    if (error instanceof ReferralDetailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    console.error('Error fetching referral:', error)
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

    // Verificar se a indicação existe e pertence ao serviço
    const existingReferral = await prisma.customerReferral.findFirst({
      where: {
        id: params.referralId,
        userId,
        customer: {
          appointments: {
            some: {
              serviceId: params.id
            }
          }
        }
      }
    })

    if (!existingReferral) {
      throw new ReferralDetailError('Indicação não encontrada', 404)
    }

    const json = await request.json()
    const data = updateReferralSchema.parse(json)

    // Atualizar indicação
    const referral = await prisma.customerReferral.update({
      where: {
        id: params.referralId,
        userId
      },
      data: {
        status: data.status,
        notes: data.notes,
        ...(data.status === 'CONVERTED' && !existingReferral.convertedAt
          ? { convertedAt: new Date() }
          : {}),
        updated_at: new Date()
      },
      select: buildReferralSelect()
    })

    return NextResponse.json({
      data: referral,
      message: 'Indicação atualizada com sucesso'
    })
  } catch (error) {
    if (error instanceof ReferralDetailError) {
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
          { error: 'Indicação não encontrada' },
          { status: 404 }
        )
      }
    }
    console.error('Error updating referral:', error)
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

    // Verificar se a indicação existe e pertence ao serviço
    const existingReferral = await prisma.customerReferral.findFirst({
      where: {
        id: params.referralId,
        userId,
        customer: {
          appointments: {
            some: {
              serviceId: params.id
            }
          }
        }
      }
    })

    if (!existingReferral) {
      throw new ReferralDetailError('Indicação não encontrada', 404)
    }

    // Não permitir remoção de indicações convertidas
    if (existingReferral.status === 'CONVERTED') {
      throw new ReferralDetailError(
        'Não é possível remover uma indicação convertida',
        400
      )
    }

    // Remover indicação
    await prisma.customerReferral.delete({
      where: {
        id: params.referralId,
        userId
      }
    })

    return NextResponse.json({
      message: 'Indicação removida com sucesso'
    })
  } catch (error) {
    if (error instanceof ReferralDetailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Indicação não encontrada' },
          { status: 404 }
        )
      }
    }
    console.error('Error deleting referral:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
