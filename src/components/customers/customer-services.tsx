'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Service {
  id: string
  name: string
  totalAppointments: number
  lastDate: string | null
  totalSpent: number
}

interface CustomerServicesProps {
  customerId: string
}

export function CustomerServices({ customerId }: CustomerServicesProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch(`/api/customers/${customerId}/services`)
        if (!res.ok) {
          throw new Error('Failed to fetch services')
        }
        const data = await res.json()
        setServices(data)
      } catch (error) {
        console.error('Error loading services:', error)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [customerId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-gray-500">Nenhum serviço encontrado</p>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Serviço</TableHead>
            <TableHead className="text-center">Total de Agendamentos</TableHead>
            <TableHead>Última Data</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>{service.name}</TableCell>
              <TableCell className="text-center">
                {service.totalAppointments}
              </TableCell>
              <TableCell>
                {service.lastDate
                  ? new Date(service.lastDate).toLocaleDateString('pt-BR')
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(service.totalSpent)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
