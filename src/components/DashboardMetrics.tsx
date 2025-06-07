import { Users, Calendar, Scissors, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// Atomic Design: Atoms
const MetricIcon = ({ icon: Icon, color }: { icon: any; color: string }) => (
  <div className={cn('rounded-lg p-3 text-white flex items-center justify-center', color)}>
    <Icon className="h-6 w-6" />
  </div>
)

const MetricValue = ({ value, formatter }: { value: number; formatter: (n: number) => string }) => (
  <p className="text-2xl font-semibold text-gray-900 font-inter">{formatter(value)}</p>
)

const MetricLabel = ({ label }: { label: string }) => (
  <p className="text-sm font-medium text-secondary-600 font-inter">{label}</p>
)

interface DashboardMetricsProps {
  metrics: {
    totalCustomers: number
    totalAppointments: number
    totalServices: number
  }
}

const cards = [
  {
    name: 'Total de Clientes',
    value: (n: number) => n.toLocaleString('pt-BR'),
    icon: Users,
    color: 'bg-primary-500',
  },
  {
    name: 'Total de Agendamentos',
    value: (n: number) => n.toLocaleString('pt-BR'),
    icon: Calendar,
    color: 'bg-primary-600',
  },
  {
    name: 'Total de Serviços',
    value: (n: number) => n.toLocaleString('pt-BR'),
    icon: Scissors,
    color: 'bg-primary-700',
  },
  {
    name: 'Crescimento',
    value: (n: number) => `${n.toLocaleString('pt-BR')}%`,
    icon: TrendingUp,
    color: 'bg-primary-800',
  },
]

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const values = {
    totalCustomers: metrics.totalCustomers,
    totalAppointments: metrics.totalAppointments,
    totalServices: metrics.totalServices,
    growth: 15, // TODO: Calculate actual growth
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const value = Object.values(values)[i]
        return (
          <div
            key={card.name}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 flex items-start space-x-4"
          >
            <MetricIcon icon={card.icon} color={card.color} />
            <div>
              <MetricLabel label={card.name} />
              <MetricValue value={value} formatter={card.value} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
