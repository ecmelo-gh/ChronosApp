import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { POST as uploadLogo } from '@/app/api/establishment/[id]/logo/route'
import { POST as uploadCover } from '@/app/api/establishment/[id]/cover/route'
import { processUpload } from '@/lib/upload'
import { rateLimit } from '@/lib/rate-limit'
import { uploadToStorage } from '@/lib/storage'
import { cacheUploadUrl, cacheUploadMetadata } from '@/lib/cache'
import { FormData, File, Blob } from 'formdata-node'

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    establishment: {
      findFirst: jest.fn(),
      update: jest.fn()
    }
  }
}))

// Mock upload processing
jest.mock('@/lib/upload', () => ({
  processUpload: jest.fn().mockResolvedValue({
    id: 'upload-1',
    url: 'https://cdn.example.com/test-image.jpg',
    fileName: 'test-image.jpg',
    fileType: 'image/jpeg',
    fileSize: 1024,
    path: 'establishment_logo/test-image.jpg',
    metadata: {
      thumbnails: {
        small: 'https://cdn.example.com/test-image_small.webp',
        medium: 'https://cdn.example.com/test-image_medium.webp',
        large: 'https://cdn.example.com/test-image_large.webp'
      }
    }
  })
}))

// Mock rate limiting
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn().mockResolvedValue(true)
}))

// Mock storage
jest.mock('@/lib/storage', () => ({
  uploadToStorage: jest.fn().mockResolvedValue({
    url: 'https://cdn.example.com/test-image.jpg',
    path: 'establishment_logo/test-image.jpg',
    size: 1024,
    thumbnails: {
      small: 'https://cdn.example.com/test-image_small.webp',
      medium: 'https://cdn.example.com/test-image_medium.webp',
      large: 'https://cdn.example.com/test-image_large.webp'
    }
  })
}))

// Mock cache
jest.mock('@/lib/cache', () => ({
  cacheUploadUrl: jest.fn().mockResolvedValue(undefined),
  cacheUploadMetadata: jest.fn().mockResolvedValue(undefined),
  incrementUploadStats: jest.fn().mockResolvedValue(undefined)
}))

