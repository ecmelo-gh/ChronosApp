import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import type { Establishment, Prisma } from '@prisma/client'

// 1. Tipagem de Input
type RouteParams = { params: { id: string } }

// 2. Validação
const updateEstablishmentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  address: z.string().min(1, 'Endereço é obrigatório').optional(),
  city: z.string().min(1, 'Cidade é obrigatória').optional(),
  state: z.string().min(2, 'Estado é obrigatório').max(2, 'Use a sigla do estado').optional(),
  zipCode: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido').optional(),
  phone: z.string().min(10, 'Telefone inválido').optional(),
  email: z.string().email('Email inválido').optional().nullable(),
  website: z.string().url('Website inválido').optional().nullable(),
  logoUrl: z.string().url('URL do logo inválida').optional().nullable(),
  coverUrl: z.string().url('URL da capa inválida').optional().nullable(),
  businessHours: z.record(z.array(z.object({
    open: z.string(),
    close: z.string()
  }))).optional().nullable(),
  features: z.array(z.string()).optional()
})

// 3. Error Handling
class EstablishmentError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new EstablishmentError('Não autorizado', 401)
    }

    // Buscar establishment
    const establishment: Establishment | null = await prisma.establishment.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!establishment) {
      throw new EstablishmentError('Establishment não encontrado', 404)
    }

    return NextResponse.json({ data: establishment })
  } catch (error) {
    if (error instanceof EstablishmentError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    console.error('Error getting establishment:', error)
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
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new EstablishmentError('Não autorizado', 401)
    }

    // Validar request
    const json = await request.json()
    const body = updateEstablishmentSchema.parse(json)

    // Verificar se establishment existe e pertence ao usuário
    const establishment: Establishment | null = await prisma.establishment.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!establishment) {
      throw new EstablishmentError('Establishment não encontrado', 404)
    }

    // Atualizar establishment
    const updateData: Prisma.EstablishmentUpdateInput = {
      ...body,
      businessHours: body.businessHours as Prisma.InputJsonValue,
      updated_at: new Date()
    }

    const updated = await prisma.establishment.update({
      where: {
        id: params.id
      },
      data: updateData
    })

    return NextResponse.json({
      data: updated,
      message: 'Establishment atualizado com sucesso'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }
    if (error instanceof EstablishmentError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    console.error('Error updating establishment:', error)
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
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new EstablishmentError('Não autorizado', 401)
    }

    // Verificar se establishment existe e pertence ao usuário
    const establishment: Establishment | null = await prisma.establishment.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!establishment) {
      throw new EstablishmentError('Establishment não encontrado', 404)
    }

    // Soft delete do establishment
    await prisma.establishment.update({
      where: {
        id: params.id
      },
      data: {
        status: 'deleted',
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      message: 'Establishment removido com sucesso'
    })
  } catch (error) {
    if (error instanceof EstablishmentError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    console.error('Error deleting establishment:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
