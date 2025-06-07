import { createClient } from '@supabase/supabase-js'
import { UPLOAD_CONFIG } from './upload'
import { optimizeImage, generateThumbnails } from './image'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!
const bucketName = 'uploads'

// Cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

export interface StorageUploadResult {
  url: string
  path: string
  size: number
  thumbnails?: Record<string, string>
}

/**
 * Faz upload de um arquivo para o Supabase Storage
 */
export async function uploadToStorage(
  file: File | Buffer,
  fileName: string,
  options: {
    path?: string
    generateThumbs?: boolean
    contentType?: string
  } = {}
): Promise<StorageUploadResult> {
  const { path = '', generateThumbs = false, contentType } = options

  // Converter File para Buffer se necessário
  const buffer = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer())
  let finalBuffer = buffer
  let thumbnails: Record<string, string> = {}

  // Se for imagem e precisar otimizar
  if ((file instanceof File && file.type.startsWith('image/')) || 
      (contentType && contentType.startsWith('image/'))) {
    try {
      const optimized = await optimizeImage(buffer)
      finalBuffer = optimized.buffer

      // Gerar miniaturas se solicitado
      if (generateThumbs) {
        const thumbs = await generateThumbnails(buffer, fileName)
        
        // Upload das miniaturas
        for (const [size, thumbPath] of Object.entries(thumbs)) {
          const thumbFileName = thumbPath.split('/').pop()!
          await supabase.storage
            .from(bucketName)
            .upload(`${path}/${thumbFileName}`, finalBuffer, {
              contentType: 'image/webp',
              cacheControl: '31536000' // 1 ano
            })
          
          thumbnails[size] = getPublicUrl(`${path}/${thumbFileName}`)
        }
      }
    } catch (error) {
      console.error('Error processing image:', error)
      finalBuffer = buffer
    }
  }

  // Upload do arquivo principal
  const { error: uploadError, data } = await supabase.storage
    .from(bucketName)
    .upload(`${path}/${fileName}`, finalBuffer, {
      contentType: contentType || (file instanceof File ? file.type : 'application/octet-stream'),
      cacheControl: '31536000' // 1 ano
    })

  if (uploadError) {
    throw new Error(`Error uploading to Supabase: ${uploadError.message}`)
  }

  return {
    url: getPublicUrl(`${path}/${fileName}`),
    path: data.path,
    size: finalBuffer.length,
    ...(Object.keys(thumbnails).length > 0 ? { thumbnails } : {})
  }
}

/**
 * Remove um arquivo do Supabase Storage
 */
export async function deleteFromStorage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([path])

  if (error) {
    throw new Error(`Error deleting from Supabase: ${error.message}`)
  }
}

/**
 * Obtém a URL pública de um arquivo
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Verifica se um arquivo existe no storage
 */
export async function fileExists(path: string): Promise<boolean> {
  const { data } = await supabase.storage
    .from(bucketName)
    .list(path.split('/').slice(0, -1).join('/'), {
      search: path.split('/').pop()
    })

  return (data || []).length > 0
}

/**
 * Move um arquivo no storage
 */
export async function moveFile(from: string, to: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucketName)
    .move(from, to)

  if (error) {
    throw new Error(`Error moving file in Supabase: ${error.message}`)
  }
}
