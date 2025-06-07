import { Redis } from '@upstash/redis'
import {
  cacheUploadUrl,
  getCachedUploadUrl,
  cacheUploadMetadata,
  getCachedUploadMetadata,
  invalidateUploadCache,
  incrementUploadStats,
  getUploadStats
} from '@/lib/cache'

// Mock do cliente Redis
jest.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: jest.fn(() => ({
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockImplementation((key: string) => {
        if (key.includes('url')) return 'https://test.com/test.jpg'
        if (key.includes('meta')) return JSON.stringify({
          id: 'test',
          url: 'https://test.com/test.jpg',
          fileName: 'test.jpg'
        })
        return null
      }),
      del: jest.fn().mockResolvedValue(1),
      hincrby: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(true),
      hgetall: jest.fn().mockResolvedValue({
        'count:image/jpeg': '10',
        'size:image/jpeg': '1000'
      })
    }))
  }
}))

describe('Cache', () => {
  const testUploadId = 'test-123'
  const testUrl = 'https://test.com/test.jpg'
  const testMetadata = {
    id: testUploadId,
    url: testUrl,
    fileName: 'test.jpg',
    fileType: 'image/jpeg',
    fileSize: 1000,
    userId: 'user-123',
    path: 'test/path',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('URL Cache', () => {
    it('should cache upload URL', async () => {
      await expect(cacheUploadUrl(testUploadId, testUrl)).resolves.not.toThrow()
    })

    it('should get cached upload URL', async () => {
      const url = await getCachedUploadUrl(testUploadId)
      expect(url).toBe(testUrl)
    })
  })

  describe('Metadata Cache', () => {
    it('should cache upload metadata', async () => {
      await expect(cacheUploadMetadata(testUploadId, testMetadata)).resolves.not.toThrow()
    })

    it('should get cached upload metadata', async () => {
      const metadata = await getCachedUploadMetadata(testUploadId)
      expect(metadata).toBeDefined()
      expect(metadata?.id).toBe('test')
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate upload cache', async () => {
      await expect(invalidateUploadCache(testUploadId)).resolves.not.toThrow()
    })
  })

  describe('Upload Stats', () => {
    it('should increment upload stats', async () => {
      await expect(incrementUploadStats('image/jpeg', 1000)).resolves.not.toThrow()
    })

    it('should get upload stats', async () => {
      const stats = await getUploadStats()
      expect(stats['image/jpeg']).toBeDefined()
      expect(stats['image/jpeg'].count).toBe(10)
      expect(stats['image/jpeg'].size).toBe(1000)
    })
  })
})
