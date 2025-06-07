import { BusinessType, ThemeConfig } from '@/types/config'

interface Template {
  id: string
  name: string
  description: string
  preview: string // URL da imagem de preview
  theme: ThemeConfig
  businessTypes: BusinessType[] // Tipos de negócio compatíveis
}

export const templates: Template[] = [
  {
    id: 'modern-dark',
    name: 'Moderno Escuro',
    description: 'Design minimalista com tons escuros e elegantes',
    preview: '/templates/modern-dark.jpg',
    businessTypes: ['BARBERSHOP', 'SALON'],
    theme: {
      colors: {
        primary: '#1A1A1A',
        secondary: '#333333',
        accent: '#FFD700',
        background: '#FFFFFF',
        text: '#1A1A1A'
      },
      fonts: {
        heading: 'Montserrat',
        body: 'Inter'
      }
    }
  },
  {
    id: 'luxury-spa',
    name: 'Spa Luxuoso',
    description: 'Cores suaves e elegantes para um ambiente relaxante',
    preview: '/templates/luxury-spa.jpg',
    businessTypes: ['AESTHETIC_CLINIC', 'SALON'],
    theme: {
      colors: {
        primary: '#C9A8A8',
        secondary: '#E5D1D1',
        accent: '#8B4513',
        background: '#FFF5F5',
        text: '#4A3636'
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Lato'
      }
    }
  },
  {
    id: 'urban-style',
    name: 'Estilo Urbano',
    description: 'Visual moderno e despojado para barbearias',
    preview: '/templates/urban-style.jpg',
    businessTypes: ['BARBERSHOP'],
    theme: {
      colors: {
        primary: '#2B2D42',
        secondary: '#8D99AE',
        accent: '#EF233C',
        background: '#EDF2F4',
        text: '#2B2D42'
      },
      fonts: {
        heading: 'Oswald',
        body: 'Roboto'
      }
    }
  },
  {
    id: 'clean-clinic',
    name: 'Clínica Clean',
    description: 'Design limpo e profissional para clínicas',
    preview: '/templates/clean-clinic.jpg',
    businessTypes: ['AESTHETIC_CLINIC'],
    theme: {
      colors: {
        primary: '#4ECDC4',
        secondary: '#A2FAE8',
        accent: '#45B7AF',
        background: '#FFFFFF',
        text: '#2C3E50'
      },
      fonts: {
        heading: 'Raleway',
        body: 'Source Sans Pro'
      }
    }
  },
  {
    id: 'glamour',
    name: 'Glamour',
    description: 'Visual sofisticado para salões de beleza',
    preview: '/templates/glamour.jpg',
    businessTypes: ['SALON'],
    theme: {
      colors: {
        primary: '#FF69B4',
        secondary: '#FFC0CB',
        accent: '#FF1493',
        background: '#FFF0F5',
        text: '#4A4A4A'
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Poppins'
      }
    }
  }
]

export function getTemplatesForBusiness(businessType: BusinessType): Template[] {
  return templates.filter(template => 
    template.businessTypes.includes(businessType)
  )
}

export function getTemplateById(id: string): Template | undefined {
  return templates.find(template => template.id === id)
}
