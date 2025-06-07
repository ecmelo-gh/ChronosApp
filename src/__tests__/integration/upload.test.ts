import { NextRequest } from 'next/server'
import { FormData } from 'formdata-node'
import { createClient } from '@supabase/supabase-js'
import { Redis } from '@upstash/redis'
import { processUpload } from '@/lib/upload'
import { uploadToStorage } from '@/lib/storage'
import { cacheUploadUrl, cacheUploadMetadata } from '@/lib/cache'
import { UploadResult } from '@/types/upload'

// Criar um mock de File para testes
class TestFile implements File {
  name: string
  lastModified: number
  size: number
  type: string
  webkitRelativePath: string = ''

  constructor(
    private content: string[],
    name: string,
    options: { type: string }
  ) {
    this.name = name
    this.type = options.type
    this.size = content.join('').length
    this.lastModified = Date.now()
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return new TextEncoder().encode(this.content.join('')).buffer
  }

  async text(): Promise<string> {
    return this.content.join('')
  }

  stream(): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder()
    const content = this.content.join('')
    const bytes = encoder.encode(content)
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes)
        controller.close()
      },
      cancel() {}
    })
  }

  slice(start?: number, end?: number, contentType?: string): Blob {
    const slicedContent = this.content.join('').slice(start, end)
    return new Blob([slicedContent], { type: contentType || this.type })
  }

  async bytes(): Promise<Uint8Array> {
    return new TextEncoder().encode(this.content.join(''))
  }
}

// Configurar clientes reais para teste de integração
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const redisClient = Redis.fromEnv()

describe('Upload Integration Tests', function(): void {
  const testFile = new TestFile(['test image content'], 'test.jpg', {
    type: 'image/jpeg'
  })

  const testUserId = 'test-user'
  const testEstablishmentId = 'test-establishment'

  // Limpar dados de teste após cada teste
  afterEach(async () => {
    // Limpar arquivos do Supabase Storage
    const { data: files } = await supabaseClient.storage
      .from('uploads')
      .list('test/')
    
    if (files?.length) {
      await supabaseClient.storage
        .from('uploads')
        .remove(files.map(f => `test/${f.name}`))
    }

    // Limpar cache do Redis
    await redisClient.del('upload:url:*')
    await redisClient.del('upload:metadata:*')
  })

  it('should process upload with CDN and cache', async () => {
    // Processar upload
    const result = await processUpload(testFile, testUserId, {
      type: 'establishment_logo',
      establishmentId: testEstablishmentId,
      directory: 'test'
    })

    // Verificar resultado
    expect(result).toBeDefined()
    expect(result.url).toContain('https://')
    expect(result.metadata?.thumbnails).toBeDefined()
    
    // Verificar arquivo no Storage
    const { data: exists } = await supabaseClient.storage
      .from('uploads')
      .list('test/', {
        search: result.fileName
      })
    
    expect(exists?.length).toBe(1)
    
    // Verificar cache
    const cachedUrl = await redisClient.get(`upload:url:${result.id}`)
    expect(cachedUrl).toBe(result.url)
    
    const cachedMetadata = await redisClient.get(`upload:metadata:${result.id}`)
    expect(cachedMetadata).toBeDefined()
    expect(JSON.parse(cachedMetadata as string)).toMatchObject({
      id: result.id,
      url: result.url,
      metadata: {
        thumbnails: expect.any(Object)
      }
    })
  })

  it('should handle CDN failure gracefully', async () => {
    // Forçar erro no Supabase alterando a chave
    const originalKey = process.env.SUPABASE_SERVICE_KEY
    process.env.SUPABASE_SERVICE_KEY = 'invalid-key'

    try {
      await processUpload(testFile, testUserId, {
        type: 'establishment_logo',
        establishmentId: testEstablishmentId
      })
      fail('Should have thrown an error')
    } catch (error) {
      expect(error).toBeDefined()
    } finally {
      process.env.SUPABASE_SERVICE_KEY = originalKey
    }
  })

  it('should handle cache failure gracefully', async () => {
    // Forçar erro no Redis alterando a URL
    const originalUrl = process.env.UPSTASH_REDIS_URL
    process.env.UPSTASH_REDIS_URL = 'invalid-url'

    try {
      const result = await processUpload(testFile, testUserId, {
        type: 'establishment_logo',
        establishmentId: testEstablishmentId,
        directory: 'test'
      })

      // Upload deve funcionar mesmo sem cache
      expect(result).toBeDefined()
      expect(result.url).toContain('https://')
    } finally {
      process.env.UPSTASH_REDIS_URL = originalUrl
    }
  })

  it('should process multiple uploads concurrently', async () => {
    const files = Array(3).fill(null).map((_, i) => 
      new TestFile(['test content'], `test${i}.jpg`, { type: 'image/jpeg' })
    )

    const results = await Promise.all(
      files.map(file => 
        processUpload(file, testUserId, {
          type: 'establishment_logo',
          establishmentId: testEstablishmentId,
          directory: 'test'
        })
      )
    )

    expect(results).toHaveLength(3)
    results.forEach(result => {
      expect(result.url).toContain('https://')
      expect(result.metadata?.thumbnails).toBeDefined()
    })

    // Verificar se todos os arquivos estão no Storage
    const { data: storedFiles } = await supabaseClient.storage
      .from('uploads')
      .list('test/')
    
    expect(storedFiles?.length).toBe(3)

    // Verificar se todos estão no cache
    const cachedUrls = await Promise.all(
      results.map(r => redisClient.get(`upload:url:${r.id}`))
    )
    expect(cachedUrls.every(Boolean)).toBe(true)
  })
})
