import { z } from 'zod'
import { baseFiltersSchema, paginationSchema } from './shared/base.schema'

// Constantes
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

// Schema base do upload
const uploadBaseSchema = z.object({
  userId: z.string().uuid(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number().int().positive(),
  url: z.string().url(),
  path: z.string(),
  status: z.enum(['active', 'inactive']).default('active'),
  metadata: z.record(z.string(), z.any()).optional(),
})

// Schema para validação de arquivo
export const fileValidationSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= MAX_FILE_SIZE,
    'Arquivo deve ter no máximo 5MB'
  )
})

// Schema para validação de imagem
export const imageValidationSchema = fileValidationSchema.extend({
  file: z.instanceof(File).refine(
    (file) => file.size <= MAX_FILE_SIZE,
    'Arquivo deve ter no máximo 5MB'
  ).refine(
    (file) => ALLOWED_IMAGE_TYPES.includes(file.type as any),
    'Arquivo deve ser uma imagem (JPEG, PNG ou WebP)'
  )
})

// Schema para criação
export const createUploadSchema = uploadBaseSchema

// Schema para atualização
export const updateUploadSchema = uploadBaseSchema.partial()

// Schema para filtros de busca
export const uploadFiltersSchema = baseFiltersSchema.extend({
  userId: z.string().uuid().optional(),
  fileType: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

// Schema para listagem paginada
export const listUploadsSchema = paginationSchema.merge(uploadFiltersSchema)

// Tipos exportados
export type CreateUploadInput = z.infer<typeof createUploadSchema>
export type UpdateUploadInput = z.infer<typeof updateUploadSchema>
export type UploadFilters = z.infer<typeof uploadFiltersSchema>
export type ListUploadsInput = z.infer<typeof listUploadsSchema>
