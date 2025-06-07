'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Customer } from '@/lib/validations/customer'
import { ImportGoogleContacts } from '@/components/customers/import-google-contacts'
import { useToast } from '@/components/ui/use-toast'
import { Row } from '@tanstack/react-table'

async function getCustomers() {
  const res = await fetch('/api/customers')
  if (!res.ok) {
    throw new Error('Failed to fetch customers')
  }
  return res.json()
}

export default function CustomersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const columns = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
    },
    {
      accessorKey: 'birthDate',
      header: 'Data de Nascimento',
      cell: ({ row }: { row: Row<Customer> }) => {
        const date = row.getValue('birthDate') as string
        if (!date) return null
        return format(new Date(date), "d 'de' MMMM", { locale: ptBR })
      },
    },
    {
      id: 'actions',
      cell: ({ row }: { row: Row<Customer> }) => {
        const customer = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/customers/${customer.id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => customer.id && handleDelete(customer.id)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete customer')

      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      })

      router.refresh()
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o cliente. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-gray-600">
            Gerencie os clientes do seu estabelecimento
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ImportGoogleContacts />
          <Button onClick={() => router.push('/customers/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={[]} searchKey="name" />
    </div>
  )
}
