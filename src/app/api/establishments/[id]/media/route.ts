import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, withErrorHandler } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/responses'
import { createAuditLog } from '@/lib/audit'
import { rateLimit } from '@/lib/rate-limit'
import { imageValidationSchema } from '@/schemas/upload.schema'
import { processUpload } from '@/lib/upload'

// Handlers
const postHandler = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Rate limiting
  const identifier = req.ip || 'anonymous'
  const { success } = await rateLimit.limit(identifier)
  
  if (!success) {
    return errorResponse('TOO_MANY_REQUESTS', 'Muitas requisições, tente novamente mais tarde')
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const type = formData.get('type') as 'logo' | 'cover'

  if (!file) {
    return errorResponse('BAD_REQUEST', 'Arquivo é obrigatório')
  }

  if (!type || !['logo', 'cover'].includes(type)) {
    return errorResponse('BAD_REQUEST', 'Tipo de mídia inválido. Use "logo" ou "cover"')
  }

  // Validar arquivo
  imageValidationSchema.parse({ file })

  // Verificar se estabelecimento existe e pertence ao usuário
  const establishment = await prisma.establishment.findUnique({
    where: {
      id: params.id,
      userId: req.auth.id
    },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      coverUrl: true
    }
  })

  if (!establishment) {
    return errorResponse('NOT_FOUND', 'Estabelecimento não encontrado')
  }

  // Processar upload
  const upload = await processUpload(file, req.auth.id, {
    establishmentId: establishment.id,
    establishmentName: establishment.name,
    mediaType: type
  })

  // Atualizar estabelecimento
  const updateData = type === 'logo'
    ? { logoUrl: upload.url }
    : { coverUrl: upload.url }

  await prisma.establishment.update({
    where: {
      id: params.id,
      userId: req.auth.id
    },
    data: updateData
  })

  // Registrar auditoria
  await createAuditLog({
    action: 'update',
    resource: 'establishment',
    resourceId: establishment.id,
    userId: req.auth.id,
    details: {
      mediaType: type,
      fileName: upload.fileName,
      fileSize: upload.fileSize
    }
  }).catch(console.error)

  return successResponse({
    message: `${type === 'logo' ? 'Logo' : 'Capa'} atualizado com sucesso`,
    data: {
      uploadId: upload.id,
      url: upload.url
    }
  })
}

const deleteHandler = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') as 'logo' | 'cover'

  if (!type || !['logo', 'cover'].includes(type)) {
    return errorResponse('BAD_REQUEST', 'Tipo de mídia inválido. Use "logo" ou "cover"')
  }

  // Verificar se estabelecimento existe e pertence ao usuário
  const establishment = await prisma.establishment.findUnique({
    where: {
      id: params.id,
      userId: req.auth.id
    }
  })

  if (!establishment) {
    return errorResponse('NOT_FOUND', 'Estabelecimento não encontrado')
  }

  // Remover URL da mídia
  const updateData = type === 'logo'
    ? { logoUrl: null }
    : { coverUrl: null }

  await prisma.establishment.update({
    where: {
      id: params.id,
      userId: req.auth.id
    },
    data: updateData
  })

  // Registrar auditoria
  await createAuditLog({
    action: 'update',
    resource: 'establishment',
    resourceId: establishment.id,
    userId: req.auth.id,
    details: {
      mediaType: type,
      action: 'remove'
    }
  }).catch(console.error)

  return successResponse({
    message: `${type === 'logo' ? 'Logo' : 'Capa'} removido com sucesso`
  })
}

// Routes
export const POST = withErrorHandler(
  withAuth(postHandler)
)

export const DELETE = withErrorHandler(
  withAuth(deleteHandler)
)
