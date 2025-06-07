import { PrismaClient } from '@prisma/client'

// Declare types for better autocomplete and type safety
declare global {
  var prisma: PrismaClient | undefined
}

// Create a singleton instance
export const db = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db
}

// Type-safe database actions
export const dbActions = {
  users: {
    findByEmail: (email: string) => 
      db.users.findUnique({ where: { email } }),

    updatePassword: (email: string, password: string) =>
      db.users.update({ 
        where: { email },
        data: { password }
      }),
  },
  customers: {
    create: (data: {
      full_name: string
      email?: string | null
      phone?: string | null
      cpf?: string | null
      birthDate?: Date | null
      userId: string
    }) =>
      db.customers.create({
        data: {
          id: crypto.randomUUID(),
          ...data,
          status: 'active',
          updated_at: new Date(),
        },
      }),

    update: (id: string, data: {
      full_name?: string
      email?: string | null
      phone?: string | null
      cpf?: string | null
      birthDate?: Date | null
      status?: string
    }) =>
      db.customers.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date(),
        },
      }),

    findById: (id: string) =>
      db.customers.findUnique({ where: { id } }),

    findByUserId: (userId: string, options?: {
      skip?: number
      take?: number
      orderBy?: { [key: string]: 'asc' | 'desc' }
      where?: {
        status?: string
        full_name?: { contains: string }
        email?: { contains: string }
        phone?: { contains: string }
      }
    }) =>
      db.customers.findMany({
        where: { userId, ...options?.where },
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy,
      }),

    count: (userId: string, where?: {
      status?: string
      full_name?: { contains: string }
      email?: { contains: string }
      phone?: { contains: string }
    }) =>
      db.customers.count({ where: { userId, ...where } }),
  },
  services: {
    findById: (id: string) =>
      db.services.findUnique({ where: { id } }),
  },

  professionals: {
    findById: (id: string) =>
      db.professionals.findUnique({ where: { id } }),
  },

  establishments: {
    findById: (id: string) =>
      db.establishments.findUnique({ where: { id } }),
  },

  jobs: {
    create: (data: {
      type: string,
      data: any,
      runAt: Date,
      userId: string
    }) => db.jobs.create({ data: {
      id: crypto.randomUUID(),
      ...data,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    }}),
  },

  passwordResetTokens: {
    create: (data: { email: string, token: string, expires: Date }) =>
      db.password_reset_tokens.create({ data }),
    findValid: (token: string) =>
      db.password_reset_tokens.findFirst({
        where: {
          token,
          expires: { gt: new Date() },
          used: false,
        }
      }),
    markAsUsed: (id: string) =>
      db.password_reset_tokens.update({
        where: { id },
        data: { used: true }
      })
  },

  appointments: {
    create: (data: {
      userId: string
      customerId: string
      serviceId: string
      establishmentId: string
      professionalId: string
      date: Date
      notes?: string
    }) => db.appointments.create({
      data: {
        id: crypto.randomUUID(),
        ...data,
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        customers: true,
        services: true,
        establishments: true,
      },
    }),

    findById: (id: string) =>
      db.appointments.findUnique({
        where: { id },
        include: {
          customers: true,
          services: true,
          establishments: true,
        },
      }),

    findByEstablishment: (establishmentId: string, options?: {
      status?: string
      startDate?: Date
      endDate?: Date
      customerId?: string
      serviceId?: string
      skip?: number
      take?: number
    }) => db.appointments.findMany({
      where: {
        establishmentId,
        ...(options?.status && { status: options.status }),
        ...(options?.startDate && {
          date: { gte: options.startDate },
        }),
        ...(options?.endDate && {
          date: { 
            ...(options?.startDate && { gte: options.startDate }),
            lte: options.endDate,
          },
        }),
        ...(options?.customerId && { customerId: options.customerId }),
        ...(options?.serviceId && { serviceId: options.serviceId }),
      },
      include: {
        customers: true,
        services: true,
        establishments: true,
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: { date: 'asc' },
    }),

    count: (establishmentId: string, where?: {
      status?: string
      startDate?: Date
      endDate?: Date
      customerId?: string
      serviceId?: string
    }) => db.appointments.count({
      where: {
        establishmentId,
        ...(where?.status && { status: where.status }),
        ...(where?.startDate && {
          date: { gte: where.startDate },
        }),
        ...(where?.endDate && {
          date: { 
            ...(where?.startDate && { gte: where.startDate }),
            lte: where.endDate,
          },
        }),
        ...(where?.customerId && { customerId: where.customerId }),
        ...(where?.serviceId && { serviceId: where.serviceId }),
      },
    }),

    update: (id: string, data: {
      date?: Date
      professionalId?: string
      status?: string
      notes?: string
    }) => db.appointments.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: {
        customers: true,
        services: true,
        establishments: true,
      },
    }),
  },

  customerCommunications: {
    create: (data: {
      customerId: string
      userId: string
      type: string
      template: string
      metadata?: any
      sent_at: Date
    }) => db.customer_communications.create({
      data: {
        id: crypto.randomUUID(),
        ...data,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      }
    }),

    findByCustomerId: (customerId: string) =>
      db.customer_communications.findMany({
        where: { customerId },
        orderBy: { created_at: 'desc' }
      })
  },

  customerPreferences: {
    create: (data: {
      customerId: string
      whatsapp_opt_in?: boolean
      email_opt_in?: boolean
    }) => db.customer_preferences.create({
      data: {
        id: crypto.randomUUID(),
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),

    findByCustomerId: (customerId: string) =>
      db.customer_preferences.findUnique({
        where: { customerId }
      }),

    update: (customerId: string, data: {
      whatsapp_opt_in?: boolean
      email_opt_in?: boolean
    }) => db.customer_preferences.update({
      where: { customerId },
      data: {
        ...data,
        updated_at: new Date()
      }
    })
  }
}
