import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CustomerStatsProps {
  totalSpent: number
  visitStreak: number
  loyaltyPoints: number
  averageRating: number | null
  totalVisits: number
  lastVisit: Date | null
  totalReferrals: number
  convertedReferrals: number
}

export function CustomerStats({
  totalSpent,
  visitStreak,
  loyaltyPoints,
  averageRating,
  totalVisits,
  lastVisit,
  totalReferrals,
  convertedReferrals
}: CustomerStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Gasto</CardTitle>
          <CardDescription>Soma de todas as visitas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(totalSpent)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sequência</CardTitle>
          <CardDescription>Sequência de visitas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{visitStreak}</p>
          <p className="text-sm text-gray-500">
            {totalVisits} visitas no total
          </p>
          {lastVisit && (
            <p className="text-sm text-gray-500">
              Última visita em{' '}
              {new Date(lastVisit).toLocaleDateString('pt-BR')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pontos</CardTitle>
          <CardDescription>Programa de fidelidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <p className="text-2xl font-bold">{loyaltyPoints}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Avaliação</CardTitle>
          <CardDescription>Média de satisfação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <p className="text-2xl font-bold">
              {averageRating ? averageRating.toFixed(1) : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ticket Médio</CardTitle>
          <CardDescription>Valor médio por visita</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {totalVisits > 0
              ? formatCurrency(totalSpent / totalVisits)
              : formatCurrency(0)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frequência</CardTitle>
          <CardDescription>Média de visitas por mês</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {lastVisit
              ? (
                  totalVisits /
                  (Math.max(
                    1,
                    (new Date().getTime() - new Date(lastVisit).getTime()) /
                      (1000 * 60 * 60 * 24 * 30)
                  )
                ).toFixed(1)
              : '0'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Indicações</CardTitle>
          <CardDescription>Total de referências</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalReferrals}</p>
          <p className="text-sm text-gray-500">
            {convertedReferrals} convertidas (
            {totalReferrals > 0
              ? ((convertedReferrals / totalReferrals) * 100).toFixed(1)
              : '0'}
            %)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bônus</CardTitle>
          <CardDescription>Pontos por indicações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <p className="text-2xl font-bold">
              {convertedReferrals * 100}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
