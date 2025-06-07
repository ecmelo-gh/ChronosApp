'use client'

import { CustomerForm } from '@/components/customers/customer-form'

export default function NewCustomerPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Novo Cliente</h1>
        <p className="text-sm text-gray-600">
          Preencha os dados do novo cliente
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <CustomerForm />
      </div>
    </div>
  )
}
