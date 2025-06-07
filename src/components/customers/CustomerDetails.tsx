'use client'

import { useState } from 'react'
import { Customer, Appointment } from '@prisma/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomerForm } from './CustomerForm'
import { AppointmentList } from './AppointmentList'

interface CustomerDetailsProps {
  customer: Customer & {
    appointments: (Appointment & {
      service: {
        name: string
        price: number
      }
    })[]
  }
}

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  const [activeTab, setActiveTab] = useState('details')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="details">Detalhes</TabsTrigger>
        <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <CustomerForm customer={customer} />
      </TabsContent>

      <TabsContent value="appointments">
        <AppointmentList appointments={customer.appointments} />
      </TabsContent>
    </Tabs>
  )
}
