import { useState } from 'react'
import { useCustomer } from '@/hooks/useCustomers'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

interface Professional {
  id: string
  name: string
  imageUrl?: string
  role: string
}

interface Visit {
  id: string
  date: Date
  professional: Professional
  services: string[]
}

interface ProfessionalPreferencesProps {
  customerId: string
  professionals: Professional[]
  recentVisits: Visit[]
}

export function ProfessionalPreferences({
  customerId,
  professionals,
  recentVisits
}: ProfessionalPreferencesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateCustomer, customer } = useCustomer(customerId)

  const handlePreferredProfessionalChange = async (professionalId: string) => {
    try {
      setIsSubmitting(true)
      await updateCustomer({
        preferredProfessionalId: professionalId
      })
      toast.success('Preferência atualizada com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar preferência')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pegar os 3 últimos profissionais únicos
  const recentProfessionals = recentVisits
    .reduce((acc, visit) => {
      if (!acc.some((p) => p.id === visit.professional.id)) {
        acc.push(visit.professional)
      }
      return acc
    }, [] as Professional[])
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Profissional Preferido */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-medium">Profissional Preferido</h3>
        </div>
        <Select
          value={customer?.preferredProfessionalId || ''}
          onValueChange={handlePreferredProfessionalChange}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um profissional..." />
          </SelectTrigger>
          <SelectContent>
            {professionals.map((professional) => (
              <SelectItem key={professional.id} value={professional.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={professional.imageUrl} />
                    <AvatarFallback>
                      {professional.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{professional.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Últimos Atendimentos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-medium">Últimos Atendimentos</h3>
        </div>
        <div className="grid gap-4">
          {recentVisits.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum atendimento registrado.
            </p>
          ) : (
            recentVisits.slice(0, 3).map((visit) => (
              <div
                key={visit.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={visit.professional.imageUrl} />
                    <AvatarFallback>
                      {visit.professional.name
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{visit.professional.name}</p>
                    <p className="text-sm text-gray-500">
                      {visit.services.join(', ')}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(visit.date, {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
