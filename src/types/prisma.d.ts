import { Prisma } from '@prisma/client'

// Re-export dos tipos do Prisma para uso em toda a aplicação
export type {
  User,
  Account,
  Session,
  VerificationToken,
  Customer,
  Service,
  Appointment,
  CustomerFeedback,
  CustomerLoyalty,
  CustomerLoyaltyReward,
  CustomerReferral,
  Upload,
  Establishment,
} from '@prisma/client'

// Tipos de input do Prisma
export type UserCreateInput = Prisma.UserCreateInput
export type CustomerCreateInput = Prisma.CustomerCreateInput
export type ServiceCreateInput = Prisma.ServiceCreateInput
export type AppointmentCreateInput = Prisma.AppointmentCreateInput
export type EstablishmentCreateInput = Prisma.EstablishmentCreateInput

// Tipos de update do Prisma
export type UserUpdateInput = Prisma.UserUpdateInput
export type CustomerUpdateInput = Prisma.CustomerUpdateInput
export type ServiceUpdateInput = Prisma.ServiceUpdateInput
export type AppointmentUpdateInput = Prisma.AppointmentUpdateInput
export type EstablishmentUpdateInput = Prisma.EstablishmentUpdateInput

// Tipos de where do Prisma
export type UserWhereInput = Prisma.UserWhereInput
export type CustomerWhereInput = Prisma.CustomerWhereInput
export type ServiceWhereInput = Prisma.ServiceWhereInput
export type AppointmentWhereInput = Prisma.AppointmentWhereInput
export type EstablishmentWhereInput = Prisma.EstablishmentWhereInput
