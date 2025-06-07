import { z } from 'zod'
import { redis } from '@/lib/redis'
import { createAuditLog } from '@/lib/audit'

// Schemas otimizados
const messageSchema = z.object({
  to: z.string(),
  type: z.enum(['TEXT', 'TEMPLATE', 'MEDIA']),
  content: z.string(),
  templateData: z.record(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
})

type WhatsAppMessage = z.infer<typeof messageSchema>

// Cache keys otimizadas
const CACHE_KEYS = {
  messageQueue: 'whatsapp:queue',
  rateLimit: (number: string) => `whatsapp:rate:${number}`,
  template: (name: string) => `whatsapp:template:${name}`
}

// Rate limits otimizados
const RATE_LIMITS = {
  messages: { window: 24 * 60 * 60, limit: 1000 }, // 1000/day
  templates: { window: 60 * 60, limit: 100 } // 100/hour
}

export class WhatsAppService {
  private static instance: WhatsAppService
  private queueEnabled: boolean

  private constructor() {
    this.queueEnabled = process.env.ENABLE_WHATSAPP_QUEUE === 'true'
  }

  static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService()
    }
    return WhatsAppService.instance
  }

  // Envio otimizado de mensagens
  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      // Validar mensagem
      const validatedMessage = messageSchema.parse(message)

      // Verificar rate limit
      const canSend = await this.checkRateLimit(validatedMessage.to)
      if (!canSend) {
        throw new Error('Rate limit exceeded')
      }

      // Enviar ou enfileirar
      if (this.queueEnabled) {
        await this.queueMessage(validatedMessage)
      } else {
        await this.sendDirectMessage(validatedMessage)
      }

      // Log assíncrono
      this.logMessage(validatedMessage).catch(console.error)

      return true
    } catch (error) {
      console.error('WhatsApp error:', error)
      return false
    }
  }

  // Rate limiting otimizado
  private async checkRateLimit(number: string): Promise<boolean> {
    const key = CACHE_KEYS.rateLimit(number)
    const count = await redis.incr(key)

    if (count === 1) {
      await redis.expire(key, RATE_LIMITS.messages.window)
    }

    return count <= RATE_LIMITS.messages.limit
  }

  // Queue otimizada
  private async queueMessage(message: WhatsAppMessage): Promise<void> {
    await redis.lpush(
      CACHE_KEYS.messageQueue,
      JSON.stringify({
        ...message,
        timestamp: Date.now(),
        retries: 0
      })
    )
  }

  // Envio direto otimizado
  private async sendDirectMessage(message: WhatsAppMessage): Promise<void> {
    const response = await fetch(process.env.WHATSAPP_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
      },
      body: JSON.stringify(message)
    })

    if (!response.ok) {
      throw new Error('Failed to send WhatsApp message')
    }
  }

  // Log otimizado
  private async logMessage(message: WhatsAppMessage): Promise<void> {
    await createAuditLog({
      action: 'SEND_MESSAGE',
      entityType: 'WHATSAPP',
      entityId: message.to,
      data: {
        type: message.type,
        timestamp: new Date().toISOString()
      }
    })
  }
}
