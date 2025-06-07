import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { unlink } from 'fs/promises'

// 1. Tipagem de Input
type RouteParams = { params: { id: string } }

// 2. Error Handling
class UploadError extends Error {
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
      throw new UploadError('Não autorizado', 401)
    }

    // Buscar upload
    const upload = await prisma.upload.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!upload) {
      throw new UploadError('Upload não encontrado', 404)
    }

    return NextResponse.json({ data: upload })
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    console.error('Error getting upload:', error)
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
      throw new UploadError('Não autorizado', 401)
    }

    // Buscar upload
    const upload = await prisma.upload.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!upload) {
      throw new UploadError('Upload não encontrado', 404)
    }

    // Deletar arquivo físico
    try {
      await unlink(upload.path)
    } catch (error) {
      console.error('Error deleting file:', error)
      // Não falhar se o arquivo físico não existir
    }

    // Deletar registro do banco (soft delete)
    await prisma.upload.update({
      where: {
        id: params.id
      },
      data: {
        status: 'deleted',
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      message: 'Upload removido com sucesso'
    })
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Upload não encontrado' },
          { status: 404 }
        )
      }
    }
    console.error('Error deleting upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
