'use client'

import Link from 'next/link'
import { Customer } from '@/lib/validations/customer'
import { Button } from '@/components/ui/button'
import { PencilIcon } from 'lucide-react'
import { CustomerPhotoUpload } from './customer-photo-upload'

interface CustomerInfoProps {
  customer: Customer
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  async function handlePhotoUploaded(url: string) {
    // Aqui você pode atualizar o estado global ou recarregar os dados do cliente
    window.location.reload()
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-6">
          <CustomerPhotoUpload
            customerId={customer.id || ''}
            currentPhotoUrl={customer.imageUrl}
            onPhotoUploaded={handlePhotoUploaded}
          />
          <div>
            <h2 className="text-lg font-semibold">Informações Básicas</h2>
            <p className="text-sm text-gray-500">
              Clique na câmera para alterar a foto
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/customers/${customer.id}/edit`}>
            <PencilIcon className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-500">Nome</p>
          <p className="mt-1">{customer.name}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="mt-1">{customer.email}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Telefone</p>
          <p className="mt-1">{customer.phone}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">CPF</p>
          <p className="mt-1">{customer.cpf}</p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-gray-500">Endereço</p>
          <p className="mt-1">
            {customer.address.street}, {customer.address.number}
            {customer.address.complement && ` - ${customer.address.complement}`}
            <br />
            {customer.address.neighborhood} - {customer.address.city}/{customer.address.state}
            <br />
            CEP: {customer.address.zipCode}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-gray-500">Total de Agendamentos</p>
          <p className="mt-1 text-2xl font-semibold">0</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Serviços Realizados</p>
          <p className="mt-1 text-2xl font-semibold">0</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Valor Total</p>
          <p className="mt-1 text-2xl font-semibold">R$ 0,00</p>
        </div>
      </div>
    </div>
  )
}