describe('Establishment Upload Routes', () => {
  const mockSession = {
    user: { id: 'user-1' }
  }

  const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.establishment.findFirst as jest.Mock).mockResolvedValue({
      id: '1',
      ownerId: 'user-1'
    })
  })

  describe('POST /api/establishment/[id]/logo', () => {
    it('should upload logo successfully', async () => {
      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/logo', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadLogo(request, {
        params: { id: '1' }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({
        success: true,
        data: {
          url: 'https://cdn.example.com/test-image.jpg',
          thumbnails: {
            small: 'https://cdn.example.com/test-image_small.webp',
            medium: 'https://cdn.example.com/test-image_medium.webp',
            large: 'https://cdn.example.com/test-image_large.webp'
          }
        }
      })

      // Verificar se o upload foi feito para o CDN
      expect(uploadToStorage).toHaveBeenCalledWith(
        expect.any(File),
        expect.any(String),
        expect.objectContaining({
          path: 'establishment_logo',
          generateThumbs: true,
          contentType: 'image/jpeg'
        })
      )

      // Verificar se o cache foi atualizado
      expect(cacheUploadUrl).toHaveBeenCalledWith(
        'upload-1',
        'https://cdn.example.com/test-image.jpg'
      )

      expect(cacheUploadMetadata).toHaveBeenCalledWith(
        'upload-1',
        expect.objectContaining({
          id: 'upload-1',
          url: 'https://cdn.example.com/test-image.jpg',
          metadata: expect.objectContaining({
            thumbnails: expect.any(Object)
          })
        })
      )
    })

    it('should return 401 if not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/logo', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadLogo(request, {
        params: { id: '1' }
      })

      expect(response.status).toBe(401)
    })

    it('should return 403 if not owner', async () => {
      ;(prisma.establishment.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        ownerId: 'other-user'
      })

      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/logo', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadLogo(request, {
        params: { id: '1' }
      })

      expect(response.status).toBe(403)
    })

    it('should return 404 for non-existent establishment', async () => {
      ;(prisma.establishment.findFirst as jest.Mock).mockResolvedValue(null)

      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/logo', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadLogo(request, {
        params: { id: '1' }
      })

      expect(response.status).toBe(404)
    })

    it('should validate file is present', async () => {
      const formData = new FormData()

      const request = new NextRequest('http://localhost/api/establishment/1/logo', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadLogo(request, {
        params: { id: '1' }
      })

      expect(response.status).toBe(400)
    })

    it('should handle rate limiting', async () => {
      ;(rateLimit as unknown as jest.Mock).mockResolvedValueOnce(false)

      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/logo', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadLogo(request, {
        params: { id: '1' }
      })

      expect(response.status).toBe(429)
    })

    it('should handle CDN upload errors', async () => {
      ;(uploadToStorage as jest.Mock).mockRejectedValueOnce(
        new Error('CDN upload failed')
      )

      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/logo', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadLogo(request, {
        params: { id: '1' }
      })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Error uploading file')
    })

    it('should handle cache errors gracefully', async () => {
      ;(cacheUploadUrl as jest.Mock).mockRejectedValueOnce(
        new Error('Cache error')
      )

      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/logo', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadLogo(request, {
        params: { id: '1' }
      })

      // Upload deve funcionar mesmo com erro de cache
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.url).toBe('https://cdn.example.com/test-image.jpg')
    })
  })

  describe('POST /api/establishment/[id]/cover', () => {
    it('should upload cover successfully', async () => {
      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/cover', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadCover(request, {
        params: { id: '1' }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({
        success: true,
        data: {
          url: 'https://cdn.example.com/test-image.jpg',
          thumbnails: {
            small: 'https://cdn.example.com/test-image_small.webp',
            medium: 'https://cdn.example.com/test-image_medium.webp',
            large: 'https://cdn.example.com/test-image_large.webp'
          }
        }
      })

      // Verificar se o upload foi feito para o CDN
      expect(uploadToStorage).toHaveBeenCalledWith(
        expect.any(File),
        expect.any(String),
        expect.objectContaining({
          path: 'establishment_cover',
          generateThumbs: true,
          contentType: 'image/jpeg'
        })
      )

      // Verificar se o cache foi atualizado
      expect(cacheUploadUrl).toHaveBeenCalledWith(
        'upload-1',
        'https://cdn.example.com/test-image.jpg'
      )

      expect(cacheUploadMetadata).toHaveBeenCalledWith(
        'upload-1',
        expect.objectContaining({
          id: 'upload-1',
          url: 'https://cdn.example.com/test-image.jpg',
          metadata: expect.objectContaining({
            thumbnails: expect.any(Object)
          })
        })
      )
    })

    it('should return 401 if not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/cover', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadCover(request, {
        params: { id: '1' }
      })

      expect(response.status).toBe(401)
    })

    it('should return 403 if not owner', async () => {
      ;(prisma.establishment.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        ownerId: 'other-user'
      })

      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/cover', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadCover(request, {
        params: { id: '1' }
      })

      expect(response.status).toBe(403)
    })

    it('should handle rate limiting', async () => {
      ;(rateLimit as unknown as jest.Mock).mockResolvedValueOnce(false)

      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/cover', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadCover(request, {
        params: { id: '1' }
      })

      expect(response.status).toBe(429)
    })

    it('should handle CDN upload errors', async () => {
      ;(uploadToStorage as jest.Mock).mockRejectedValueOnce(
        new Error('CDN upload failed')
      )

      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/cover', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadCover(request, {
        params: { id: '1' }
      })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Error uploading file')
    })

    it('should handle cache errors gracefully', async () => {
      ;(cacheUploadUrl as jest.Mock).mockRejectedValueOnce(
        new Error('Cache error')
      )

      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new NextRequest('http://localhost/api/establishment/1/cover', {
        method: 'POST',
        body: formData as unknown as BodyInit
      })

      const response = await uploadCover(request, {
        params: { id: '1' }
      })

      // Upload deve funcionar mesmo com erro de cache
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.url).toBe('https://cdn.example.com/test-image.jpg')
    })
  })
})
