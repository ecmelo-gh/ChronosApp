import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { EstablishmentConfig } from '@/types/config'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const establishment = await prisma.establishment.findUnique({
      where: { id: params.id },
      select: {
        config: true,
        ownerId: true,
        owner: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!establishment) {
      return new NextResponse('Establishment not found', { status: 404 })
    }

    // Verificar se o usuário tem permissão
    if (establishment.owner.userId !== session.user?.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    return NextResponse.json(establishment.config)
  } catch (error) {
    console.error('Error getting establishment config:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()

    const establishment = await prisma.establishment.findUnique({
      where: { id: params.id },
      select: {
        config: true,
        ownerId: true,
        owner: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!establishment) {
      return new NextResponse('Establishment not found', { status: 404 })
    }

    // Verificar se o usuário tem permissão
    if (establishment.owner.userId !== session.user?.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Mesclar configurações existentes com as novas
    const currentConfig = establishment.config as EstablishmentConfig || {}
    const newConfig = {
      ...currentConfig,
      ...body
    }

    // Atualizar configurações
    const updatedEstablishment = await prisma.establishment.update({
      where: { id: params.id },
      data: {
        config: newConfig
      },
      select: {
        config: true
      }
    })

    return NextResponse.json(updatedEstablishment.config)
  } catch (error) {
    console.error('Error updating establishment config:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
