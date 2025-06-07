import { Redis } from '@upstash/redis'
import type { Upload } from '@prisma/client'

// Cliente Redis
const redis = Redis.fromEnv()

// Prefixos das chaves
const KEYS = {
  upload: 'upload:',
  uploadMeta: 'upload:meta:',
  uploadStats: 'upload:stats:'
}

// TTL padrão (1 dia)
const DEFAULT_TTL = 60 * 60 * 24

interface CacheOptions {
  ttl?: number
}

/**
 * Cache de URLs de upload
 */
export async function cacheUploadUrl(
  uploadId: string,
  url: string,
  options: CacheOptions = {}
): Promise<void> {
  await redis.set(
    KEYS.upload + uploadId,
    url,
    { ex: options.ttl || DEFAULT_TTL }
  )
}

/**
 * Obtém URL do cache
 */
export async function getCachedUploadUrl(
  uploadId: string
): Promise<string | null> {
  return redis.get<string>(KEYS.upload + uploadId)
}

/**
 * Cache de metadados do upload
 */
export async function cacheUploadMetadata(
  uploadId: string,
  metadata: Upload,
  options: CacheOptions = {}
): Promise<void> {
  await redis.set(
    KEYS.uploadMeta + uploadId,
    JSON.stringify(metadata),
    { ex: options.ttl || DEFAULT_TTL }
  )
}

/**
 * Obtém metadados do cache
 */
export async function getCachedUploadMetadata(
  uploadId: string
): Promise<Upload | null> {
  const data = await redis.get<string>(KEYS.uploadMeta + uploadId)
  return data ? JSON.parse(data) : null
}

/**
 * Invalida cache de um upload
 */
export async function invalidateUploadCache(
  uploadId: string
): Promise<void> {
  await Promise.all([
    redis.del(KEYS.upload + uploadId),
    redis.del(KEYS.uploadMeta + uploadId)
  ])
}

/**
 * Incrementa estatísticas de upload
 */
export async function incrementUploadStats(
  type: string,
  size: number
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const key = KEYS.uploadStats + today

  await redis.hincrby(key, `count:${type}`, 1)
  await redis.hincrby(key, `size:${type}`, size)
  
  // TTL de 90 dias para estatísticas
  await redis.expire(key, 60 * 60 * 24 * 90)
}

/**
 * Obtém estatísticas de upload do dia
 */
export async function getUploadStats(
  date: string = new Date().toISOString().split('T')[0]
): Promise<Record<string, { count: number; size: number }>> {
  const key = KEYS.uploadStats + date
  const data = await redis.hgetall<Record<string, string>>(key)

  if (!data) return {}

  const stats: Record<string, { count: number; size: number }> = {}
  
  for (const [field, value] of Object.entries(data)) {
    const [metric, type] = field.split(':')
    if (!stats[type]) stats[type] = { count: 0, size: 0 }
    stats[type][metric as 'count' | 'size'] = parseInt(value, 10)
  }

  return stats
}
