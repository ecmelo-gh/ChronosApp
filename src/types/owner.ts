import { PlanType, OwnerStatus } from '@prisma/client'

export interface CreateOwnerDTO {
  userId: string
  businessName: string
  document?: string
  phone?: string
  plan?: PlanType
}

export interface UpdateOwnerDTO {
  businessName?: string
  document?: string
  phone?: string
  plan?: PlanType
  status?: OwnerStatus
}

export interface OwnerResponse {
  id: string
  businessName: string
  document?: string
  phone?: string
  plan: PlanType
  status: OwnerStatus
  createdAt: Date
  updatedAt: Date
  establishments: {
    id: string
    name: string
    status: string
  }[]
}
