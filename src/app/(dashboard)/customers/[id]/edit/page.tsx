'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CustomerForm } from '@/components/customers/customer-form'
import { Customer } from '@/lib/validations/customer'

export default function EditCustomerPage() {
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
        alert('Erro ao carregar cliente')
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
        <h1 className="text-2xl font-bold">Editar Cliente</h1>
        <p className="text-sm text-gray-600">
          Atualize os dados do cliente
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <CustomerForm initialData={customer} />
      </div>
    </div>
  )
}
