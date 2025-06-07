import { env } from '@/env'

type WhatsAppTemplate = 
  | 'reward_redemption' 
  | 'redemption_confirmed' 
  | 'redemption_cancelled'
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'appointment_cancellation'
  | 'appointment_rescheduling'

interface WhatsAppMessage {
  to: string
  template: WhatsAppTemplate
  params: Record<string, string | number>
}

const templates = {
  appointment_confirmation: {
    name: 'appointment_confirmation',
    language: 'pt_BR',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{customerName}}' },
          { type: 'text', text: '{{serviceName}}' },
          { type: 'text', text: '{{appointmentDate}}' },
          { type: 'text', text: '{{appointmentTime}}' },
          { type: 'text', text: '{{professionalName}}' },
          { type: 'text', text: '{{establishmentName}}' },
          { type: 'text', text: '{{establishmentAddress}}' }
        ]
      }
    ]
  },
  appointment_reminder: {
    name: 'appointment_reminder',
    language: 'pt_BR',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{customerName}}' },
          { type: 'text', text: '{{serviceName}}' },
          { type: 'text', text: '{{appointmentDate}}' },
          { type: 'text', text: '{{appointmentTime}}' }
        ]
      }
    ]
  },
  appointment_cancellation: {
    name: 'appointment_cancellation',
    language: 'pt_BR',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{customerName}}' },
          { type: 'text', text: '{{serviceName}}' },
          { type: 'text', text: '{{appointmentDate}}' },
          { type: 'text', text: '{{appointmentTime}}' },
          { type: 'text', text: '{{cancellationReason}}' }
        ]
      }
    ]
  },
  appointment_rescheduling: {
    name: 'appointment_rescheduling',
    language: 'pt_BR',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{customerName}}' },
          { type: 'text', text: '{{serviceName}}' },
          { type: 'text', text: '{{oldDate}}' },
          { type: 'text', text: '{{oldTime}}' },
          { type: 'text', text: '{{newDate}}' },
          { type: 'text', text: '{{newTime}}' }
        ]
      }
    ]
  },
  reward_redemption: {
    name: 'reward_redemption',
    language: 'pt_BR',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{customerName}}' },
          { type: 'text', text: '{{rewardTitle}}' },
          { type: 'text', text: '{{rewardPoints}}' },
          { type: 'text', text: '{{rewardValue}}' },
          { type: 'text', text: '{{redemptionId}}' }
        ]
      }
    ]
  },
  redemption_confirmed: {
    name: 'redemption_confirmed',
    language: 'pt_BR',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{customerName}}' },
          { type: 'text', text: '{{rewardTitle}}' },
          { type: 'text', text: '{{redemptionId}}' },
          { type: 'text', text: '{{redemptionDate}}' }
        ]
      }
    ]
  },
  redemption_cancelled: {
    name: 'redemption_cancelled',
    language: 'pt_BR',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{customerName}}' },
          { type: 'text', text: '{{rewardTitle}}' },
          { type: 'text', text: '{{redemptionId}}' }
        ]
      }
    ]
  }
}

export async function sendWhatsAppMessage({ to, template, params }: WhatsAppMessage) {
  try {
    // Formatar número do WhatsApp (remover caracteres especiais e adicionar código do país)
    const formattedNumber = to.replace(/\D/g, '')
    const phoneNumber = formattedNumber.startsWith('55') ? formattedNumber : `55${formattedNumber}`

    const response = await fetch(`https://graph.facebook.com/v18.0/${env.WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: templates[template]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`WhatsApp API error: ${error.message || 'Unknown error'}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    // Não lançar erro para não interromper o fluxo principal
    return null
  }
}
