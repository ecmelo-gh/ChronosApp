import sharp from 'sharp'
import { join } from 'path'
import { UPLOAD_CONFIG } from './upload'

export interface ImageProcessingOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export interface ProcessedImage {
  buffer: Buffer
  info: sharp.OutputInfo
  format: string
}

export interface ThumbnailSizes {
  small: { width: number; height: number }
  medium: { width: number; height: number }
  large: { width: number; height: number }
}

export const THUMBNAIL_SIZES: ThumbnailSizes = {
  small: { width: 150, height: 150 },
  medium: { width: 300, height: 300 },
  large: { width: 600, height: 600 }
}

export const DEFAULT_OPTIONS: ImageProcessingOptions = {
  quality: 80,
  format: 'webp',
  fit: 'cover'
}

export async function processImage(
  input: Buffer,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const { width, height, quality, format, fit } = { ...DEFAULT_OPTIONS, ...options }

  let processor = sharp(input)

  // Redimensionar se necessário
  if (width || height) {
    processor = processor.resize(width, height, { fit })
  }

  // Converter formato se especificado
  if (format) {
    processor = processor[format]({ quality })
  }

  const { data, info } = await processor.toBuffer({ resolveWithObject: true })

  return {
    buffer: data,
    info,
    format: format || info.format
  }
}

export async function generateThumbnails(
  input: Buffer,
  fileName: string,
  options: Partial<ImageProcessingOptions> = {}
): Promise<Record<keyof ThumbnailSizes, string>> {
  const thumbnails: Partial<Record<keyof ThumbnailSizes, string>> = {}
  const baseFileName = fileName.split('.')[0]

  for (const [size, dimensions] of Object.entries(THUMBNAIL_SIZES)) {
    const processed = await processImage(input, {
      ...DEFAULT_OPTIONS,
      ...options,
      ...dimensions
    })

    const thumbnailFileName = `${baseFileName}_${size}.${processed.format}`
    const thumbnailPath = join(UPLOAD_CONFIG.uploadDir, thumbnailFileName)

    await sharp(processed.buffer).toFile(thumbnailPath)

    thumbnails[size as keyof ThumbnailSizes] = `/uploads/${thumbnailFileName}`
  }

  return thumbnails as Record<keyof ThumbnailSizes, string>
}

export async function optimizeImage(
  input: Buffer,
  options: Partial<ImageProcessingOptions> = {}
): Promise<ProcessedImage> {
  // Detectar formato original
  const metadata = await sharp(input).metadata()
  const originalFormat = metadata.format

  // Definir formato de saída otimizado
  let format = options.format || originalFormat
  if (!['jpeg', 'png', 'webp'].includes(format!)) {
    format = 'webp' // Fallback para webp se formato não suportado
  }

  // Processar imagem com configurações otimizadas
  return processImage(input, {
    format: format as 'jpeg' | 'png' | 'webp',
    quality: options.quality || 80,
    width: options.width || metadata.width,
    height: options.height || metadata.height,
    fit: options.fit || 'cover'
  })
}
