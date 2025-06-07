import { useState } from 'react'
import { useCustomers } from '@/hooks/useCustomers'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, Plus, Share2, Trash2 } from 'lucide-react'

interface ReferralSectionProps {
  customerId: string
}

export function ReferralSection({ customerId }: ReferralSectionProps) {
  const { useReferrals } = useCustomers()
  const {
    getReferrals,
    createReferral,
    updateReferral,
    deleteReferral
  } = useReferrals(customerId)

  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    referredName: '',
    referredPhone: '',
    referredEmail: '',
    notes: '',
    source: 'APP'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createReferral.mutateAsync(formData)
    setIsOpen(false)
    setFormData({
      referredName: '',
      referredPhone: '',
      referredEmail: '',
      notes: '',
      source: 'APP'
    })
  }

  const handleStatusChange = async (
    referralId: string,
    status: string
  ) => {
    await updateReferral.mutateAsync({ referralId, status })
  }

  const handleDelete = async (referralId: string) => {
    if (
      window.confirm('Tem certeza que deseja remover esta indicação?')
    ) {
      await deleteReferral.mutateAsync(referralId)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONVERTED':
        return 'bg-green-100 text-green-800'
      case 'LOST':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (getReferrals.isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (getReferrals.error) {
    return (
      <div className="p-4 text-red-500">
        Erro ao carregar indicações
      </div>
    )
  }

  const { referrals, stats } = getReferrals.data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Indicações</CardTitle>
            <CardDescription>
              Gerencie as indicações do cliente
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Indicação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Indicação</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="referredName">Nome</Label>
                  <Input
                    id="referredName"
                    value={formData.referredName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        referredName: e.target.value
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="referredPhone">Telefone</Label>
                  <Input
                    id="referredPhone"
                    value={formData.referredPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        referredPhone: e.target.value
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="referredEmail">Email</Label>
                  <Input
                    id="referredEmail"
                    type="email"
                    value={formData.referredEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        referredEmail: e.target.value
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="source">Origem</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) =>
                      setFormData({ ...formData, source: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="APP">Aplicativo</SelectItem>
                      <SelectItem value="OTHER">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notes: e.target.value
                      })
                    }
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createReferral.isLoading}
                  className="w-full"
                >
                  {createReferral.isLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Salvar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Total de Indicações
              </CardTitle>
              <p className="text-2xl font-bold">
                {stats.totalReferrals}
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Convertidas</CardTitle>
              <p className="text-2xl font-bold">
                {stats.convertedReferrals}
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Taxa de Conversão
              </CardTitle>
              <p className="text-2xl font-bold">
                {stats.conversionRate.toFixed(1)}%
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Bônus Disponível
              </CardTitle>
              <p className="text-2xl font-bold">
                {stats.bonusPoints} pts
              </p>
            </CardHeader>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((referral: any) => (
              <TableRow key={referral.id}>
                <TableCell>{referral.referredName}</TableCell>
                <TableCell>
                  <div>{referral.referredPhone}</div>
                  {referral.referredEmail && (
                    <div className="text-sm text-gray-500">
                      {referral.referredEmail}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {referral.source === 'WHATSAPP'
                      ? 'WhatsApp'
                      : referral.source === 'EMAIL'
                      ? 'Email'
                      : referral.source === 'APP'
                      ? 'Aplicativo'
                      : 'Outro'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(referral.createdAt), 'PPp', {
                    locale: ptBR
                  })}
                </TableCell>
                <TableCell>
                  <Select
                    value={referral.status}
                    onValueChange={(value) =>
                      handleStatusChange(referral.id, value)
                    }
                    disabled={updateReferral.isLoading}
                  >
                    <SelectTrigger
                      className={`w-[140px] ${getStatusColor(
                        referral.status
                      )}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="CONVERTED">
                        Convertido
                      </SelectItem>
                      <SelectItem value="LOST">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        // TODO: Implementar envio de WhatsApp
                        window.open(
                          `https://wa.me/${referral.referredPhone}`,
                          '_blank'
                        )
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(referral.id)}
                      disabled={deleteReferral.isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
