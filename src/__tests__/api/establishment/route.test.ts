import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { GET, POST, PATCH } from '@/app/api/establishment/route'
import { DELETE } from '@/app/api/establishment/[id]/route'

import { Prisma } from '@prisma/client'

type EstablishmentStatus = 'ACTIVE' | 'INACTIVE'

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: {
      id: 'user-1',
      email: 'test@example.com'
    }
  })
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    establishment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    owner: {
      findFirst: jest.fn()
    }
  }
}))

describe('Establishment API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/establishment', () => {
    it('should return establishments for authenticated user', async () => {
      const mockEstablishments = [
        {
          id: '1',
          name: 'Test Establishment',
          status: 'ACTIVE' as EstablishmentStatus
        }
      ]
      ;(prisma.establishment.findMany as jest.Mock).mockResolvedValue(mockEstablishments)

      const response = await GET(new Request('http://localhost/api/establishment'))
      const data = await (response as NextResponse).json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockEstablishments)
      expect(prisma.establishment.findMany).toHaveBeenCalledWith({
        where: {
          owner: {
            user: {
              email: 'test@example.com'
            }
          }
        },
        include: {
          owner: {
            include: {
              user: true
            }
          }
        }
      })
    })

    it('should return 401 for unauthenticated user', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

      const response = await GET(new Request('http://localhost/api/establishment'))
      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/establishment', () => {
    const mockOwner = {
      id: 'owner-1',
      userId: 'user-1'
    }

    const mockCreateData = {
      name: 'New Establishment',
      address: '123 Test St',
      phone: '1234567890'
    }

    beforeEach(() => {
      ;(prisma.owner.findFirst as jest.Mock).mockResolvedValue(mockOwner)
    })

    it('should create establishment for authenticated user', async () => {
      const mockCreatedEstablishment = {
        id: '1',
        ...mockCreateData,
        status: 'ACTIVE' as EstablishmentStatus
      }
      ;(prisma.establishment.create as jest.Mock).mockResolvedValue(mockCreatedEstablishment)

      const response = await POST(new Request('http://localhost/api/establishment', { method: 'POST', body: JSON.stringify(mockCreateData) }))
      const data = await (response as NextResponse).json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCreatedEstablishment)
      expect(prisma.establishment.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateData,
          owner: { connect: { id: mockOwner.id } },
          status: 'ACTIVE'
        }
      })
    })

    it('should return 401 for unauthenticated user', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

      const response = await POST(new Request('http://localhost/api/establishment', { method: 'POST', body: JSON.stringify(mockCreateData) }))
      expect(response.status).toBe(401)
    })

    it('should validate required fields', async () => {
      const response = await POST(new Request('http://localhost/api/establishment', { 
        method: 'POST', 
        body: JSON.stringify({ name: 'Test' }) // Missing required fields
      }))
      expect(response.status).toBe(400)
    })
  })

  describe('PATCH /api/establishment/[id]', () => {
    const mockEstablishment = {
      id: '1',
      name: 'Test Establishment',
      status: 'ACTIVE' as EstablishmentStatus
    }

    const mockUpdateData = {
      name: 'Updated Establishment'
    }

    beforeEach(() => {
      ;(prisma.establishment.findFirst as jest.Mock).mockResolvedValue(mockEstablishment)
    })

    it('should update establishment for authenticated owner', async () => {
      const mockUpdatedEstablishment = {
        ...mockEstablishment,
        ...mockUpdateData
      }
      ;(prisma.establishment.update as jest.Mock).mockResolvedValue(mockUpdatedEstablishment)

      const response = await PATCH(new Request('http://localhost/api/establishment/1', { method: 'PATCH', body: JSON.stringify(mockUpdateData) }), { params: { id: '1' } })
      const data = await (response as NextResponse).json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockUpdatedEstablishment)
      expect(prisma.establishment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: mockUpdateData
      })
    })

    it('should return 404 for non-existent establishment', async () => {
      ;(prisma.establishment.findFirst as jest.Mock).mockResolvedValue(null)

      const response = await PATCH(new Request('http://localhost/api/establishment/999', { 
        method: 'PATCH', 
        body: JSON.stringify(mockUpdateData)
      }), { params: { id: '999' } })
      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/establishment/[id]', () => {
    const mockEstablishment = {
      id: '1',
      name: 'Test Establishment',
      status: 'ACTIVE' as EstablishmentStatus,
      services: [],
      appointments: []
    }

    beforeEach(() => {
      ;(prisma.establishment.findFirst as jest.Mock).mockResolvedValue(mockEstablishment)
    })

    it('should delete establishment without services/appointments', async () => {
      ;(prisma.establishment.delete as jest.Mock).mockResolvedValue(mockEstablishment)

      const response = await DELETE(new Request('http://localhost/api/establishment/1', { method: 'DELETE' }), { params: { id: '1' } })
      const data = await (response as NextResponse).json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
      expect(prisma.establishment.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      })
    })

    it('should inactivate establishment with services/appointments', async () => {
      const establishmentWithServices = {
        ...mockEstablishment,
        services: [{ id: 'service-1' }]
      }
      ;(prisma.establishment.findFirst as jest.Mock).mockResolvedValue(establishmentWithServices)
      ;(prisma.establishment.update as jest.Mock).mockResolvedValue({
        ...establishmentWithServices,
        status: 'INACTIVE'
      })

      const response = await DELETE(new Request('http://localhost/api/establishment/1', { method: 'DELETE' }), { params: { id: '1' } })
      const data = await (response as NextResponse).json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('INACTIVE')
      expect(prisma.establishment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'INACTIVE' }
      })
    })

    it('should return 404 for non-existent establishment', async () => {
      ;(prisma.establishment.findFirst as jest.Mock).mockResolvedValue(null)

      const response = await DELETE(new Request('http://localhost/api/establishment/999', { 
        method: 'DELETE'
      }), { params: { id: '999' } })
      expect(response.status).toBe(404)
    })
  })
})
