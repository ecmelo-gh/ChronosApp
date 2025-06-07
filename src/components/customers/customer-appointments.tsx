'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface Appointment {
  id: string
  date: string
  service: string
  professional: string
  status: 'scheduled' | 'completed' | 'canceled'
  price: number
}

interface CustomerAppointmentsProps {
  customerId: string
}

export function CustomerAppointments({ customerId }: CustomerAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAppointments() {
      try {
        const res = await fetch(`/api/customers/${customerId}/appointments`)
        if (!res.ok) {
          throw new Error('Failed to fetch appointments')
        }
        const data = await res.json()
        setAppointments(data)
      } catch (error) {
        console.error('Error loading appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [customerId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-gray-500">Nenhum agendamento encontrado</p>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Profissional</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                {format(new Date(appointment.date), "PPp", { locale: ptBR })}
              </TableCell>
              <TableCell>{appointment.service}</TableCell>
              <TableCell>{appointment.professional}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    appointment.status === 'completed'
                      ? 'success'
                      : appointment.status === 'canceled'
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {appointment.status === 'completed'
                    ? 'Concluído'
                    : appointment.status === 'canceled'
                    ? 'Cancelado'
                    : 'Agendado'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(appointment.price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
