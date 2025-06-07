import { redis } from './redis'
import { z } from 'zod'

// Schema de eventos otimizado
const eventSchema = z.object({
  type: z.enum([
    'FEEDBACK_CREATED',
    'MESSAGE_SENT',
    'APPOINTMENT_SCHEDULED',
    'RATING_UPDATED',
    'CUSTOMER_UPDATED'
  ]),
  payload: z.record(z.unknown()),
  metadata: z.object({
    timestamp: z.number(),
    source: z.string(),
    version: z.number()
  })
})

type SystemEvent = z.infer<typeof eventSchema>

// Chaves de cache otimizadas
const EVENT_KEYS = {
  stream: 'events:stream',
  processed: (id: string) => `events:processed:${id}`,
  failed: (id: string) => `events:failed:${id}`
}

export class EventBus {
  private static instance: EventBus
  private subscribers: Map<string, Set<(event: SystemEvent) => Promise<void>>>

  private constructor() {
    this.subscribers = new Map()
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  // Publicação otimizada de eventos
  async publish(event: SystemEvent): Promise<void> {
    try {
      // Validar evento
      const validatedEvent = eventSchema.parse({
        ...event,
        metadata: {
          ...event.metadata,
          timestamp: Date.now(),
          version: 1
        }
      })

      // Publicar no Redis Stream
      await redis.xadd(
        EVENT_KEYS.stream,
        '*',
        'data',
        JSON.stringify(validatedEvent)
      )

      // Notificar subscribers em memória
      const subscribers = this.subscribers.get(event.type) || new Set()
      await Promise.allSettled(
        Array.from(subscribers).map(callback => 
          callback(validatedEvent).catch(console.error)
        )
      )
    } catch (error) {
      console.error('Event publish error:', error)
      throw error
    }
  }

  // Subscrição otimizada
  subscribe(
    eventType: SystemEvent['type'],
    callback: (event: SystemEvent) => Promise<void>
  ): () => void {
    const subscribers = this.subscribers.get(eventType) || new Set()
    subscribers.add(callback)
    this.subscribers.set(eventType, subscribers)

    // Retornar função de cleanup
    return () => {
      const subscribers = this.subscribers.get(eventType)
      if (subscribers) {
        subscribers.delete(callback)
        if (subscribers.size === 0) {
          this.subscribers.delete(eventType)
        }
      }
    }
  }

  // Processamento em batch otimizado
  async processBatch(batchSize: number = 100): Promise<number> {
    let processed = 0

    try {
      // Ler eventos em batch
      const events = await redis.xrange(
        EVENT_KEYS.stream,
        '-',
        '+',
        'COUNT',
        batchSize
      )

      for (const [id, [_, data]] of events) {
        try {
          const event = JSON.parse(data) as SystemEvent
          
          // Processar subscribers
          const subscribers = this.subscribers.get(event.type) || new Set()
          await Promise.all(
            Array.from(subscribers).map(callback => callback(event))
          )

          // Marcar como processado
          await redis.set(EVENT_KEYS.processed(id), '1', 'EX', 86400) // 24h TTL
          processed++
        } catch (error) {
          // Marcar como falho
          await redis.set(
            EVENT_KEYS.failed(id),
            JSON.stringify(error),
            'EX',
            86400
          )
          console.error(`Failed to process event ${id}:`, error)
        }
      }
    } catch (error) {
      console.error('Batch processing error:', error)
    }

    return processed
  }

  // Limpeza otimizada
  async cleanup(maxAge: number = 7 * 24 * 60 * 60): Promise<void> {
    const cutoff = Date.now() - maxAge * 1000
    await redis.xtrim(EVENT_KEYS.stream, 'MINID', cutoff)
  }
}
