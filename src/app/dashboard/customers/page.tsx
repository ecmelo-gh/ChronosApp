'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  ChevronDown, 
  Plus, 
  Search, 
  MoreVertical,
  Star,
  MessageCircle,
  UserPlus,
  Calendar,
  Ban
} from 'lucide-react'
import { Customer, Visit } from '@/types/customer'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CustomerWithStats extends Customer {
  lastVisit?: Visit
  totalSpent: number
  loyaltyPoints: number
  visitStreak: number
}

export default function CustomersPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<keyof CustomerWithStats>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active')

  // TODO: Substituir por chamada real à API
  const customers: CustomerWithStats[] = []

  const filteredCustomers = customers
    .filter((customer) => {
      if (filter === 'active' && !customer.isActive) return false
      if (filter === 'inactive' && customer.isActive) return false

      if (!search) return true

      const searchLower = search.toLowerCase()
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone1.includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.document?.includes(searchLower)
      )
    })
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]

      if (aValue === bValue) return 0
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      const comparison = aValue < bValue ? -1 : 1
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleSort = (field: keyof CustomerWithStats) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleAction = async (action: string, customer: CustomerWithStats) => {
    switch (action) {
      case 'edit':
        router.push(`/dashboard/customers/${customer.id}`)
        break
      case 'schedule':
        router.push(`/dashboard/schedule?customer=${customer.id}`)
        break
      case 'loyalty':
        router.push(`/dashboard/customers/${customer.id}/loyalty`)
        break
      case 'feedback':
        router.push(`/dashboard/customers/${customer.id}/feedback`)
        break
      case 'referral':
        router.push(`/dashboard/customers/${customer.id}/referral`)
        break
      case 'deactivate':
        // TODO: Implementar desativação
        break
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-gray-500">
            Gerencie seus clientes e acompanhe seu histórico
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/customers/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Status
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter('all')}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('active')}>
              Ativos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('inactive')}>
              Inativos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                Nome
              </TableHead>
              <TableHead>Contato</TableHead>
              <TableHead onClick={() => handleSort('lastVisit')} className="cursor-pointer">
                Última Visita
              </TableHead>
              <TableHead onClick={() => handleSort('totalSpent')} className="cursor-pointer">
                Total Gasto
              </TableHead>
              <TableHead onClick={() => handleSort('loyaltyPoints')} className="cursor-pointer">
                Pontos
              </TableHead>
              <TableHead onClick={() => handleSort('visitStreak')} className="cursor-pointer">
                Sequência
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {customer.photo ? (
                      <img
                        src={customer.photo.url}
                        alt={customer.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm text-gray-600">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {customer.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{customer.phone1}</div>
                    {customer.email && (
                      <div className="text-xs text-gray-500">{customer.email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.lastVisit ? (
                    <div className="space-y-1">
                      <div className="text-sm">
                        {formatDistanceToNow(customer.lastVisit.date, {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        R$ {customer.lastVisit.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Nunca visitou</span>
                  )}
                </TableCell>
                <TableCell>R$ {customer.totalSpent.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    {customer.loyaltyPoints}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={customer.visitStreak >= 5 ? 'success' : 'secondary'}
                  >
                    {customer.visitStreak} visitas
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={customer.isActive ? 'success' : 'destructive'}
                  >
                    {customer.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleAction('edit', customer)}
                      >
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction('schedule', customer)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction('loyalty', customer)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Fidelidade
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction('feedback', customer)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Feedback
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction('referral', customer)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Indicação
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction('deactivate', customer)}
                        className="text-red-600"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        {customer.isActive ? 'Desativar' : 'Ativar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
