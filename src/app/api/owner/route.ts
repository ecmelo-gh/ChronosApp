import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { CreateOwnerDTO, UpdateOwnerDTO } from '@/types/owner'

// GET /api/owner
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const owner = await prisma.owner.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        establishments: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    return NextResponse.json(owner)
  } catch (error) {
    console.error('GET /api/owner error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/owner
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: CreateOwnerDTO = await request.json()

    // Verificar se já existe um owner para este usuário
    const existingOwner = await prisma.owner.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    if (existingOwner) {
      return NextResponse.json({ error: 'Owner already exists' }, { status: 400 })
    }

    // Criar novo owner
    const owner = await prisma.owner.create({
      data: {
        user: {
          connect: {
            email: session.user.email
          }
        },
        businessName: data.businessName,
        document: data.document,
        phone: data.phone,
        plan: data.plan || 'BASIC'
      },
      include: {
        establishments: true
      }
    })

    // Atualizar role do usuário
    await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        role: 'OWNER'
      }
    })

    return NextResponse.json(owner)
  } catch (error) {
    console.error('POST /api/owner error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH /api/owner
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: UpdateOwnerDTO = await request.json()

    const owner = await prisma.owner.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    const updatedOwner = await prisma.owner.update({
      where: {
        id: owner.id
      },
      data,
      include: {
        establishments: true
      }
    })

    return NextResponse.json(updatedOwner)
  } catch (error) {
    console.error('PATCH /api/owner error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
