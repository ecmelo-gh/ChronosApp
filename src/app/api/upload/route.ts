import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, withErrorHandler, validateRequest } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/responses'
import { createAuditLog } from '@/lib/audit'
import { rateLimit } from '@/lib/rate-limit'
import { 
  createUploadSchema, 
  updateUploadSchema, 
  listUploadsSchema,
  fileValidationSchema,
  imageValidationSchema,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES
} from '@/schemas/upload.schema'
import { Prisma } from '@prisma/client'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

// Query Builders
const buildUploadSelect = (): Prisma.UploadSelect => ({
  id: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  url: true,
  path: true,
  status: true,
  metadata: true,
  created_at: true,
  updated_at: true
})

// Helpers
const getUploadDir = () => {
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  return uploadDir
}

const getUploadUrl = (fileName: string) => {
  return `/uploads/${fileName}`
}

const processUpload = async (
  file: File,
  userId: string,
  metadata: Record<string, any> = {}
) => {
  const fileBuffer = await file.arrayBuffer()
  const fileName = `${uuidv4()}-${file.name}`
  const uploadDir = getUploadDir()
  const filePath = join(uploadDir, fileName)
  
  await writeFile(filePath, Buffer.from(fileBuffer))

  const upload = await prisma.upload.create({
    data: {
      userId,
      fileName,
      fileType: file.type,
      fileSize: file.size,
      url: getUploadUrl(fileName),
      path: filePath,
      metadata
    },
    select: buildUploadSelect()
  })

  return upload
}

// Handlers
const getHandler = async (
  req: NextRequest
) => {
  const { searchParams } = new URL(req.url)
  const filters = listUploadsSchema.parse({
    status: searchParams.get('status'),
    fileType: searchParams.get('fileType'),
    search: searchParams.get('search'),
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10,
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
  })

  const where: Prisma.UploadWhereInput = {
    userId: req.auth.id,
    ...(filters.status && { status: filters.status }),
    ...(filters.fileType && { fileType: filters.fileType }),
    ...(filters.search && {
      OR: [
        { fileName: { contains: filters.search, mode: 'insensitive' } },
        { fileType: { contains: filters.search, mode: 'insensitive' } }
      ]
    })
  }

  const [total, uploads] = await Promise.all([
    prisma.upload.count({ where }),
    prisma.upload.findMany({
      where,
      orderBy: { [filters.sortBy]: filters.sortOrder },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      select: buildUploadSelect()
    })
  ])

  // Calcular estatísticas
  const stats = await prisma.$transaction([
    // Total por tipo de arquivo
    prisma.upload.groupBy({
      by: ['fileType'],
      where: {
        userId: req.auth.id,
        status: 'active'
      },
      _count: true,
      _sum: {
        fileSize: true
      }
    })
  ])

  const [fileTypeStats] = stats
  const statistics = {
    totalUploads: total,
    activeUploads: uploads.filter(u => u.status === 'active').length,
    byFileType: fileTypeStats.reduce((acc, stat) => {
      acc[stat.fileType] = {
        count: stat._count,
        totalSize: stat._sum.fileSize || 0
      }
      return acc
    }, {} as Record<string, { count: number; totalSize: number }>)
  }

  return successResponse({
    data: uploads,
    meta: {
      total,
      page: filters.page,
      limit: filters.limit,
      pageCount: Math.ceil(total / filters.limit)
    },
    statistics
  })
}

const postHandler = async (
  req: NextRequest
) => {
  // Rate limiting
  const identifier = req.ip || 'anonymous'
  const { success } = await rateLimit.limit(identifier)
  
  if (!success) {
    return errorResponse('TOO_MANY_REQUESTS', 'Muitas requisições, tente novamente mais tarde')
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const type = formData.get('type') as string
  const metadata = formData.get('metadata') 
    ? JSON.parse(formData.get('metadata') as string)
    : {}

  if (!file) {
    return errorResponse('BAD_REQUEST', 'Arquivo é obrigatório')
  }

  // Validar arquivo
  if (type === 'image') {
    imageValidationSchema.parse({ file })
  } else {
    fileValidationSchema.parse({ file })
  }

  const upload = await processUpload(file, req.auth.id, metadata)

  // Registrar auditoria
  await createAuditLog({
    action: 'create',
    resource: 'upload',
    resourceId: upload.id,
    userId: req.auth.id,
    details: {
      fileName: upload.fileName,
      fileType: upload.fileType,
      fileSize: upload.fileSize
    }
  }).catch(console.error)

  return successResponse({
    message: 'Arquivo enviado com sucesso',
    data: upload
  })
}

const deleteHandler = async (
  req: NextRequest
) => {
  const { searchParams } = new URL(req.url)
  const uploadId = searchParams.get('uploadId')

  if (!uploadId) {
    return errorResponse('BAD_REQUEST', 'ID do upload é obrigatório')
  }

  const upload = await prisma.upload.findUnique({
    where: {
      id: uploadId,
      userId: req.auth.id
    }
  })

  if (!upload) {
    return errorResponse('NOT_FOUND', 'Upload não encontrado')
  }

  // Excluir arquivo físico
  try {
    await unlink(upload.path)
  } catch (error) {
    console.error('Error deleting file:', error)
  }

  // Excluir registro
  await prisma.upload.delete({
    where: {
      id: uploadId,
      userId: req.auth.id
    }
  })

  return successResponse({
    message: 'Upload excluído com sucesso'
  })
}

// Routes
export const GET = withErrorHandler(
  withAuth(getHandler)
)

export const POST = withErrorHandler(
  withAuth(postHandler)
)

export const DELETE = withErrorHandler(
  withAuth(deleteHandler)
)
