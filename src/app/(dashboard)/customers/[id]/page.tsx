'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Customer } from '@/lib/validations/customer'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomerInfo } from '@/components/customers/customer-info'
import { CustomerAppointments } from '@/components/customers/customer-appointments'
import { CustomerServices } from '@/components/customers/customer-services'

export default function CustomerDetailsPage() {
  const params = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCustomer() {
      try {
        const res = await fetch(`/api/customers/${params.id}`)
        if (!res.ok) {
          throw new Error('Failed to fetch customer')
        }
        const data = await res.json()
        setCustomer(data)
      } catch (error) {
        console.error('Error loading customer:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCustomer()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Cliente não encontrado</p>
          <p className="mt-2 text-sm text-gray-600">
            O cliente que você está procurando não existe ou foi removido
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <p className="text-sm text-gray-600">
          Cliente desde {format(new Date(customer.created_at), 'PP', { locale: ptBR })}
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <CustomerInfo customer={customer} />
        </Card>

        <Tabs defaultValue="appointments" className="w-full">
          <TabsList>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
          </TabsList>
          <TabsContent value="appointments">
            <Card className="p-6">
              <CustomerAppointments customerId={customer.id} />
            </Card>
          </TabsContent>
          <TabsContent value="services">
            <Card className="p-6">
              <CustomerServices customerId={customer.id} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
