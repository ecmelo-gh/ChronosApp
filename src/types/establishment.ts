type EstablishmentStatus = 'active' | 'inactive' | 'pending'

export interface CreateEstablishmentDTO {
  name: string
  description?: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email?: string
  website?: string
  logoUrl?: string
  coverUrl?: string
  businessHours?: Record<string, any>
  features?: string[]
}

export interface UpdateEstablishmentDTO {
  name?: string
  description?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  phone?: string
  email?: string
  website?: string
  logoUrl?: string
  coverUrl?: string
  businessHours?: Record<string, any>
  features?: string[]
  status?: EstablishmentStatus
}

export interface EstablishmentResponse {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email?: string
  website?: string
  logoUrl?: string
  coverUrl?: string
  businessHours?: Record<string, any>
  features: string[]
  status: EstablishmentStatus
  created_at: Date
  updated_at: Date
  owner: {
    id: string
    businessName: string
  }
}
