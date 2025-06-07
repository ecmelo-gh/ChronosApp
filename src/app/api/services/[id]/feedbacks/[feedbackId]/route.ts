import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const updateFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  message: z.string().max(1000).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Ao menos um campo deve ser fornecido para atualização'
})

// 2. Tipagem de Input
type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>
type RouteParams = { params: { id: string; feedbackId: string } }

// 3. Query Builders Tipados
const buildFeedbackSelect = (): Prisma.CustomerFeedbackSelect => ({
  id: true,
  rating: true,
  message: true,
  source: true,
  tags: true,
  created_at: true,
  updated_at: true,
  customer: {
    select: {
      id: true,
      full_name: true,
      email: true
    }
  }
})

// 4. Error Handling
class FeedbackDetailError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new FeedbackDetailError('Unauthorized', 401)
  }
  return session.user.id
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    const feedback = await prisma.customerFeedback.findFirst({
      where: {
        id: params.feedbackId,
        userId,
        visitId: {
          not: null
        }
      },
      select: buildFeedbackSelect()
    })

    if (!feedback) {
      throw new FeedbackDetailError('Feedback não encontrado', 404)
    }

    return NextResponse.json({ data: feedback })
  } catch (error) {
    if (error instanceof FeedbackDetailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    console.error('Error fetching feedback:', error)
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

    // Verificar se o feedback existe e pertence ao serviço
    const existingFeedback = await prisma.customerFeedback.findFirst({
      where: {
        id: params.feedbackId,
        userId,
        visitId: {
          not: null
        }
      }
    })

    if (!existingFeedback) {
      throw new FeedbackDetailError('Feedback não encontrado', 404)
    }

    const json = await request.json()
    const data = updateFeedbackSchema.parse(json)

    // Atualizar feedback
    const feedback = await prisma.customerFeedback.update({
      where: {
        id: params.feedbackId,
        userId
      },
      data: {
        rating: data.rating,
        message: data.message,
        updated_at: new Date()
      },
      select: buildFeedbackSelect()
    })

    return NextResponse.json({
      data: feedback,
      message: 'Feedback atualizado com sucesso'
    })
  } catch (error) {
    if (error instanceof FeedbackDetailError) {
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
          { error: 'Feedback não encontrado' },
          { status: 404 }
        )
      }
    }
    console.error('Error updating feedback:', error)
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

    // Verificar se o feedback existe e pertence ao serviço
    const existingFeedback = await prisma.customerFeedback.findFirst({
      where: {
        id: params.feedbackId,
        userId,
        visitId: {
          not: null
        }
      }
    })

    if (!existingFeedback) {
      throw new FeedbackDetailError('Feedback não encontrado', 404)
    }

    // Remover feedback
    await prisma.customerFeedback.delete({
      where: {
        id: params.feedbackId,
        userId
      }
    })

    return NextResponse.json({
      message: 'Feedback removido com sucesso'
    })
  } catch (error) {
    if (error instanceof FeedbackDetailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Feedback não encontrado' },
          { status: 404 }
        )
      }
    }
    console.error('Error deleting feedback:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
