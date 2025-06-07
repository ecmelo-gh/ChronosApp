import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Tipagem de Input
type RouteParams = { params: { id: string } }

// 2. Types para o Response
type ServiceSummary = {
  id: string
  name: string
  price: number
  duration: number
  description: string | null
  totalAppointments: number
  totalSpent: number
  lastDate: Date | null
  appointments: Array<{
    id: string
    date: Date
    status: string
  }>
}

// 3. Query Builders Tipados
const buildAppointmentsSelect = (): Prisma.AppointmentSelect => ({
  id: true,
  date: true,
  status: true,
  service: {
    select: {
      id: true,
      name: true,
      price: true,
      duration: true,
      description: true
    }
  }
})

// 4. Service Aggregation
const aggregateServiceData = (appointments: Array<{
  id: string
  date: Date
  status: string
  service: {
    id: string
    name: string
    price: number
    duration: number
    description: string | null
  }
}>): ServiceSummary[] => {
  const servicesMap = appointments.reduce((acc, appointment) => {
    const serviceId = appointment.service.id
    if (!acc[serviceId]) {
      acc[serviceId] = {
        id: appointment.service.id,
        name: appointment.service.name,
        price: appointment.service.price,
        duration: appointment.service.duration,
        description: appointment.service.description,
        totalAppointments: 0,
        totalSpent: 0,
        lastDate: null,
        appointments: []
      }
    }
    
    acc[serviceId].totalAppointments++
    acc[serviceId].totalSpent += appointment.service.price
    
    const appointmentDate = new Date(appointment.date)
    if (!acc[serviceId].lastDate || appointmentDate > acc[serviceId].lastDate) {
      acc[serviceId].lastDate = appointmentDate
    }

    // Guardar os últimos 5 agendamentos
    if (acc[serviceId].appointments.length < 5) {
      acc[serviceId].appointments.push({
        id: appointment.id,
        date: appointment.date,
        status: appointment.status
      })
    }
    
    return acc
  }, {} as Record<string, ServiceSummary>)

  return Object.values(servicesMap)
    .sort((a, b) => {
      if (!a.lastDate) return 1
      if (!b.lastDate) return -1
      return b.lastDate.getTime() - a.lastDate.getTime()
    })
}

// 5. Error Handling
class CustomerServicesError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// 6. Auth Helper
const validateSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new CustomerServicesError('Unauthorized', 401)
  }
  return session.user.id
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await validateSession()

    const appointments = await prisma.appointment.findMany({
      where: {
        customerId: params.id,
        userId
      },
      select: buildAppointmentsSelect(),
      orderBy: {
        date: 'desc'
      }
    })

    if (!appointments.length) {
      return NextResponse.json({
        data: [],
        meta: { total: 0 }
      })
    }

    const services = aggregateServiceData(appointments)

    return NextResponse.json({
      data: services,
      meta: {
        total: services.length
      }
    })
  } catch (error) {
    if (error instanceof CustomerServicesError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Cliente não encontrado' },
          { status: 404 }
        )
      }
    }
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
