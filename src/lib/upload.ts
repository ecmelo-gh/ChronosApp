import { writeFile, mkdir, readFile, unlink, stat } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from './prisma'
import type { Upload } from '@prisma/client'

// Configurações
export const UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  uploadDir: join(process.cwd(), 'public', 'uploads'),
  tempDir: join(process.cwd(), 'tmp', 'uploads'),
  chunkSize: 1024 * 1024 // 1MB por chunk
}

// Tipos
export type UploadMetadata = Record<string, any>

// Helpers
export const getUploadUrl = (fileName: string): string => {
  return `/uploads/${fileName}`
}

export const getUploadPath = (fileName: string): string => {
  return join(UPLOAD_CONFIG.uploadDir, fileName)
}

export const ensureUploadDirs = async (): Promise<void> => {
  await mkdir(UPLOAD_CONFIG.uploadDir, { recursive: true })
  await mkdir(UPLOAD_CONFIG.tempDir, { recursive: true })
}

export const validateFileType = (
  fileType: string,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(fileType)
}

export const generateUniqueFileName = (
  originalName: string
): string => {
  const ext = originalName.split('.').pop()
  return `${uuidv4()}.${ext}`
}

// Função principal de processamento
export const processUpload = async (
  file: File,
  userId: string,
  metadata: UploadMetadata = {}
): Promise<Upload> => {
  // Gerar nome único
  const fileName = generateUniqueFileName(file.name)
  const filePath = metadata.type ? `${metadata.type}/${fileName}` : fileName

  // Fazer upload para o Supabase Storage
  const { uploadToStorage } = await import('./storage')
  const { url, size, thumbnails } = await uploadToStorage(file, fileName, {
    path: metadata.type,
    generateThumbs: metadata.type?.includes('logo') || 
                   metadata.type?.includes('cover') || 
                   metadata.type?.includes('photo'),
    contentType: file.type
  })

  // Criar registro no banco
  const upload = await prisma.upload.create({
    data: {
      userId,
      fileName,
      fileType: file.type,
      fileSize: size,
      url,
      path: filePath,
      metadata: {
        originalName: file.name,
        lastModified: file.lastModified,
        thumbnails,
        ...metadata
      }
    }
  })

  // Cache de URL e metadados
  const { cacheUploadUrl, cacheUploadMetadata, incrementUploadStats } = await import('./cache')
  await Promise.all([
    cacheUploadUrl(upload.id, url),
    cacheUploadMetadata(upload.id, upload),
    incrementUploadStats(file.type, size)
  ])

  return upload
}

// Função para processamento em chunks (arquivos grandes)
export const processChunkedUpload = async (
  chunk: ArrayBuffer,
  fileName: string,
  offset: number
): Promise<void> => {
  const tempPath = join(UPLOAD_CONFIG.tempDir, fileName)
  const buffer = Buffer.from(chunk)
  
  // Append chunk ao arquivo temporário
  await writeFile(tempPath, buffer, {
    flag: offset === 0 ? 'w' : 'a'
  })
}

// Função para finalizar upload em chunks
export const finalizeChunkedUpload = async (
  fileName: string,
  userId: string,
  metadata: UploadMetadata = {}
): Promise<Upload> => {
  const tempPath = join(UPLOAD_CONFIG.tempDir, fileName)
  const finalFileName = generateUniqueFileName(fileName)
  const finalPath = getUploadPath(finalFileName)

  // Mover arquivo temporário para diretório final
  await writeFile(finalPath, await readFile(tempPath))
  await unlink(tempPath)

  // Obter informações do arquivo
  const stats = await stat(finalPath)
  const fileType = metadata.type || 'application/octet-stream'

  // Criar registro no banco
  const upload = await prisma.upload.create({
    data: {
      userId,
      fileName: finalFileName,
      fileType,
      fileSize: stats.size,
      url: getUploadUrl(finalFileName),
      path: finalPath,
      metadata: {
        originalName: fileName,
        ...metadata
      }
    }
  })

  return upload
}

// Função para excluir upload
export const deleteUpload = async (
  uploadId: string,
  userId: string
): Promise<void> => {
  const upload = await prisma.upload.findUnique({
    where: {
      id: uploadId,
      userId
    }
  })

  if (!upload) {
    throw new Error('Upload não encontrado')
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
      userId
    }
  })
}

// Função para obter estatísticas de upload
export const getUploadStats = async (
  userId: string
): Promise<{
  totalUploads: number
  totalSize: number
  byType: Record<string, { count: number; size: number }>
}> => {
  const stats = await prisma.upload.groupBy({
    by: ['fileType'],
    where: {
      userId,
      status: 'active'
    },
    _count: true,
    _sum: {
      fileSize: true
    }
  })

  const totalUploads = stats.reduce((acc, stat) => acc + stat._count, 0)
  const totalSize = stats.reduce((acc, stat) => acc + (stat._sum.fileSize || 0), 0)

  const byType = stats.reduce((acc, stat) => {
    acc[stat.fileType] = {
      count: stat._count,
      size: stat._sum.fileSize || 0
    }
    return acc
  }, {} as Record<string, { count: number; size: number }>)

  return {
    totalUploads,
    totalSize,
    byType
  }
}
