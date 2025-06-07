import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { Prisma, PrismaClient } from '@prisma/client'
import { CreateEstablishmentDTO, UpdateEstablishmentDTO } from '@/types/establishment'
import slugify from 'slugify'

// GET /api/establishment
export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar estabelecimentos do owner
    const establishments = await prisma.establishment.findMany({
      where: {
        owner: {
          user: {
            email: session.user.email
          }
        }
      },
      select: {
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
        owner: {
          select: {
            id: true,
            businessName: true
          }
        }
      }
    })

    return NextResponse.json(establishments)
  } catch (error) {
    console.error('GET /api/establishment error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/establishment
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: CreateEstablishmentDTO = await request.json()

    // Buscar owner
    const owner = await prisma.owner.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      },
      select: {
        id: true,
        businessName: true,
        plan: true,
        establishments: true
      }
    })

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    // Verificar limite do plano
    if (owner.plan === 'BASIC' && owner.establishments.length >= 1) {
      return NextResponse.json({ error: 'Plan limit reached' }, { status: 403 })
    }
    if (owner.plan === 'PREMIUM' && owner.establishments.length >= 3) {
      return NextResponse.json({ error: 'Plan limit reached' }, { status: 403 })
    }

    // Criar slug único
    const slug = slugify(data.name, { lower: true })

    // Criar estabelecimento
    const establishment = await prisma.establishment.create({
      data: {
        ...data,
        slug,
        owner: {
          connect: {
            id: owner.id
          }
        }
      },
      select: {
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
        owner: {
          select: {
            id: true,
            businessName: true
          }
        }
      }
    })

    return NextResponse.json(establishment)
  } catch (error) {
    console.error('POST /api/establishment error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH /api/establishment/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: UpdateEstablishmentDTO = await request.json()

    // Verificar se o usuário é dono do estabelecimento
    const establishment = await prisma.establishment.findFirst({
      where: {
        id: params.id,
        owner: {
          user: {
            email: session.user.email
          }
        }
      },
      select: {
        id: true
      }
    })

    if (!establishment) {
      return NextResponse.json({ error: 'Establishment not found' }, { status: 404 })
    }

    // Atualizar estabelecimento
    const updatedEstablishment = await prisma.establishment.update({
      where: {
        id: params.id
      },
      data: {
        ...data
      },
      select: {
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
        owner: {
          select: {
            id: true,
            businessName: true
          }
        }
      }
    })

    return NextResponse.json(updatedEstablishment)
  } catch (error) {
    console.error('PATCH /api/establishment error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
