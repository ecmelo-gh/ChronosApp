'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Container } from '@/components/layout/Container'
import { CustomerForm } from '@/components/forms/CustomerForm'
import type { CustomerFormData } from '@/lib/validations/schemas'
import { dbActions } from '@/lib/db/client'

export default function NewCustomerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true)
      
      // Create customer using our type-safe database client
      await dbActions.customers.create({
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      })

      toast.success('Cliente cadastrado com sucesso!')
      router.push('/customers')
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error('Erro ao cadastrar cliente. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container size="sm">
      <h1 className="text-2xl font-semibold mb-6">Novo Cliente</h1>
      <CustomerForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Container>
  )
}
