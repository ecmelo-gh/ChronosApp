import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { withAuth, withErrorHandler } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/responses'
import { createAuditLog } from '@/lib/audit'
import { rateLimit } from '@/lib/rate-limit'
import { imageValidationSchema } from '@/schemas/upload.schema'
import { processUpload } from '@/lib/upload'

// POST /api/establishment/[id]/cover
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const identifier = request.ip || 'anonymous'
    const { success } = await rateLimit.limit(identifier)
    if (!success) {
      return errorResponse('TOO_MANY_REQUESTS', 'Muitas requisições, tente novamente mais tarde')
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
      }
    })

    if (!establishment) {
      return NextResponse.json({ error: 'Establishment not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return errorResponse('BAD_REQUEST', 'Arquivo é obrigatório')
    }

    // Validar imagem
    imageValidationSchema.parse({ file })

    // Processar upload
    const upload = await processUpload(file, session.user.id, {
      type: 'establishment_cover',
      establishmentId: params.id
    })

    // Atualizar estabelecimento
    const updatedEstablishment = await prisma.establishment.update({
      where: {
        id: params.id
      },
      data: {
        coverUrl: upload.url
      }
    })

    // Registrar auditoria
    await createAuditLog({
      action: 'update',
      resource: 'establishment',
      resourceId: params.id,
      userId: session.user.id,
      details: {
        field: 'coverUrl',
        oldValue: establishment.coverUrl,
        newValue: upload.url
      }
    }).catch(console.error)

    return successResponse({
      message: 'Imagem de capa atualizada com sucesso',
      data: {
        coverUrl: upload.url
      }
    })
  } catch (error) {
    console.error('POST /api/establishment/[id]/cover error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
