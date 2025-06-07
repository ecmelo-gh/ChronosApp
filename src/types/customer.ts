export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
  OTHER = 'OTHER'
}

export enum LoyaltyProgramType {
  VISITS = 'VISITS',
  POINTS = 'POINTS',
  RECURRING = 'RECURRING'
}

export enum VisitStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum ReferralStatus {
  PENDING = 'PENDING',
  CONVERTED = 'CONVERTED',
  EXPIRED = 'EXPIRED'
}

export interface CustomerPreferences {
  favoriteServices?: string[]
  preferredDays?: string[]
  preferredTimes?: string[]
  notes?: string
  allergies?: string[]
  [key: string]: any // Permite campos adicionais
}

export interface Customer {
  id: string
  establishmentId: string
  
  // Dados básicos
  name: string
  email?: string | null
  birthDate?: Date | null
  gender?: Gender | null
  maritalStatus?: MaritalStatus | null
  document?: string | null
  phone1: string
  phone2?: string | null
  socialMedia?: string | null
  photo?: string | null
  preferences?: CustomerPreferences | null
  favoriteTeam?: string | null
  hasChildren: boolean
  isActive: boolean
  
  // Campos de sistema
  createdAt: Date
  updatedAt: Date
  lastVisit?: Date | null
  totalVisits: number
}

export interface Visit {
  id: string
  customerId: string
  date: Date
  services: Service[]
  totalAmount: number
  status: VisitStatus
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  visitId: string
  name: string
  price: number
  duration: number // em minutos
  professional?: string | null
  createdAt: Date
}

export interface CustomerLoyalty {
  id: string
  customerId: string
  type: LoyaltyProgramType
  currentValue: number
  targetValue: number
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED'
  reward?: string | null
  startDate: Date
  endDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Rating {
  id: string
  customerId: string
  score: number // 1-5
  message?: string | null
  source: string
  createdAt: Date
}

export interface Feedback {
  id: string
  customerId: string
  message: string
  source: string
  createdAt: Date
}

export interface Referral {
  id: string
  customerId: string
  referredName: string
  referredPhone: string
  status: ReferralStatus
  discountApplied?: number | null
  createdAt: Date
  updatedAt: Date
}

// DTOs para criação/atualização
export type CreateCustomerDTO = Omit<
  Customer,
  'id' | 'createdAt' | 'updatedAt' | 'lastVisit' | 'totalVisits'
>

export type UpdateCustomerDTO = Partial<CreateCustomerDTO>

export type CreateVisitDTO = Omit<
  Visit,
  'id' | 'createdAt' | 'updatedAt'
> & {
  services: Omit<Service, 'id' | 'visitId' | 'createdAt'>[]
}

export type CreateReferralDTO = Omit<
  Referral,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'discountApplied'
>
