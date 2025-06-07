import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, User } from 'lucide-react'

const appointments = [
  {
    id: '1',
    customer: 'João Silva',
    service: 'Corte de Cabelo',
    date: new Date(),
    time: '14:30',
    status: 'scheduled',
  },
  {
    id: '2',
    customer: 'Maria Santos',
    service: 'Manicure',
    date: new Date(),
    time: '15:00',
    status: 'scheduled',
  },
  {
    id: '3',
    customer: 'Pedro Oliveira',
    service: 'Barba',
    date: new Date(),
    time: '16:00',
    status: 'scheduled',
  },
]

export function DashboardAppointments() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Próximos Agendamentos
      </h2>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg"
          >
            <div className="bg-blue-50 rounded-lg p-3">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {appointment.service}
              </p>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  {appointment.customer}
                </div>
                <div className="flex items-center">
                  <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  {format(appointment.date, "d 'de' MMMM", { locale: ptBR })} às{' '}
                  {appointment.time}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
