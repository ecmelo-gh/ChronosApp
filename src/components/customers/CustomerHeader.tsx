'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, Ban } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Customer } from '@prisma/client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { toggleCustomerStatus } from '@/app/actions/customer'

interface CustomerHeaderProps {
  customer: Customer
}

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleStatusToggle = () => {
    startTransition(async () => {
      const result = await toggleCustomerStatus(customer.id, customer.status)
      
      if (result.success) {
        toast.success(
          customer.status === 'active' 
            ? 'Cliente desativado com sucesso' 
            : 'Cliente ativado com sucesso'
        )
        router.refresh()
      } else {
        toast.error('Erro ao alterar status do cliente')
      }
    })
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/customers">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {customer.full_name}
          </h1>
          <p className="text-sm text-gray-500">
            Cliente desde{' '}
            {formatDistanceToNow(new Date(customer.created_at), {
              addSuffix: true,
              locale: ptBR
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          asChild
        >
          <Link href={`/dashboard/schedule?customer=${customer.id}`}>
            <Calendar className="w-4 h-4 mr-2" />
            Agendar
          </Link>
        </Button>
        <Button
          variant="destructive"
          onClick={handleStatusToggle}
          disabled={isPending}
        >
          <Ban className="w-4 h-4 mr-2" />
          {customer.status === 'active' ? 'Desativar' : 'Ativar'}
        </Button>
      </div>
    </div>
  )
}
