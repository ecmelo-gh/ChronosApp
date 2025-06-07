import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Schemas de Validação
const availabilityQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial inválida'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inicial inválida').optional().default('09:00'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora final inválida').optional().default('18:00'),
  interval: z.number().int().min(15).max(60).optional().default(30) // intervalo em minutos
})

// 2. Tipagem de Input
type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>
type RouteParams = { params: { id: string } }
type TimeSlot = {
  start: string
  end: string
  available: boolean
  conflictingAppointment?: {
    id: string
    customerName: string
    serviceName: string
  }
}

// 3. Query Builders Tipados
const buildAppointmentsWhere = (
  userId: string,
  serviceId: string,
  startDate: Date,
  endDate: Date
): Prisma.AppointmentWhereInput => ({
  userId,
  serviceId,
  date: {
    gte: startDate,
    lte: endDate
  },
  status: {
    not: 'cancelled'
  }
})

// 4. Error Handling
class ServiceAvailabilityError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 5. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new ServiceAvailabilityError('Unauthorized', 401)
  }
  return session.user.id
}

// 6. Helpers
const generateTimeSlots = (
  date: string,
  startTime: string,
  endTime: string,
  interval: number,
  serviceDuration: number
): string[] => {
  const slots: string[] = []
  const start = new Date(`${date}T${startTime}:00`)
  const end = new Date(`${date}T${endTime}:00`)
  
  let current = start
  while (current.getTime() + serviceDuration * 60000 <= end.getTime()) {
    slots.push(current.toISOString())
    current = new Date(current.getTime() + interval * 60000)
  }
  
  return slots
}

const checkSlotAvailability = (
  slot: string,
  appointments: any[],
  serviceDuration: number
): { available: boolean; conflict?: any } => {
  const slotStart = new Date(slot)
  const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)

  for (const appointment of appointments) {
    const appointmentStart = new Date(appointment.date)
    const appointmentEnd = new Date(
      appointmentStart.getTime() + appointment.service.duration * 60000
    )

    // Verifica se há sobreposição
    if (
      (slotStart < appointmentEnd && slotEnd > appointmentStart) ||
      (appointmentStart < slotEnd && appointmentEnd > slotStart)
    ) {
      return {
        available: false,
        conflict: appointment
      }
    }
  }

  return { available: true }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    // Verificar se o serviço existe e está ativo
    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId,
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        duration: true
      }
    })

    if (!service) {
      throw new ServiceAvailabilityError('Serviço não encontrado ou inativo', 404)
    }

    const { searchParams } = new URL(request.url)
    const query = availabilityQuerySchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      startTime: searchParams.get('startTime') || undefined,
      endTime: searchParams.get('endTime') || undefined,
      interval: Number(searchParams.get('interval')) || undefined
    })

    // Validar período
    const startDate = new Date(`${query.startDate}T00:00:00`)
    const endDate = new Date(`${query.endDate}T23:59:59`)

    if (startDate > endDate) {
      throw new ServiceAvailabilityError('Data inicial deve ser anterior à data final')
    }

    if (startDate < new Date()) {
      throw new ServiceAvailabilityError('Data inicial deve ser futura')
    }

    const maxDays = 30 // Limite de 30 dias para consulta
    if ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) > maxDays) {
      throw new ServiceAvailabilityError(`Período máximo de consulta é de ${maxDays} dias`)
    }

    // Buscar agendamentos existentes no período
    const appointments = await prisma.appointment.findMany({
      where: buildAppointmentsWhere(userId, params.id, startDate, endDate),
      select: {
        id: true,
        date: true,
        customer: {
          select: {
            full_name: true
          }
        },
        service: {
          select: {
            name: true,
            duration: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Gerar slots de horário e verificar disponibilidade
    const availability: { [date: string]: TimeSlot[] } = {}
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const slots = generateTimeSlots(
        dateStr,
        query.startTime,
        query.endTime,
        query.interval,
        service.duration
      )

      availability[dateStr] = slots.map(slot => {
        const { available, conflict } = checkSlotAvailability(
          slot,
          appointments,
          service.duration
        )

        return {
          start: new Date(slot).toISOString(),
          end: new Date(new Date(slot).getTime() + service.duration * 60000).toISOString(),
          available,
          ...(conflict && {
            conflictingAppointment: {
              id: conflict.id,
              customerName: conflict.customer.full_name,
              serviceName: conflict.service.name
            }
          })
        }
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      data: {
        service: {
          id: service.id,
          name: service.name,
          duration: service.duration
        },
        query: {
          ...query,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        availability
      }
    })
  } catch (error) {
    if (error instanceof ServiceAvailabilityError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error checking service availability:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
