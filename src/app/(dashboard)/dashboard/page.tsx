import { db } from '@/lib/db/client'
import { DashboardMetrics } from '@/components/DashboardMetrics'
import { DashboardCharts } from '@/components/DashboardCharts'
import { DashboardAppointments } from '@/components/DashboardAppointments'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard | ChronosApp',
}

async function getMetrics(userId: string) {
  try {
    const [totalCustomers, totalAppointments, totalServices] = await Promise.all([
      db.customers.count({ where: { userId } }),
      db.appointments.count({ where: { userId } }),
      db.services.count({ where: { userId } })
    ])

    return {
      totalCustomers,
      totalAppointments,
      totalServices,
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return {
      totalCustomers: 0,
      totalAppointments: 0,
      totalServices: 0,
    }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  const metrics = await getMetrics(session.user.id)

  return (
    <div className="flex flex-col gap-8">
      <DashboardMetrics metrics={metrics} />
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <DashboardCharts />
        <DashboardAppointments />
      </div>
    </div>
  )
}
