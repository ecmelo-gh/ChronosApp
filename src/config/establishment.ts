export type EstablishmentConfig = {
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  features: {
    appointments: boolean
    customers: boolean
    services: boolean
    professionals: boolean
    reports: boolean
    settings: boolean
  }
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
  }
  labels: {
    customer: string
    service: string
    professional: string
    appointment: string
  }
}

export const defaultConfig: EstablishmentConfig = {
  name: 'Meu Estabelecimento',
  features: {
    appointments: true,
    customers: true,
    services: true,
    professionals: true,
    reports: true,
    settings: true,
  },
  theme: {
    primaryColor: '#0f172a',
    secondaryColor: '#1e293b',
    accentColor: '#3b82f6',
  },
  labels: {
    customer: 'Cliente',
    service: 'Serviço',
    professional: 'Profissional',
    appointment: 'Agendamento',
  },
}
