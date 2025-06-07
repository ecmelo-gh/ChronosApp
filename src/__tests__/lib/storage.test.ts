import { uploadToStorage, deleteFromStorage, fileExists, moveFile } from '@/lib/storage'
import { createClient } from '@supabase/supabase-js'

// Mock do cliente Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test/path' } }),
        remove: jest.fn().mockResolvedValue({}),
        list: jest.fn().mockResolvedValue({ data: [{ name: 'test.jpg' }] }),
        move: jest.fn().mockResolvedValue({}),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://test.com/test.jpg' } }))
      }))
    }
  }))
}))

describe('Storage', () => {
  let testFile: File
  let testBuffer: Buffer

  beforeAll(() => {
    // Criar arquivo de teste
    testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    testBuffer = Buffer.from('test')
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('uploadToStorage', () => {
    it('should upload File object', async () => {
      const result = await uploadToStorage(testFile, 'test.jpg')

      expect(result.url).toBe('https://test.com/test.jpg')
      expect(result.path).toBe('test/path')
      expect(result.size).toBeGreaterThan(0)
    })

    it('should upload Buffer', async () => {
      const result = await uploadToStorage(testBuffer, 'test.jpg', {
        contentType: 'image/jpeg'
      })

      expect(result.url).toBe('https://test.com/test.jpg')
      expect(result.path).toBe('test/path')
      expect(result.size).toBe(testBuffer.length)
    })

    it('should generate thumbnails for images when requested', async () => {
      const result = await uploadToStorage(testFile, 'test.jpg', {
        generateThumbs: true
      })

      expect(result.thumbnails).toBeDefined()
      expect(Object.keys(result.thumbnails!)).toContain('small')
      expect(Object.keys(result.thumbnails!)).toContain('medium')
      expect(Object.keys(result.thumbnails!)).toContain('large')
    })
  })

  describe('deleteFromStorage', () => {
    it('should delete file', async () => {
      await expect(deleteFromStorage('test.jpg')).resolves.not.toThrow()
    })
  })

  describe('fileExists', () => {
    it('should check if file exists', async () => {
      const exists = await fileExists('test.jpg')
      expect(exists).toBe(true)
    })
  })

  describe('moveFile', () => {
    it('should move file', async () => {
      await expect(moveFile('old.jpg', 'new.jpg')).resolves.not.toThrow()
    })
  })
})
