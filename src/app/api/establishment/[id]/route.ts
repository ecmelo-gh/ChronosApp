import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

// DELETE /api/establishment/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      include: {
        services: {
          select: {
            id: true
          }
        },
        appointments: {
          select: {
            id: true
          }
        }
      }
    })

    if (!establishment) {
      return NextResponse.json({ error: 'Establishment not found' }, { status: 404 })
    }

    // Verificar se há serviços ou agendamentos
    if (establishment.services.length > 0 || establishment.appointments.length > 0) {
      // Inativar em vez de deletar
      const updatedEstablishment = await prisma.establishment.update({
        where: {
          id: params.id
        },
        data: {
          status: 'INACTIVE'
        }
      })
      return NextResponse.json(updatedEstablishment)
    }

    // Deletar estabelecimento
    await prisma.establishment.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/establishment error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
