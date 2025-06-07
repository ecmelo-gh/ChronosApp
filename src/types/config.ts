// Tipos para configurações de tema
export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  logo?: {
    url: string
    width: number
    height: number
  }
  fonts: {
    heading: string
    body: string
  }
}

// Tipos para labels personalizados
export interface LabelsConfig {
  professional: string      // ex: "Barbeiro", "Cabeleireiro", "Profissional"
  service: string          // ex: "Corte", "Serviço", "Procedimento"
  client: string          // ex: "Cliente", "Paciente"
  appointment: string     // ex: "Horário", "Agendamento", "Consulta"
}

// Tipos para configurações operacionais
export interface OperationalConfig {
  schedule: {
    weekdays: boolean
    saturday: boolean
    sunday: boolean
    defaultSlotDuration: number  // minutos
    startTime: string           // ex: "09:00"
    endTime: string            // ex: "18:00"
    breakTime?: {
      start: string
      end: string
    }
  }
  services: {
    categories: string[]
    defaultDuration: number
    allowMultipleServices: boolean
    requiresConsultation?: boolean
  }
  notifications: {
    email: boolean
    sms: boolean
    whatsapp: boolean
    reminderHours: number[]  // ex: [24, 2] = lembrete 24h e 2h antes
  }
}

// Configuração completa do estabelecimento
export interface EstablishmentConfig {
  theme: ThemeConfig
  labels: LabelsConfig
  operational: OperationalConfig
  features: {
    onlineBooking: boolean
    waitingList: boolean
    giftCards: boolean
    loyaltyProgram: boolean
    reviews: boolean
  }
}

// Configurações padrão por tipo de negócio
export const defaultConfigs: Record<BusinessType, Partial<EstablishmentConfig>> = {
  BARBERSHOP: {
    labels: {
      professional: "Barbeiro",
      service: "Corte",
      client: "Cliente",
      appointment: "Horário"
    },
    theme: {
      colors: {
        primary: "#2C3E50",
        secondary: "#34495E",
        accent: "#E74C3C",
        background: "#FFFFFF",
        text: "#2C3E50"
      },
      fonts: {
        heading: "Oswald",
        body: "Inter"
      }
    }
  },
  SALON: {
    labels: {
      professional: "Cabeleireiro",
      service: "Serviço",
      client: "Cliente",
      appointment: "Agendamento"
    },
    theme: {
      colors: {
        primary: "#FF69B4",
        secondary: "#FFC0CB",
        accent: "#FF1493",
        background: "#FFFFFF",
        text: "#333333"
      },
      fonts: {
        heading: "Playfair Display",
        body: "Roboto"
      }
    }
  },
  AESTHETIC_CLINIC: {
    labels: {
      professional: "Esteticista",
      service: "Procedimento",
      client: "Paciente",
      appointment: "Consulta"
    },
    theme: {
      colors: {
        primary: "#4CAF50",
        secondary: "#81C784",
        accent: "#2E7D32",
        background: "#FFFFFF",
        text: "#1B5E20"
      },
      fonts: {
        heading: "Montserrat",
        body: "Lato"
      }
    }
  }
}

export type BusinessType = 'BARBERSHOP' | 'SALON' | 'AESTHETIC_CLINIC'
